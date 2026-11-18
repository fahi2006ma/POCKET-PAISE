from django.db import models
from django.conf import settings

class Goal(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='goals')
    name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    target_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='active')
    icon = models.CharField(max_length=30, default='Plane')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'goals_goal'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - Target: ₹{self.target_amount} ({self.status})"

class GoalContribution(models.Model):
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='contributions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    note = models.CharField(max_length=200, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'goals_contribution'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"₹{self.amount} to {self.goal.name} on {self.date}"
