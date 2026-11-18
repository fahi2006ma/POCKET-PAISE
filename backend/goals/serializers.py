from decimal import Decimal
from rest_framework import serializers
from django.db.models import Sum
from .models import Goal, GoalContribution

class GoalContributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoalContribution
        fields = ('id', 'goal', 'amount', 'date', 'note', 'created_at')
        read_only_fields = ('id', 'goal', 'created_at')

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Contribution amount must be greater than zero.")
        return value

class GoalSerializer(serializers.ModelSerializer):
    saved_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()
    contributions = GoalContributionSerializer(many=True, read_only=True)

    class Meta:
        model = Goal
        fields = (
            'id', 'name', 'target_amount', 'saved_amount',
            'remaining_amount', 'percentage', 'target_date',
            'status', 'icon', 'contributions', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_saved_amount(self, obj):
        total = obj.contributions.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        return float(total)

    def get_remaining_amount(self, obj):
        saved = Decimal(str(self.get_saved_amount(obj)))
        rem = obj.target_amount - saved
        return float(max(Decimal('0.00'), rem))

    def get_percentage(self, obj):
        saved = Decimal(str(self.get_saved_amount(obj)))
        if obj.target_amount > 0:
            pct = (saved / obj.target_amount) * 100
            return round(min(100.0, float(pct)), 1)
        return 0.0

    def validate_target_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target amount must be greater than zero.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        return Goal.objects.create(user=user, **validated_data)
