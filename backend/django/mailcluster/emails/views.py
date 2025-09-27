# backend/django_mailcluster/emails/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Max

from .models import Email, ThreadCounter
from .cluster import Cluster
from .graph import Graph

# keep a single Graph instance if your graph class needs it
graph = Graph()

def _serialize_email(e: Email):
    return {
        "email_id": e.email_id,
        "sender": e.sender,
        "receiver": e.receiver,
        "subject": e.subject,
        "body": e.body,
        "thread_id": e.thread_id,
        "parent_email_id": e.parent_email.email_id if e.parent_email else None,
        "created_at": e.created_at.isoformat() if e.created_at else None,
    }

def _build_tree_map(emails_qs):
    """
    Given a queryset/list of Email objects, build nodes and attach children,
    returning node_map and list of root nodes (dicts).
    """
    node_map = {}
    for e in emails_qs:
        node_map[e.email_id] = _serialize_email(e)
        node_map[e.email_id]["children"] = []

    roots = []
    for e in emails_qs:
        nid = e.email_id
        parent = e.parent_email.email_id if e.parent_email else None
        if parent and parent in node_map:
            node_map[parent]["children"].append(node_map[nid])
        else:
            roots.append(node_map[nid])
    return node_map, roots


@api_view(['GET'])
def list_emails_view(request):
    emails = Email.objects.all().order_by('-created_at')
    data = [_serialize_email(e) for e in emails]
    return Response(data)


@api_view(['POST'])
def send_email_view(request):
    """
    POST /emails/send/
    Expects: { sender, receiver, subject, body }
    Assigns new thread_id via ThreadCounter.get_next()
    """
    data = request.data
    sender = data.get("sender")
    receiver = data.get("receiver")
    subject = data.get("subject", "")
    body = data.get("body", "")

    if not sender or not receiver:
        return Response({"error": "sender and receiver required"}, status=400)

    # allocate a new thread id atomically
    new_thread_id = ThreadCounter.get_next()

    email = Email.objects.create(
        sender=sender,
        receiver=receiver,
        subject=subject,
        body=body,
        thread_id=new_thread_id,
        parent_email=None,
    )

    # If you prefer graph.sendEmail, you can call it here as well; this DB creation is deterministic.
    return Response({"message": "Email sent", "email_id": email.email_id, "thread_id": new_thread_id})


@api_view(['POST'])
def reply_email_view(request):
    """
    POST /emails/reply/
    Expects: { parent_id, body }
    Reply inherits parent's thread_id and sets parent_email.
    """
    data = request.data
    parent_id = data.get("parent_id") or data.get("parent_email")
    body = data.get("body", "")
    sender_override = data.get("sender", None)
    receiver_override = data.get("receiver", None)

    if not parent_id:
        return Response({"error": "parent_id required"}, status=400)

    parent = get_object_or_404(Email, email_id=parent_id)

    reply = Email.objects.create(
        sender=sender_override if sender_override else parent.receiver,
        receiver=receiver_override if receiver_override else parent.sender,
        subject=f"Re: {parent.subject}" if parent.subject else "Re:",
        body=body,
        thread_id=parent.thread_id,
        parent_email=parent,
    )
    return Response({"message": "Reply sent", "reply_id": reply.email_id, "thread_id": reply.thread_id})


@api_view(['POST'])
def forward_email_view(request):
    """
    POST /emails/forward/
    Expects: { email_id, forward_to, body (optional) }
    """
    data = request.data
    email_id = data.get("email_id") or data.get("parent_id")
    forward_to = data.get("forward_to") or data.get("receiver")
    if not email_id or not forward_to:
        return Response({"error": "email_id and forward_to required"}, status=400)

    orig = get_object_or_404(Email, email_id=email_id)

    forwarded = Email.objects.create(
        sender=orig.sender,
        receiver=forward_to,
        subject=f"Fwd: {orig.subject}" if orig.subject else "Fwd:",
        body=data.get("body", orig.body),
        thread_id=orig.thread_id,
        parent_email=orig,
    )
    return Response({"message": "Forward sent", "forward_id": forwarded.email_id, "thread_id": forwarded.thread_id})


@api_view(['GET'])
def view_thread_view(request, root_email_id):
    """
    GET /emails/thread/<root_email_id>/
    Finds the thread_id for the given root_email_id and returns all emails with that thread_id,
    returned as a hierarchical tree (roots -> children), plus a flat list fallback for older frontends.
    """
    root = get_object_or_404(Email, email_id=root_email_id)
    thread_emails = Email.objects.filter(thread_id=root.thread_id).order_by('created_at')
    node_map, roots = _build_tree_map(thread_emails)

    # Return both shapes to be compatible with different frontends
    return Response({
        "thread_id": root.thread_id,
        "threads": roots,       # hierarchical tree(s)
        "emails": list(node_map.values()),  # flat list if needed
    })


@api_view(['GET'])
def cluster_emails_view(request):
    """
    GET /emails/emailcluster/?reset=true
    - Uses Cluster.cluster_emails() to find clusters (Trie + DSU)
    - Assigns a new thread_id (ThreadCounter.get_next()) to each cluster if:
        * reset=true OR
        * cluster members do not already all share the same thread_id >= 100
    - Returns {"clusters": { <thread_id>: [email_ids...] , ... } }
    """
    reset_flag = request.GET.get('reset', 'false').lower() in ['1', 'true', 'yes']
    clusterer = Cluster()
    try:
        email_clusters = clusterer.cluster_emails(graph)
    except TypeError:
        email_clusters = clusterer.cluster_emails()

    clusters_output = {}

    # We'll do DB updates atomically per-cluster
    for cluster_root, member_ids in email_clusters.items():
        members = list(Email.objects.filter(email_id__in=member_ids))
        if not members:
            continue

        # Check if all members already share same valid thread_id (>= 100)
        existing_thread_ids = set([m.thread_id for m in members if m.thread_id is not None])
        all_have_valid = len(existing_thread_ids) == 1 and next(iter(existing_thread_ids)) >= 100

        if reset_flag or not all_have_valid:
            # assign a new thread id to this cluster
            new_thread_id = ThreadCounter.get_next()
            with transaction.atomic():
                for m in members:
                    m.thread_id = new_thread_id
                    m.save(update_fields=['thread_id'])
            clusters_output[str(new_thread_id)] = [m.email_id for m in members]
        else:
            # keep existing thread id (the one they already share)
            existing_tid = next(iter(existing_thread_ids))
            clusters_output[str(existing_tid)] = [m.email_id for m in members]

    return Response({"clusters": clusters_output})
