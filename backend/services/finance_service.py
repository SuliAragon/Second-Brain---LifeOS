"""
Finance Service Module
Pure business logic functions for finance operations.
Can be used by both Django ViewSets and future MCP server.
"""
from decimal import Decimal
from datetime import date
from typing import Optional, List, Dict, Any
from django.db.models import Sum

from finance.models import Transaction, FinanceCategory, Budget, SavingsGoal


# ==================== TRANSACTIONS ====================

def get_all_transactions() -> List[Transaction]:
    """Get all transactions ordered by date."""
    return list(Transaction.objects.all())


def get_transactions_by_month(year: int, month: int) -> List[Transaction]:
    """Get transactions for a specific month."""
    return list(Transaction.objects.filter(
        date__year=year,
        date__month=month
    ))


def create_transaction(
    title: str,
    amount: float,
    transaction_type: str,
    transaction_date: date,
    category_id: Optional[int] = None,
    project_id: Optional[int] = None
) -> Transaction:
    """Create a new transaction."""
    tx = Transaction.objects.create(
        title=title,
        amount=Decimal(str(amount)),
        type=transaction_type,
        date=transaction_date,
        category_id=category_id,
        project_id=project_id
    )
    return tx


def delete_transaction(transaction_id: int) -> bool:
    """Delete a transaction by ID."""
    try:
        Transaction.objects.filter(id=transaction_id).delete()
        return True
    except Exception:
        return False


def get_monthly_summary(year: int, month: int) -> Dict[str, float]:
    """Get income/expense summary for a month."""
    transactions = get_transactions_by_month(year, month)
    income = sum(float(tx.amount) for tx in transactions if tx.type == 'INCOME')
    expense = sum(float(tx.amount) for tx in transactions if tx.type == 'EXPENSE')
    return {
        'income': income,
        'expense': expense,
        'balance': income - expense
    }


# ==================== CATEGORIES ====================

def get_all_categories() -> List[FinanceCategory]:
    """Get all finance categories."""
    return list(FinanceCategory.objects.all())


def create_category(name: str, color: str = '#6B7280', icon: str = '') -> FinanceCategory:
    """Create a new finance category."""
    return FinanceCategory.objects.create(name=name, color=color, icon=icon)


# ==================== BUDGETS ====================

def get_budgets_for_month(year: int, month: int) -> List[Dict[str, Any]]:
    """Get all budgets for a specific month with spent amounts."""
    budgets = Budget.objects.filter(year=year, month=month).select_related('category')
    result = []
    for budget in budgets:
        result.append({
            'id': budget.id,
            'category_name': budget.category.name,
            'category_color': budget.category.color,
            'amount': float(budget.amount),
            'spent': float(budget.get_spent()),
            'percentage': budget.get_percentage()
        })
    return result


def create_budget(
    category_id: int,
    amount: float,
    year: int,
    month: int
) -> Budget:
    """Create a budget for a category in a specific month."""
    return Budget.objects.create(
        category_id=category_id,
        amount=Decimal(str(amount)),
        year=year,
        month=month
    )


def check_budget_alerts() -> List[Dict[str, Any]]:
    """
    Check all budgets for current month and return alerts.
    This is useful for agentic notifications.
    """
    today = date.today()
    budgets = Budget.objects.filter(year=today.year, month=today.month)
    alerts = []
    
    for budget in budgets:
        percentage = budget.get_percentage()
        if percentage >= 90:
            alerts.append({
                'type': 'critical',
                'category': budget.category.name,
                'percentage': percentage,
                'message': f"¡Cuidado! Has usado el {percentage}% de tu presupuesto de {budget.category.name}"
            })
        elif percentage >= 70:
            alerts.append({
                'type': 'warning',
                'category': budget.category.name,
                'percentage': percentage,
                'message': f"Llevas el {percentage}% de tu presupuesto de {budget.category.name}"
            })
    
    return alerts


# ==================== SAVINGS GOALS ====================

def get_all_savings_goals() -> List[SavingsGoal]:
    """Get all savings goals."""
    return list(SavingsGoal.objects.all())


def create_savings_goal(
    name: str,
    target_amount: float,
    current_amount: float = 0,
    deadline: Optional[date] = None
) -> SavingsGoal:
    """Create a new savings goal."""
    return SavingsGoal.objects.create(
        name=name,
        target_amount=Decimal(str(target_amount)),
        current_amount=Decimal(str(current_amount)),
        deadline=deadline
    )


def add_funds_to_goal(goal_id: int, amount: float) -> Optional[SavingsGoal]:
    """Add funds to a savings goal."""
    try:
        goal = SavingsGoal.objects.get(id=goal_id)
        goal.current_amount += Decimal(str(amount))
        if goal.current_amount >= goal.target_amount:
            goal.is_completed = True
        goal.save()
        return goal
    except SavingsGoal.DoesNotExist:
        return None


def get_savings_progress() -> Dict[str, Any]:
    """
    Get overall savings progress - useful for agentic summary.
    """
    goals = SavingsGoal.objects.filter(is_completed=False)
    total_target = sum(float(g.target_amount) for g in goals)
    total_current = sum(float(g.current_amount) for g in goals)
    
    return {
        'active_goals': goals.count(),
        'total_target': total_target,
        'total_saved': total_current,
        'overall_percentage': round((total_current / total_target * 100), 1) if total_target > 0 else 0
    }
