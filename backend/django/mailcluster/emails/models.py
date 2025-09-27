# backend/django_mailcluster/emails/models.py
from django.db import models
from django.db import transaction

class Email(models.Model):
    email_id = models.AutoField(primary_key=True)   # explicit ID
    sender = models.CharField(max_length=255)
    receiver = models.CharField(max_length=255)
    subject = models.CharField(max_length=255, blank=True)
    body = models.TextField(blank=True)
    # thread_id is managed by our ThreadCounter/clustering logic
    thread_id = models.IntegerField(default=-1)
    created_at = models.DateTimeField(auto_now_add=True)
    parent_email = models.ForeignKey(
        "self", null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="children"
    )

    def __str__(self):
        return f"Email {self.email_id}: {self.sender} → {self.receiver}"


class ThreadCounter(models.Model):
    """
    Persistent counter stored in DB so thread IDs continue from previous runs and
    won't collide across server restarts. We store current value; get_next increments.
    """
    # we store the last assigned thread id in `current`. default 99 so first assigned is 100.
    current = models.IntegerField(default=99)

    def __str__(self):
        return f"ThreadCounter(current={self.current})"

    @classmethod
    def get_next(cls):
        """
        Atomically increment and return next thread id (safe under concurrency).
        """
        # Use transaction + select_for_update to avoid race conditions
        with transaction.atomic():
            obj, created = cls.objects.select_for_update().get_or_create(pk=1, defaults={"current": 99})
            obj.current = obj.current + 1
            obj.save(update_fields=["current"])
            return obj.current
