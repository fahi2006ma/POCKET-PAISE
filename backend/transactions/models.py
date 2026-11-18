import uuid
from django.db import models
from django.conf import settings
from categories.models import Category

class Transaction(models.Model):
    TYPE_CHOICES = (
        ('expense', 'Expense'),
        ('income', 'Income'),
    )

    PAYMENT_METHOD_CHOICES = (
        ('cash', 'Cash'),
        ('upi', 'UPI'),
        ('card', 'Card'),
        ('netbanking', 'Net Banking'),
        ('other', 'Other'),
    )

    RECURRENCE_CHOICES = (
        ('', 'None'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions', db_index=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='transactions')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='expense')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    title = models.CharField(max_length=100)
    notes = models.TextField(blank=True, null=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='upi')
    date_time = models.DateTimeField(db_index=True)
    is_recurring = models.BooleanField(default=False)
    recurrence = models.CharField(max_length=10, choices=RECURRENCE_CHOICES, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transactions_transaction'
        ordering = ['-date_time', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date_time']),
            models.Index(fields=['user', 'category']),
        ]

    def __str__(self):
        return f"{self.type.capitalize()}: {self.title} - ₹{self.amount}"
