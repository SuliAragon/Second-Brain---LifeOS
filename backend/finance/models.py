from django.db import models
from django.core.validators import MinValueValidator


class FinanceCategory(models.Model):
    """Categories for organizing transactions (Food, Transport, Entertainment, etc.)"""
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, blank=True, default='')  # For frontend icon name
    color = models.CharField(max_length=7, default='#6B7280')  # Hex color
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Finance Categories"
        ordering = ['name']

    def __str__(self):
        return self.name


class Transaction(models.Model):
    TYPE_CHOICES = [
        ('INCOME', 'Income'),
        ('EXPENSE', 'Expense'),
    ]

    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    category = models.ForeignKey(
        FinanceCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='transactions'
    )
    # Cross-linking project
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions'
    )
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.amount})"


class Budget(models.Model):
    """Monthly spending limits per category"""
    category = models.ForeignKey(
        FinanceCategory, 
        on_delete=models.CASCADE, 
        related_name='budgets'
    )
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    month = models.PositiveIntegerField()  # 1-12
    year = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['category', 'month', 'year']
        ordering = ['-year', '-month']

    def __str__(self):
        return f"{self.category.name} - {self.month}/{self.year}: {self.amount}"

    def get_spent(self):
        """Calculate total spent in this category for this month"""
        from django.db.models import Sum
        from datetime import date
        start_date = date(self.year, self.month, 1)
        if self.month == 12:
            end_date = date(self.year + 1, 1, 1)
        else:
            end_date = date(self.year, self.month + 1, 1)
        
        total = Transaction.objects.filter(
            category=self.category,
            type='EXPENSE',
            date__gte=start_date,
            date__lt=end_date
        ).aggregate(total=Sum('amount'))['total']
        return total or 0

    def get_percentage(self):
        """Get percentage of budget used"""
        spent = self.get_spent()
        if self.amount == 0:
            return 0
        return min(round((spent / self.amount) * 100, 1), 100)


class SavingsGoal(models.Model):
    """Target amounts to save"""
    name = models.CharField(max_length=200)
    target_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    current_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    deadline = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name}: {self.current_amount}/{self.target_amount}"

    def get_percentage(self):
        """Get percentage of goal achieved"""
        if self.target_amount == 0:
            return 0
        return min(round((self.current_amount / self.target_amount) * 100, 1), 100)

