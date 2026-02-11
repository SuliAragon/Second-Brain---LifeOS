#!/usr/bin/env python3
"""
LifeOS MCP Server
Exposes all LifeOS services as MCP tools for AI agent integration.
"""
import os
import sys
from datetime import date, datetime
from typing import Optional, List, Dict, Any

# Add backend to path for Django imports
backend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend')
sys.path.insert(0, backend_path)

# Configure Django before importing models
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from django.core.exceptions import ObjectDoesNotExist
from dotenv import load_dotenv
load_dotenv()

from mcp.server.fastmcp import FastMCP

# Import our services
from services import finance_service, tasks_service, journal_service, projects_service

# Initialize MCP server
mcp = FastMCP("LifeOS")


# ==================== FINANCE TOOLS ====================

@mcp.tool()
@mcp.tool()
def get_financial_summary(year: int = None, month: int = None) -> Dict[str, Any]:
    """
    Get financial summary for a specific month or current month.
    Returns income, expenses, and balance.
    """
    try:
        if year is None:
            year = date.today().year
        if month is None:
            month = date.today().month
        
        return finance_service.get_monthly_summary(year, month)
    except Exception as e:
        return {"error": str(e)}


@mcp.tool()
def get_all_transactions() -> List[Dict[str, Any]]:
    """Get all financial transactions."""
    try:
        transactions = finance_service.get_all_transactions()
        return [
            {
                'id': tx.id,
                'title': tx.title,
                'amount': float(tx.amount),
                'type': tx.type,
                'date': str(tx.date),
                'category': tx.category.name if tx.category else None
            }
            for tx in transactions
        ]
    except Exception as e:
        return [{"error": str(e)}]


@mcp.tool()
def add_transaction(title: str, amount: float, transaction_type: str, category_id: int = None) -> Dict[str, Any]:
    """
    Add a new financial transaction.
    transaction_type must be 'INCOME' or 'EXPENSE'.
    """
    try:
        tx = finance_service.create_transaction(
            title=title,
            amount=amount,
            transaction_type=transaction_type,
            transaction_date=date.today(),
            category_id=category_id
        )
        return {'id': tx.id, 'title': tx.title, 'amount': float(tx.amount), 'type': tx.type}
    except Exception as e:
        return {"error": str(e)}


@mcp.tool()
def get_budget_status() -> List[Dict[str, Any]]:
    """
    Get current month's budget status with spent amounts and percentages.
    Returns list of budgets with category name, amount, spent, and percentage.
    """
    today = date.today()
    return finance_service.get_budgets_for_month(today.year, today.month)


@mcp.tool()
def check_budget_alerts() -> List[Dict[str, Any]]:
    """
    Check for budget alerts. Returns warnings for budgets over 70% and critical alerts for over 90%.
    """
    return finance_service.check_budget_alerts()


@mcp.tool()
def get_savings_goals() -> List[Dict[str, Any]]:
    """Get all savings goals with progress."""
    goals = finance_service.get_all_savings_goals()
    return [
        {
            'id': g.id,
            'name': g.name,
            'target': float(g.target_amount),
            'current': float(g.current_amount),
            'percentage': g.get_percentage(),
            'completed': g.is_completed
        }
        for g in goals
    ]


@mcp.tool()
def add_to_savings_goal(goal_id: int, amount: float) -> Dict[str, Any]:
    """Add funds to a savings goal."""
    try:
        goal = finance_service.add_funds_to_goal(goal_id, amount)
        if not goal:
            return {"error": "Savings goal not found"}
            
        return {
            'name': goal.name,
            'current': float(goal.current_amount),
            'target': float(goal.target_amount),
            'completed': goal.is_completed
        }
    except Exception as e:
        return {"error": str(e)}


@mcp.tool()
def get_savings_progress() -> Dict[str, Any]:
    """Get overall savings progress across all active goals."""
    return finance_service.get_savings_progress()


# ==================== TASKS TOOLS ====================

@mcp.tool()
def get_all_tasks() -> List[Dict[str, Any]]:
    """Get all tasks."""
    try:
        tasks = tasks_service.get_all_tasks()
        return [
            {
                'id': t.id,
                'title': t.title,
                'status': t.status,
                'due_date': str(t.due_date) if t.due_date else None,
                'project_id': t.project_id
            }
            for t in tasks
        ]
    except Exception as e:
        return [{"error": str(e)}]


@mcp.tool()
def get_tasks_by_status(status: str) -> List[Dict[str, Any]]:
    """
    Get tasks by status. 
    status must be 'INBOX', 'TODO', or 'DONE'.
    """
    try:
        tasks = tasks_service.get_tasks_by_status(status)
        return [
            {
                'id': t.id,
                'title': t.title,
                'due_date': str(t.due_date) if t.due_date else None
            }
            for t in tasks
        ]
    except Exception as e:
        return [{"error": str(e)}]


