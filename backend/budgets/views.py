from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Budget
from .serializers import BudgetSerializer

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Budget.objects.filter(user=user)

        month_str = self.request.query_params.get('month')
        if month_str:
            try:
                # Can be YYYY-MM or YYYY-MM-DD
                if len(month_str) == 7:
                    dt = datetime.strptime(month_str, '%Y-%m').date()
                else:
                    dt = datetime.strptime(month_str[:10], '%Y-%m-%d').date()
                first_of_month = dt.replace(day=1)
                queryset = queryset.filter(month=first_of_month)
            except Exception:
                pass
        else:
            # Default to current month
            today = date.today()
            first_of_month = today.replace(day=1)
            queryset = queryset.filter(month=first_of_month)

        return queryset.order_by('category__name')

    @action(detail=False, methods=['post'], url_path='copy-previous')
    def copy_previous(self, request):
        user = request.user
        month_str = request.data.get('month')
        if month_str:
            target_date = datetime.strptime(month_str[:7], '%Y-%m').date().replace(day=1)
        else:
            target_date = date.today().replace(day=1)

        prev_date = target_date - relativedelta(months=1)
        prev_budgets = Budget.objects.filter(user=user, month=prev_date)

        if not prev_budgets.exists():
            return Response({'message': 'No budgets found in the previous month to copy.'}, status=status.HTTP_400_BAD_REQUEST)

        copied_count = 0
        for b in prev_budgets:
            if not Budget.objects.filter(user=user, category=b.category, month=target_date).exists():
                Budget.objects.create(
                    user=user,
                    category=b.category,
                    month=target_date,
                    limit_amount=b.limit_amount
                )
                copied_count += 1

        return Response({
            'message': f'Successfully copied {copied_count} budget(s) from {prev_date.strftime("%B %Y")} to {target_date.strftime("%B %Y")}.'
        })
