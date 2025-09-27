from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Email
from .graph import Graph
from .cluster import Cluster
# create a single Graph instance
graph = Graph()

@api_view(['POST'])
def send_email_view(request):
    data = request.data
    email = graph.sendEmail(
        from_addr=data['sender'],
        to_addr=data['receiver'],
        subject=data['subject'],
        body=data['body']
    )
    graph.showgraph()
    return Response({
        "message": "Email sent",
        "email_id": email.email_id,
    })

@api_view(['POST'])
def reply_email_view(request):
    data = request.data
    reply = graph.replyEmail(
        email_id=data['parent_email'],
        from_addr=data['sender'],
        to_addr=data['receiver'],
        body=data['body']
    )
    if not reply:
        return Response({"error": "Original email not found"}, status=404)
    
    graph.showgraph()
    return Response({
        "message": "Reply sent",
        "reply_id": reply.email_id,
    })

@api_view(['POST'])
def forward_email_view(request):
    data = request.data
    fwd = graph.forwardEmail(
        email_id=data['parent_email'],
        from_addr=data['sender'],
        to_addr=data['receiver'],
        body=data['body']
    )
    if not fwd:
        return Response({"error": "Original email not found"}, status=404)
    graph.showgraph()
    return Response({
        "message": "Forward sent",
        "forward_id": fwd.email_id,
    })

@api_view(['GET'])
def view_thread_view(request, root_email_id):
    result = graph.viewThread(root_email_id)
    return Response({
        "root_email_id": root_email_id,
        "emails": result
    })

@api_view(['GET'])
def cluster_emails_view(request):
    cluster = Cluster()
    email_clusters=cluster.cluster_emails(graph)
    return Response({
        "clusters":{str(root):members for root, members in email_clusters.items()}
    })

# emails/views.py
@api_view(['GET'])
def list_emails_view(request):
    emails = Email.objects.all().order_by('-created_at')  # Sort by latest first
    data = [
        {
            "email_id": e.email_id,
            "sender": e.sender,
            "receiver": e.receiver,
            "subject": e.subject,
            "created_at": e.created_at.isoformat() if e.created_at else None,
            "thread_id": e.thread_id
        } for e in emails
    ]
    return Response(data)