from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.db.models import Q
from .models import Category
from .serializers import CategorySerializer

DEFAULT_CATEGORIES = [
    # Expenses
    {'name': 'Food & Dining', 'type': 'expense', 'color': '#10b981', 'icon': 'Utensils'},
    {'name': 'Shopping', 'type': 'expense', 'color': '#ec4899', 'icon': 'ShoppingBag'},
    {'name': 'Travel', 'type': 'expense', 'color': '#0ea5e9', 'icon': 'Plane'},
    {'name': 'Bills', 'type': 'expense', 'color': '#f59e0b', 'icon': 'Receipt'},
    {'name': 'Health', 'type': 'expense', 'color': '#ef4444', 'icon': 'HeartPulse'},
    {'name': 'Education', 'type': 'expense', 'color': '#8b5cf6', 'icon': 'GraduationCap'},
    {'name': 'Entertainment', 'type': 'expense', 'color': '#6366f1', 'icon': 'Film'},
    {'name': 'Others', 'type': 'expense', 'color': '#64748b', 'icon': 'Folder'},
    # Incomes
    {'name': 'Salary', 'type': 'income', 'color': '#10b981', 'icon': 'Briefcase'},
    {'name': 'Part-time Work', 'type': 'income', 'color': '#059669', 'icon': 'Laptop'},
    {'name': 'Gift', 'type': 'income', 'color': '#f43f5e', 'icon': 'Gift'},
    {'name': 'Other', 'type': 'income', 'color': '#64748b', 'icon': 'Coins'},
]

def ensure_default_categories():
    for item in DEFAULT_CATEGORIES:
        Category.objects.get_or_create(
            name=item['name'],
            type=item['type'],
            user=None,
            defaults={'color': item['color'], 'icon': item['icon']}
        )

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        ensure_default_categories()
        # Return default categories + user's custom categories
        return Category.objects.filter(
            Q(user=self.request.user) | Q(user__isnull=True),
            is_hidden=False
        ).order_by('type', 'name')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user is None:
            return Response({'error': 'Default categories cannot be deleted.'}, status=status.HTTP_400_BAD_REQUEST)
        # Check if category has transactions
        if instance.transactions.exists():
            instance.is_hidden = True
            instance.save()
            return Response({'message': 'Category has associated transactions and was hidden instead of deleted.'})
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
