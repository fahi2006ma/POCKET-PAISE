from decimal import Decimal
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum

from .models import Goal, GoalContribution
from .serializers import GoalSerializer, GoalContributionSerializer
from notifications.models import Notification

class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['get', 'post'], url_path='contributions')
    def contributions(self, request, pk=None):
        goal = self.get_object()

        if request.method == 'GET':
            contributions = goal.contributions.all().order_by('-date', '-created_at')
            serializer = GoalContributionSerializer(contributions, many=True)
            return Response(serializer.data)

        if request.method == 'POST':
            serializer = GoalContributionSerializer(data=request.data)
            if serializer.is_valid():
                contribution = serializer.save(goal=goal)

                # Check if goal is completed
                saved = goal.contributions.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
                if saved >= goal.target_amount and goal.status != 'completed':
                    goal.status = 'completed'
                    goal.save()
                    Notification.objects.create(
                        user=request.user,
                        kind='goal_update',
                        message=f"🎉 Congratulations! You have achieved your savings goal '{goal.name}' (Target: ₹{goal.target_amount:,.2f})!"
                    )
                else:
                    Notification.objects.create(
                        user=request.user,
                        kind='goal_update',
                        message=f"Added ₹{contribution.amount:,.2f} towards goal '{goal.name}'. Progress: {((saved/goal.target_amount)*100):.1f}%."
                    )

                return Response(GoalSerializer(goal).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
