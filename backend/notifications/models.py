from django.db import models
from django.conf import settings

class Notification(models.Model):
    KIND_CHOICES = (
        ('budget_alert', 'Budget Alert'),
        ('goal_update', 'Goal Update'),
        ('system', 'System'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    kind = models.CharField(max_length=20, choices=KIND_CHOICES, default='system')
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications_notification'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.kind}] {self.message}"
