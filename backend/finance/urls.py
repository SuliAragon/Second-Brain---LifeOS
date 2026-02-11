from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, FinanceCategoryViewSet, BudgetViewSet, SavingsGoalViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet)
router.register(r'finance-categories', FinanceCategoryViewSet)
router.register(r'budgets', BudgetViewSet)
router.register(r'savings-goals', SavingsGoalViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