@mcp.tool()
def create_task(title: str, description: str = "", due_date: str = None, project_id: int = None) -> Dict[str, Any]:
    """
    Create a new task.
    due_date should be in format YYYY-MM-DD.
    """
    try:
        parsed_date = None
        if due_date:
            parsed_date = datetime.strptime(due_date, '%Y-%m-%d').date()
        
        # Validate project_id if provided
        if project_id:
            try:
                projects_service.get_project_with_stats(project_id)
            except Exception:
                 return {"error": f"Project with ID {project_id} does not exist"}

        task = tasks_service.create_task(
            title=title,
            description=description,
            due_date=parsed_date,
            project_id=project_id
        )
        return {'id': task.id, 'title': task.title, 'status': task.status}
    except Exception as e:
        return {"error": str(e)}


@mcp.tool()
def complete_task(task_id: int, energy_level: int = None) -> Dict[str, Any]:
    """
    Mark a task as done. Optionally record energy level (1-5) when completing.
    """
    try:
        task = tasks_service.update_task_status(task_id, 'DONE', energy_level)
        if not task:
            return {"error": "Task not found"}
            
        return {
            'id': task.id,
            'title': task.title,
            'status': task.status,
            'completed_at': str(task.completed_at) if task.completed_at else None
        }
    except Exception as e:
        return {"error": str(e)}


@mcp.tool()
def delete_task(task_id: int) -> Dict[str, Any]:
    """Delete a task by ID."""
    try:
        success = tasks_service.delete_task(task_id)
        if success:
            return {"success": True, "message": f"Task {task_id} deleted"}
        else:
            return {"error": "Task not found or could not be deleted"}
    except Exception as e:
        return {"error": str(e)}


@mcp.tool()
def update_task(task_id: int, title: str = None, description: str = None, due_date: str = None) -> Dict[str, Any]:
    """Update task details."""
    try:
        # Note: We need to expose update_task_details in tasks_service or use object directly
        # For now, let's assume we can add a helper or use Django ORM if service is limited.
        # But we should rely on service. Let's check tasks_service again. 
        # It only has update_task_status. We should rely on what we have or extend service.
        # Assuming we can extend it later, for now let's implement a direct update using Django models
        # since we are inside the django context in server.py.
        # Ideally, we should add update_task_details to tasks_service.py but to keep it simple here:
        from tasks.models import Task
        task = Task.objects.get(id=task_id)
        if title:
            task.title = title
        if description:
            task.description = description
        if due_date:
             task.due_date = datetime.strptime(due_date, '%Y-%m-%d').date()
        task.save()
        return {'id': task.id, 'title': task.title}
    except Task.DoesNotExist:
        return {"error": "Task not found"}
    except Exception as e:
        return {"error": str(e)}


@mcp.tool()
def get_overdue_tasks() -> List[Dict[str, Any]]:
    """Get all overdue tasks (past due date and not done)."""
    tasks = tasks_service.get_overdue_tasks()
    return [
        {
            'id': t.id,
            'title': t.title,
            'due_date': str(t.due_date),
            'days_overdue': (date.today() - t.due_date).days
        }
        for t in tasks
    ]


@mcp.tool()
def get_productivity_stats() -> Dict[str, Any]:
    """Get productivity statistics including completion rate and average energy."""
    return tasks_service.get_productivity_stats()


# ==================== JOURNAL TOOLS ====================

@mcp.tool()
def get_recent_journal_entries(limit: int = 10) -> List[Dict[str, Any]]:
    """Get recent journal entries."""
    try:
        entries = journal_service.get_all_entries()[:limit]
        return [
            {
                'id': e.id,
                'title': e.title,
                'date': str(e.date),
                'mood': e.mood,
                'energy': e.energy
            }
            for e in entries
        ]
    except Exception as e:
        return [{"error": str(e)}]


@mcp.tool()
def create_journal_entry(title: str, content: str, mood: int = None, energy: int = None, project_id: int = None) -> Dict[str, Any]:
    """
    Create a new journal entry.
    mood and energy should be 1-5 scale.
    """
    try:
        entry = journal_service.create_entry(
            title=title,
            content=content,
            entry_date=date.today(),
            mood=mood,
            energy=energy,
            project_id=project_id
        )
        return {'id': entry.id, 'title': entry.title, 'date': str(entry.date)}
    except Exception as e:
        return {"error": str(e)}


@mcp.tool()
def update_journal_entry(entry_id: int, title: str = None, content: str = None, mood: int = None) -> Dict[str, Any]:
    """Update a journal entry."""
    try:
        entry = journal_service.update_entry(
            entry_id=entry_id,
            title=title,
            content=content,
            mood=mood
        )
        if not entry:
            return {"error": "Entry not found"}
        return {'id': entry.id, 'title': entry.title, 'msg': 'Entry updated'}
    except Exception as e:
        return {"error": str(e)}


