from rest_framework import serializers
from .models import Transaction, FinanceCategory, Budget, SavingsGoal


class FinanceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FinanceCategory
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'title', 'amount', 'type', 'category', 'category_name', 'category_color', 'date', 'created_at']


class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    spent = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = ['id', 'category', 'category_name', 'category_color', 'amount', 'month', 'year', 'spent', 'percentage', 'created_at']

    def get_spent(self, obj):
        return float(obj.get_spent())

    def get_percentage(self, obj):
        return obj.get_percentage()


class SavingsGoalSerializer(serializers.ModelSerializer):
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = SavingsGoal
        fields = ['id', 'name', 'target_amount', 'current_amount', 'deadline', 'is_completed', 'percentage', 'created_at']

    def get_percentage(self, obj):
        return obj.get_percentage()

