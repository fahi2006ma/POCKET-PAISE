from django.db import models
from django.conf import settings
from categories.models import Category

class Budget(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='budgets')
    month = models.DateField(help_text='First day of the budget month (YYYY-MM-01)')
    limit_amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'budgets_budget'
        unique_together = ('user', 'category', 'month')
        ordering = ['category__name']

    def __str__(self):
        return f"{self.category.name} ({self.month.strftime('%b %Y')}): limit ₹{self.limit_amount}"