@mcp.tool()
def delete_journal_entry(entry_id: int) -> Dict[str, Any]:
    """Delete a journal entry."""
    try:
        success = journal_service.delete_entry(entry_id)
        if success:
            return {"success": True, "message": f"Entry {entry_id} deleted"}
        return {"error": "Entry not found"}
    except Exception as e:
        return {"error": str(e)}


@mcp.tool()
def get_mood_stats(days: int = 30) -> Dict[str, Any]:
    """Get mood and energy statistics for the past N days."""
    return journal_service.get_mood_stats(days)


@mcp.tool()
def detect_mood_patterns() -> Dict[str, Any]:
    """
    Analyze mood patterns to find best/worst days and insights.
    Useful for recommendations.
    """
    return journal_service.detect_mood_patterns()


# ==================== PROJECTS TOOLS ====================

@mcp.tool()
def get_all_projects() -> List[Dict[str, Any]]:
    """Get all projects with their stats."""
    projects = projects_service.get_all_projects()
    return [
        {
            'id': p.id,
            'name': p.name,
            'color': p.color,
            'is_active': p.is_active,
            'stats': p.get_stats()
        }
        for p in projects
    ]


@mcp.tool()
def get_project_overview(project_id: int) -> Dict[str, Any]:
    """
    Get complete overview of a project including all linked tasks, transactions, and entries.
    """
    try:
        overview = projects_service.get_project_overview(project_id)
        if not overview:
            return {"error": "Project not found"}
        return overview
    except Exception as e:
        return {"error": str(e)}


@mcp.tool()
def create_project(name: str, description: str = "", color: str = "#6366F1") -> Dict[str, Any]:
    """Create a new project for cross-linking items."""
    project = projects_service.create_project(
        name=name,
        description=description,
        color=color
    )
    return {'id': project.id, 'name': project.name, 'color': project.color}


@mcp.tool()
def search_project(project_id: int, query: str) -> Dict[str, Any]:
    """Search for items across all linked content in a project."""
    try:
        results = projects_service.search_across_project(project_id, query)
        if not results:
            return {"error": "Project not found"}
        return results
    except Exception as e:
        return {"error": str(e)}


# ==================== UTILITY TOOLS ====================

@mcp.tool()
def get_daily_summary() -> Dict[str, Any]:
    """
    Get a comprehensive daily summary including tasks, finances, and mood.
    Perfect for morning briefing.
    """
    try:
        today = date.today()
        
        # Tasks
        all_tasks = tasks_service.get_all_tasks()
        inbox_count = len([t for t in all_tasks if t.status == 'INBOX'])
        todo_count = len([t for t in all_tasks if t.status == 'TODO'])
        overdue = tasks_service.get_overdue_tasks()
        
        # Finance
        finance_summary = finance_service.get_monthly_summary(today.year, today.month)
        budget_alerts = finance_service.check_budget_alerts()
        
        # Mood
        mood_stats = journal_service.get_mood_stats(7)
        
        return {
            'date': str(today),
            'tasks': {
                'inbox': inbox_count,
                'todo': todo_count,
                'overdue': len(overdue),
                'overdue_items': [{'title': t.title, 'due': str(t.due_date)} for t in overdue[:3]]
            },
            'finance': {
                'month_income': finance_summary['income'],
                'month_expense': finance_summary['expense'],
                'month_balance': finance_summary['balance'],
                'alerts': budget_alerts
            },
            'mood': {
                'avg_mood_7d': mood_stats['average_mood'],
                'avg_energy_7d': mood_stats['average_energy']
            }
        }
    except Exception as e:
        return {"error": str(e)}


# ==================== OBJECTIVES TOOLS ====================

@mcp.tool()
def create_project_objective(project_id: int, title: str, description: str = "", deadline: str = None) -> Dict[str, Any]:
    """Create a new objective for a project."""
    try:
        parsed_date = None
        if deadline:
            parsed_date = datetime.strptime(deadline, '%Y-%m-%d').date()
            
        # Verify project exists first to avoid FK error
        if not projects_service.get_project_with_stats(project_id):
             return {"error": "Project not found"}

        objective = projects_service.create_objective(
            project_id=project_id,
            title=title,
            description=description,
            deadline=parsed_date
        )
        return {'id': objective.id, 'title': objective.title}
    except Exception as e:
        return {"error": str(e)}


@mcp.tool()
def get_project_objectives(project_id: int) -> List[Dict[str, Any]]:
    """Get objectives for a project."""
    try:
        return projects_service.get_project_objectives(project_id)
    except Exception as e:
        return [{"error": str(e)}]



if __name__ == "__main__":
    mcp.run()
