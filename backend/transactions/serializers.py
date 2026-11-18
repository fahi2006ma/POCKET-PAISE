from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import Transaction
from categories.models import Category
from categories.serializers import CategorySerializer

class TransactionSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())

    class Meta:
        model = Transaction
        fields = (
            'id', 'category', 'category_detail', 'type', 'amount',
            'title', 'notes', 'payment_method', 'date_time',
            'is_recurring', 'recurrence', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        # Check decimal places
        if value.as_tuple().exponent < -2:
            raise serializers.ValidationError("Amount cannot have more than two decimal places.")
        return value

    def validate_date_time(self, value):
        max_date = timezone.now() + timedelta(days=366)
        if value > max_date:
            raise serializers.ValidationError("Transaction date cannot be more than one year in the future.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        return Transaction.objects.create(user=user, **validated_data)
