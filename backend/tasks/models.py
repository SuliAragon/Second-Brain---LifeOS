from django.db import models

class Task(models.Model):
    STATUS_CHOICES = [
        ('INBOX', 'Inbox'),
        ('TODO', 'To Do'),
        ('DONE', 'Done'),
    ]
    
    ENERGY_CHOICES = [
        (1, 'Very Low'),
        (2, 'Low'),
        (3, 'Medium'),
        (4, 'High'),
        (5, 'Very High'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    due_time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='INBOX')
    # For drag and drop ordering
    order = models.IntegerField(default=0)
    # Cross-linking project
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks'
    )
    # Mood/Energy tracking
    energy_level = models.PositiveSmallIntegerField(
        choices=ENERGY_CHOICES,
        null=True,
        blank=True,
        help_text="Energy level when completing task (1-5)"
    )
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title

