from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    is_default = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'type', 'color', 'icon', 'is_hidden', 'is_default')
        read_only_fields = ('id', 'is_default')

    def get_is_default(self, obj):
        return obj.user is None

    def create(self, validated_data):
        user = self.context['request'].user
        return Category.objects.create(user=user, **validated_data)
