from django.db import models
from django.contrib.auth.models import User

class Email(models.Model):
    email_id = models.AutoField(primary_key=True)   # custom explicit ID
    sender = models.CharField(max_length=255)       # or ForeignKey(User) if you have User model
    receiver = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    thread_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent_email = models.ForeignKey(
        "self", null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="children"
    )

    def __str__(self):
        return f"Email {self.email_id}: {self.sender} → {self.receiver}"
