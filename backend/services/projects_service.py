"""
Projects Service Module
Pure business logic functions for cross-linking projects.
Can be used by both Django ViewSets and future MCP server.
"""
from typing import Optional, List, Dict, Any
from datetime import date, datetime

from projects.models import Project, Objective


# ==================== PROJECT CRUD ====================

def get_all_projects() -> List[Project]:
    """Get all projects."""
    return list(Project.objects.all())


def get_active_projects() -> List[Project]:
    """Get only active projects."""
    return list(Project.objects.filter(is_active=True))


def get_project_with_stats(project_id: int) -> Optional[Dict[str, Any]]:
    """Get a project with linked item counts."""
    try:
        project = Project.objects.get(id=project_id)
        stats = project.get_stats()
        return {
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'color': project.color,
            'icon': project.icon,
            'is_active': project.is_active,
            'stats': stats,
            'total_items': stats['tasks'] + stats['transactions'] + stats['entries']
        }
    except Project.DoesNotExist:
        return None


def create_project(
    name: str,
    description: str = '',
    color: str = '#6366F1',
    icon: str = 'folder'
) -> Project:
    """Create a new project."""
    return Project.objects.create(
        name=name,
        description=description,
        color=color,
        icon=icon
    )


def update_project(
    project_id: int,
    name: Optional[str] = None,
    description: Optional[str] = None,
    color: Optional[str] = None,
    is_active: Optional[bool] = None
) -> Optional[Project]:
    """Update a project."""
    try:
        project = Project.objects.get(id=project_id)
        if name:
            project.name = name
        if description is not None:
            project.description = description
        if color:
            project.color = color
        if is_active is not None:
            project.is_active = is_active
        project.save()
        return project
    except Project.DoesNotExist:
        return None


def delete_project(project_id: int) -> bool:
    """Delete a project by ID."""
    try:
        Project.objects.filter(id=project_id).delete()
        return True
    except Exception:
        return False


# ==================== CROSS-LINKING ====================

def get_project_overview(project_id: int) -> Optional[Dict[str, Any]]:
    """
    Get a complete overview of a project with all linked items.
    Useful for agentic summarization.
    """
    try:
        project = Project.objects.get(id=project_id)
        
        tasks = list(project.tasks.all())
        transactions = list(project.transactions.all())
        entries = list(project.entries.all())
        
        # Calculate finances
        income = sum(float(tx.amount) for tx in transactions if tx.type == 'INCOME')
        expense = sum(float(tx.amount) for tx in transactions if tx.type == 'EXPENSE')
        
        # Task progress
        total_tasks = len(tasks)
        done_tasks = len([t for t in tasks if t.status == 'DONE'])
        
        return {
            'project': {
                'id': project.id,
                'name': project.name,
                'description': project.description,
                'color': project.color
            },
            'tasks': {
                'total': total_tasks,
                'done': done_tasks,
                'progress': round(done_tasks / total_tasks * 100, 1) if total_tasks > 0 else 0,
                'items': [{'id': t.id, 'title': t.title, 'status': t.status} for t in tasks[:5]]
            },
            'finance': {
                'income': income,
                'expense': expense,
                'balance': income - expense,
                'transactions_count': len(transactions)
            },
            'journal': {
                'entries_count': len(entries),
                'recent': [{'id': e.id, 'title': e.title, 'date': str(e.date)} for e in entries[:3]]
            }
        }
    except Project.DoesNotExist:
        return None


def search_across_project(project_id: int, query: str) -> Optional[Dict[str, List]]:
    """
    Search for items across all linked content in a project.
    Useful for agentic search.
    """
    try:
        project = Project.objects.get(id=project_id)
        query_lower = query.lower()
        
        matching_tasks = [
            {'type': 'task', 'id': t.id, 'title': t.title}
            for t in project.tasks.all()
            if query_lower in t.title.lower() or query_lower in t.description.lower()
        ]
        
        matching_transactions = [
            {'type': 'transaction', 'id': tx.id, 'title': tx.title, 'amount': float(tx.amount)}
            for tx in project.transactions.all()
            if query_lower in tx.title.lower()
        ]
        
        matching_entries = [
            {'type': 'entry', 'id': e.id, 'title': e.title}
            for e in project.entries.all()
            if query_lower in e.title.lower() or query_lower in e.content.lower()
        ]
        
        return {
            'tasks': matching_tasks,
            'transactions': matching_transactions,
            'entries': matching_entries,
            'total_matches': len(matching_tasks) + len(matching_transactions) + len(matching_entries)
        }
    except Project.DoesNotExist:
        return None


# ==================== OBJECTIVES ====================

def get_project_objectives(project_id: int) -> List[Dict[str, Any]]:
    """Get all objectives for a project."""
    objectives = Objective.objects.filter(project_id=project_id)
    return [
        {
            'id': o.id,
            'title': o.title,
            'description': o.description,
            'deadline': str(o.deadline) if o.deadline else None,
            'status': o.status
        }
        for o in objectives
    ]


def create_objective(
    project_id: int,
    title: str,
    description: str = '',
    deadline: date = None
) -> Optional[Objective]:
    """Create a new objective for a project."""
    if not Project.objects.filter(id=project_id).exists():
        return None
        
    return Objective.objects.create(
        project_id=project_id,
        title=title,
        description=description,
        deadline=deadline
    )


def update_objective_status(objective_id: int, status: str) -> Optional[Objective]:
    """Update objective status."""
    try:
        objective = Objective.objects.get(id=objective_id)
        objective.status = status
        objective.save()
        return objective
    except Objective.DoesNotExist:
        return None


def delete_objective(objective_id: int) -> bool:
    """Delete an objective."""
    try:
        Objective.objects.filter(id=objective_id).delete()
        return True
    except Exception:
        return False


def create_objectives_batch(project_id: int, objectives: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Create multiple objectives for a project."""
    if not Project.objects.filter(id=project_id).exists():
        return {'success': False, 'error': f"Project {project_id} not found", 'created': []}
    
    created_count = 0
    created_items = []
    
    for obj_data in objectives:
        deadline = None
        if obj_data.get('deadline'):
            try:
                if isinstance(obj_data['deadline'], str):
                    deadline = datetime.strptime(obj_data['deadline'], '%Y-%m-%d').date()
                else:
                    deadline = obj_data['deadline']
            except (ValueError, TypeError):
                pass
                
        obj = Objective.objects.create(
            project_id=project_id,
            title=obj_data.get('title', 'Untitled'),
            description=obj_data.get('description', ''),
            deadline=deadline
        )
        created_count += 1
        created_items.append({'id': obj.id, 'title': obj.title})
        
    return {
        'success': True,
        'count': created_count,
        'project_id': project_id,
        'created': created_items
    }
