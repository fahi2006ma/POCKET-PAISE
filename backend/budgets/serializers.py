from decimal import Decimal
from rest_framework import serializers
from django.db.models import Sum
from .models import Budget
from categories.models import Category
from categories.serializers import CategorySerializer
from transactions.models import Transaction

class BudgetSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    spent_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    percentage_used = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = (
            'id', 'category', 'category_detail', 'month',
            'limit_amount', 'spent_amount', 'remaining_amount',
            'percentage_used', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_spent_amount(self, obj):
        spent = Transaction.objects.filter(
            user=obj.user,
            category=obj.category,
            type='expense',
            date_time__year=obj.month.year,
            date_time__month=obj.month.month
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        return float(spent)

    def get_remaining_amount(self, obj):
        spent = Decimal(str(self.get_spent_amount(obj)))
        remaining = obj.limit_amount - spent
        return float(max(Decimal('0.00'), remaining))

    def get_percentage_used(self, obj):
        spent = Decimal(str(self.get_spent_amount(obj)))
        if obj.limit_amount > 0:
            pct = (spent / obj.limit_amount) * 100
            return round(float(pct), 1)
        return 0.0

    def validate_limit_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Budget limit must be greater than zero.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        category = validated_data['category']
        month = validated_data['month']

        existing = Budget.objects.filter(user=user, category=category, month=month).first()
        if existing:
            raise serializers.ValidationError({"category": "A budget already exists for this category in this month. Please edit it instead."})

        return Budget.objects.create(user=user, **validated_data)
