"""
Tasks Service Module
Pure business logic functions for task operations.
Can be used by both Django ViewSets and future MCP server.
"""
from datetime import datetime, date
from typing import Optional, List, Dict, Any

from tasks.models import Task


# ==================== TASK CRUD ====================

def get_all_tasks() -> List[Task]:
    """Get all tasks."""
    return list(Task.objects.all())


def get_tasks_by_status(status: str) -> List[Task]:
    """Get tasks by status (INBOX, TODO, DONE)."""
    return list(Task.objects.filter(status=status))


def get_tasks_by_project(project_id: int) -> List[Task]:
    """Get all tasks linked to a specific project."""
    return list(Task.objects.filter(project_id=project_id))


def create_task(
    title: str,
    description: str = '',
    due_date: Optional[date] = None,
    due_time: Optional[str] = None,
    status: str = 'INBOX',
    project_id: Optional[int] = None
) -> Task:
    """Create a new task."""
    return Task.objects.create(
        title=title,
        description=description,
        due_date=due_date,
        due_time=due_time,
        status=status,
        project_id=project_id
    )


def update_task_status(task_id: int, new_status: str, energy_level: Optional[int] = None) -> Optional[Task]:
    """
    Update task status.
    If completing a task, optionally record energy level and completion time.
    """
    try:
        task = Task.objects.get(id=task_id)
        task.status = new_status
        
        if new_status == 'DONE':
            task.completed_at = datetime.now()
            if energy_level:
                task.energy_level = energy_level
        
        task.save()
        return task
    except Task.DoesNotExist:
        return None


def delete_task(task_id: int) -> bool:
    """Delete a task by ID."""
    try:
        Task.objects.filter(id=task_id).delete()
        return True
    except Exception:
        return False


# ==================== ANALYTICS ====================

def get_productivity_stats() -> Dict[str, Any]:
    """
    Get productivity statistics - useful for agentic insights.
    """
    all_tasks = Task.objects.all()
    done_tasks = all_tasks.filter(status='DONE')
    
    # Energy analysis
    tasks_with_energy = done_tasks.exclude(energy_level__isnull=True)
    avg_energy = 0
    if tasks_with_energy.exists():
        avg_energy = sum(t.energy_level for t in tasks_with_energy) / tasks_with_energy.count()
    
    return {
        'total_tasks': all_tasks.count(),
        'inbox': all_tasks.filter(status='INBOX').count(),
        'todo': all_tasks.filter(status='TODO').count(),
        'done': done_tasks.count(),
        'completion_rate': round(done_tasks.count() / all_tasks.count() * 100, 1) if all_tasks.count() > 0 else 0,
        'average_energy_on_completion': round(avg_energy, 1)
    }


def get_overdue_tasks() -> List[Task]:
    """Get tasks that are past their due date."""
    today = date.today()
    return list(Task.objects.filter(
        due_date__lt=today,
        status__in=['INBOX', 'TODO']
    ))


def suggest_task_time(task_id: int) -> Dict[str, Any]:
    """
    Analyze past completion patterns to suggest best time for a task.
    This is a placeholder for future ML-based suggestions.
    """
    # For now, return a simple suggestion
    return {
        'suggestion': 'morning',
        'reason': 'Basado en tu historial, tienes más energía por las mañanas.',
        'confidence': 0.7
    }
