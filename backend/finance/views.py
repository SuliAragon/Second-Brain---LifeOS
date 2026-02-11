from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Transaction, FinanceCategory, Budget, SavingsGoal
from .serializers import TransactionSerializer, FinanceCategorySerializer, BudgetSerializer, SavingsGoalSerializer


class FinanceCategoryViewSet(viewsets.ModelViewSet):
    queryset = FinanceCategory.objects.all()
    serializer_class = FinanceCategorySerializer


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer


class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer

    @action(detail=False, methods=['get'])
    def current_month(self, request):
        """Get budgets for current month with spent amounts"""
        from datetime import date
        today = date.today()
        budgets = Budget.objects.filter(month=today.month, year=today.year)
        serializer = self.get_serializer(budgets, many=True)
        return Response(serializer.data)


class SavingsGoalViewSet(viewsets.ModelViewSet):
    queryset = SavingsGoal.objects.all()
    serializer_class = SavingsGoalSerializer

    @action(detail=True, methods=['post'])
    def add_funds(self, request, pk=None):
        """Add funds to a savings goal"""
        from decimal import Decimal
        goal = self.get_object()
        amount = request.data.get('amount', 0)
        goal.current_amount += Decimal(str(amount))
        if goal.current_amount >= goal.target_amount:
            goal.is_completed = True
        goal.save()
        serializer = self.get_serializer(goal)
        return Response(serializer.data)

