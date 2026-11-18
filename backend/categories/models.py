from django.db import models
from django.conf import settings

class Category(models.Model):
    TYPE_CHOICES = (
        ('expense', 'Expense'),
        ('income', 'Income'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='custom_categories'
    )
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='expense')
    color = models.CharField(max_length=7, default='#10b981')
    icon = models.CharField(max_length=30, default='Folder')
    is_hidden = models.BooleanField(default=False)

    class Meta:
        db_table = 'categories_category'
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.type})"
