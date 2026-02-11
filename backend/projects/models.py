from django.db import models


class Project(models.Model):
    """Cross-linking projects that group Tasks, Transactions, and Journal Entries"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#6366F1')  # Hex color for visual identity
    icon = models.CharField(max_length=50, blank=True, default='folder')  # Icon name
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def get_stats(self):
        """Get counts of linked items"""
        return {
            'tasks': self.tasks.count(),
            'transactions': self.transactions.count(),
            'entries': self.entries.count(),
            'objectives': self.objectives.count(),
            'objectives_completed': self.objectives.filter(status='COMPLETED').count(),
        }


class Objective(models.Model):
    """Objectives for a project"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
    ]
    
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='objectives'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['status', 'deadline', '-created_at']
    
    def __str__(self):
        return f"{self.project.name}: {self.title}"
