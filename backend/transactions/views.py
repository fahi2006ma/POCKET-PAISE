import csv
from datetime import datetime
from decimal import Decimal
from django.http import HttpResponse
from django.db.models import Q, Sum
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Transaction
from .serializers import TransactionSerializer
from budgets.models import Budget
from notifications.models import Notification

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Transaction.objects.filter(user=user)

        # Search
        q = self.request.query_params.get('search') or self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(Q(title__icontains=q) | Q(notes__icontains=q))

        # Filter by type (income/expense)
        txn_type = self.request.query_params.get('type')
        if txn_type in ['income', 'expense']:
            queryset = queryset.filter(type=txn_type)

        # Filter by category
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Filter by payment method
        payment_method = self.request.query_params.get('payment_method')
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)

        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(date_time__date__gte=start_date)

        end_date = self.request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(date_time__date__lte=end_date)

        # Filter by amount range
        min_amount = self.request.query_params.get('min_amount')
        if min_amount:
            try:
                queryset = queryset.filter(amount__gte=Decimal(min_amount))
            except Exception:
                pass

        max_amount = self.request.query_params.get('max_amount')
        if max_amount:
            try:
                queryset = queryset.filter(amount__lte=Decimal(max_amount))
            except Exception:
                pass

        # Ordering
        ordering = self.request.query_params.get('ordering', '-date_time')
        if ordering in ['date_time', '-date_time', 'amount', '-amount']:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-date_time', '-created_at')

        return queryset

    def perform_create(self, serializer):
        transaction = serializer.save()
        self._check_budget_alert(transaction)

    def perform_update(self, serializer):
        transaction = serializer.save()
        self._check_budget_alert(transaction)

    def _check_budget_alert(self, transaction):
        if transaction.type != 'expense':
            return
        
        user = transaction.user
        txn_date = transaction.date_time.date()
        first_of_month = txn_date.replace(day=1)

        budget = Budget.objects.filter(user=user, category=transaction.category, month=first_of_month).first()
        if not budget or budget.limit_amount <= 0:
            return

        total_spent = Transaction.objects.filter(
            user=user,
            category=transaction.category,
            type='expense',
            date_time__year=first_of_month.year,
            date_time__month=first_of_month.month
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        ratio = (total_spent / budget.limit_amount) * 100
        cat_name = transaction.category.name

        if ratio >= 100:
            msg = f"Alert: You have exceeded 100% of your {cat_name} budget (Spent: ₹{total_spent:,.2f} of ₹{budget.limit_amount:,.2f})!"
            Notification.objects.create(user=user, kind='budget_alert', message=msg)
        elif ratio >= 80:
            msg = f"Warning: You have reached {ratio:.0f}% of your {cat_name} budget (Spent: ₹{total_spent:,.2f} of ₹{budget.limit_amount:,.2f})."
            # Check if recently notified
            recent_notif = Notification.objects.filter(
                user=user,
                kind='budget_alert',
                message__startswith=f"Warning: You have reached",
                created_at__year=first_of_month.year,
                created_at__month=first_of_month.month
            ).exists()
            if not recent_notif:
                Notification.objects.create(user=user, kind='budget_alert', message=msg)

    @action(detail=False, methods=['get'])
    def export(self, request):
        queryset = self.get_queryset()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="transactions_export.csv"'

        writer = csv.writer(response)
        writer.writerow(['Date & Time', 'Title', 'Type', 'Category', 'Amount (INR)', 'Payment Method', 'Notes'])

        for t in queryset:
            writer.writerow([
                t.date_time.strftime('%Y-%m-%d %H:%M'),
                t.title,
                t.type.capitalize(),
                t.category.name,
                f"{t.amount:.2f}",
                t.payment_method.upper(),
                t.notes or ''
            ])

        return response
