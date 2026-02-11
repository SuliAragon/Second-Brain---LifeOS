#!/usr/bin/env python3
"""
LifeOS AI Chat Client
Uses Google Gemini with MCP tools for intelligent LifeOS interactions.
"""
import os
import sys
import json
from datetime import date

# Add backend to path for Django imports
backend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend')
sys.path.insert(0, backend_path)

# Configure Django before importing models
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from dotenv import load_dotenv
load_dotenv()

from google import genai

# Import our services directly for tool execution
from services import finance_service, tasks_service, journal_service, projects_service

# Initialize Gemini client
client = genai.Client(api_key=os.getenv('GOOGLE_API_KEY'))

# Define tools as Gemini function declarations
TOOLS = [
    # Finance tools
    {
        "name": "get_financial_summary",
        "description": "Get financial summary for current month. Returns income, expenses, and balance.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "get_all_transactions",
        "description": "Get all financial transactions.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "add_transaction",
        "description": "Add a new financial transaction. Use type 'INCOME' or 'EXPENSE'.",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Description of the transaction"},
                "amount": {"type": "number", "description": "Amount in currency"},
                "transaction_type": {"type": "string", "enum": ["INCOME", "EXPENSE"]}
            },
            "required": ["title", "amount", "transaction_type"]
        }
    },
    {
        "name": "get_budget_status",
        "description": "Get current month's budget status with spent amounts and percentages.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "check_budget_alerts",
        "description": "Check for budget alerts. Returns warnings for budgets over 70% and critical for over 90%.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "get_savings_goals",
        "description": "Get all savings goals with progress.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "add_to_savings_goal",
        "description": "Add funds to a savings goal.",
        "parameters": {
            "type": "object",
            "properties": {
                "goal_id": {"type": "integer", "description": "ID of the savings goal"},
                "amount": {"type": "number", "description": "Amount to add"}
            },
            "required": ["goal_id", "amount"]
        }
    },
    # Tasks tools
    {
        "name": "get_all_tasks",
        "description": "Get all tasks.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "get_tasks_by_status",
        "description": "Get tasks by status: INBOX, TODO, or DONE.",
        "parameters": {
            "type": "object",
            "properties": {
                "status": {"type": "string", "enum": ["INBOX", "TODO", "DONE"]}
            },
            "required": ["status"]
        }
    },
    {
        "name": "create_task",
        "description": "Create a new task.",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Task title"},
                "description": {"type": "string", "description": "Task description"},
                "due_date": {"type": "string", "description": "Due date in YYYY-MM-DD format"}
            },
            "required": ["title"]
        }
    },
    {
        "name": "complete_task",
        "description": "Mark a task as done. Optionally record energy level (1-5).",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {"type": "integer", "description": "Task ID"},
                "energy_level": {"type": "integer", "description": "Energy level 1-5 when completing"}
            },
            "required": ["task_id"]
        }
    },
    {
        "name": "get_overdue_tasks",
        "description": "Get all overdue tasks.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "get_productivity_stats",
        "description": "Get productivity statistics including completion rate and average energy.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    # Journal tools
    {
        "name": "get_recent_journal_entries",
        "description": "Get recent journal entries.",
        "parameters": {
            "type": "object",
            "properties": {
                "limit": {"type": "integer", "description": "Number of entries to return", "default": 10}
            }
        }
    },
    {
        "name": "create_journal_entry",
        "description": "Create a new journal entry with optional mood/energy (1-5 scale).",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Entry title"},
                "content": {"type": "string", "description": "Entry content"},
                "mood": {"type": "integer", "description": "Mood level 1-5"},
                "energy": {"type": "integer", "description": "Energy level 1-5"}
            },
            "required": ["title", "content"]
        }
    },
    {
        "name": "get_mood_stats",
        "description": "Get mood and energy statistics for recent days.",
        "parameters": {
            "type": "object",
            "properties": {
                "days": {"type": "integer", "description": "Number of days to analyze", "default": 30}
            }
        }
    },
    {
        "name": "detect_mood_patterns",
        "description": "Analyze mood patterns to find best/worst days and insights.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    # Projects tools
    {
        "name": "get_all_projects",
        "description": "Get all projects with their stats.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "get_project_overview",
        "description": "Get complete overview of a project including tasks, transactions, and entries.",
        "parameters": {
            "type": "object",
            "properties": {
                "project_id": {"type": "integer", "description": "Project ID"}
            },
            "required": ["project_id"]
        }
    },
    {
        "name": "create_project",
        "description": "Create a new project.",
        "parameters": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Project name"},
                "description": {"type": "string", "description": "Project description"},
                "color": {"type": "string", "description": "Hex color code"}
            },
            "required": ["name"]
        }
    },
    # Utility
    {
        "name": "get_daily_summary",
        "description": "Get comprehensive daily summary including tasks, finances, and mood. Perfect for morning briefing.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    }
]


def execute_tool(name: str, args: dict) -> dict:
    """Execute a tool and return the result."""
    today = date.today()
    
    # Finance tools
    if name == "get_financial_summary":
        return finance_service.get_monthly_summary(today.year, today.month)
    
    elif name == "get_all_transactions":
        transactions = finance_service.get_all_transactions()
        return [
            {'id': tx.id, 'title': tx.title, 'amount': float(tx.amount), 'type': tx.type, 'date': str(tx.date)}
            for tx in transactions
        ]
    
    elif name == "add_transaction":
        tx = finance_service.create_transaction(
            title=args['title'],
            amount=args['amount'],
            transaction_type=args['transaction_type'],
            transaction_date=today
        )
        return {'id': tx.id, 'title': tx.title, 'amount': float(tx.amount)}
    
    elif name == "get_budget_status":
        return finance_service.get_budgets_for_month(today.year, today.month)
    
    elif name == "check_budget_alerts":
        return finance_service.check_budget_alerts()
    
    elif name == "get_savings_goals":
        goals = finance_service.get_all_savings_goals()
        return [
            {'id': g.id, 'name': g.name, 'target': float(g.target_amount), 'current': float(g.current_amount), 'percentage': g.get_percentage()}
            for g in goals
        ]
    
    elif name == "add_to_savings_goal":
        goal = finance_service.add_funds_to_goal(args['goal_id'], args['amount'])
        return {'name': goal.name, 'current': float(goal.current_amount), 'completed': goal.is_completed}
    
    # Tasks tools
    elif name == "get_all_tasks":
        tasks = tasks_service.get_all_tasks()
        return [
            {'id': t.id, 'title': t.title, 'status': t.status, 'due_date': str(t.due_date) if t.due_date else None}
            for t in tasks
        ]
    
    elif name == "get_tasks_by_status":
        tasks = tasks_service.get_tasks_by_status(args['status'])
        return [{'id': t.id, 'title': t.title} for t in tasks]
    
    elif name == "create_task":
        from datetime import datetime
        due_date = None
        if args.get('due_date'):
            due_date = datetime.strptime(args['due_date'], '%Y-%m-%d').date()
        task = tasks_service.create_task(
            title=args['title'],
            description=args.get('description', ''),
            due_date=due_date
        )
        return {'id': task.id, 'title': task.title, 'status': task.status}
    
    elif name == "complete_task":
        task = tasks_service.update_task_status(
            args['task_id'], 
            'DONE', 
            args.get('energy_level')
        )
        return {'id': task.id, 'title': task.title, 'completed': True}
    
    elif name == "get_overdue_tasks":
        tasks = tasks_service.get_overdue_tasks()
        return [
            {'id': t.id, 'title': t.title, 'due_date': str(t.due_date), 'days_overdue': (today - t.due_date).days}
            for t in tasks
        ]
    
    elif name == "get_productivity_stats":
        return tasks_service.get_productivity_stats()
    
    # Journal tools
    elif name == "get_recent_journal_entries":
        limit = args.get('limit', 10)
        entries = journal_service.get_all_entries()[:limit]
        return [
            {'id': e.id, 'title': e.title, 'date': str(e.date), 'mood': e.mood, 'energy': e.energy}
            for e in entries
        ]
    
    elif name == "create_journal_entry":
        entry = journal_service.create_entry(
            title=args['title'],
            content=args['content'],
            entry_date=today,
            mood=args.get('mood'),
            energy=args.get('energy')
        )
        return {'id': entry.id, 'title': entry.title}
    
    elif name == "get_mood_stats":
        days = args.get('days', 30)
        return journal_service.get_mood_stats(days)
    
    elif name == "detect_mood_patterns":
        return journal_service.detect_mood_patterns()
    
    # Projects tools
    elif name == "get_all_projects":
        projects = projects_service.get_all_projects()
        return [
            {'id': p.id, 'name': p.name, 'color': p.color, 'stats': p.get_stats()}
            for p in projects
        ]
    
    elif name == "get_project_overview":
        return projects_service.get_project_overview(args['project_id'])
    
    elif name == "create_project":
        project = projects_service.create_project(
            name=args['name'],
            description=args.get('description', ''),
            color=args.get('color', '#6366F1')
        )
        return {'id': project.id, 'name': project.name}
    
    # Utility
    elif name == "get_daily_summary":
        all_tasks = tasks_service.get_all_tasks()
        overdue = tasks_service.get_overdue_tasks()
        finance_summary = finance_service.get_monthly_summary(today.year, today.month)
        budget_alerts = finance_service.check_budget_alerts()
        mood_stats = journal_service.get_mood_stats(7)
        
        return {
            'date': str(today),
            'tasks': {
                'inbox': len([t for t in all_tasks if t.status == 'INBOX']),
                'todo': len([t for t in all_tasks if t.status == 'TODO']),
                'overdue': len(overdue)
            },
            'finance': {
                'income': finance_summary['income'],
                'expense': finance_summary['expense'],
                'balance': finance_summary['balance'],
                'alerts_count': len(budget_alerts)
            },
            'mood': {
                'avg_mood_7d': mood_stats['average_mood'],
                'avg_energy_7d': mood_stats['average_energy']
            }
        }
    
    return {"error": f"Unknown tool: {name}"}


# System prompt for the AI
SYSTEM_PROMPT = """Eres LifeOS AI, un asistente personal inteligente que ayuda a gestionar tareas, finanzas, y bienestar.

Tienes acceso a las siguientes capacidades:
- **Finanzas**: Ver transacciones, añadir gastos/ingresos, revisar presupuestos, gestionar metas de ahorro
- **Tareas**: Crear, completar y organizar tareas, ver tareas atrasadas, estadísticas de productividad
- **Diario**: Crear entradas, rastrear estado de ánimo y energía, detectar patrones
- **Proyectos**: Organizar todo por proyectos que conectan tareas, finanzas y diario

Responde siempre en español y de forma concisa. Usa las herramientas disponibles para proporcionar información actualizada.
Cuando el usuario pida un resumen, usa get_daily_summary para obtener datos actualizados.

IMPORTANTE: 
- Para modificar o eliminar elementos (tareas, entradas, proyectos), PRIMERO debes buscar el ID usando herramientas como get_all_tasks, search_project, o get_recent_journal_entries.
- No inventes IDs. Si no tienes el ID, búscalo primero.
- Para objetivos, asegúrate de tener el project_id válido.
"""


def chat(user_message: str) -> str:
    """Process a user message and return AI response with tool calls."""
    
    # Create function declarations for Gemini
    function_declarations = []
    for tool in TOOLS:
        function_declarations.append({
            "name": tool["name"],
            "description": tool["description"],
            "parameters": tool["parameters"]
        })
    
    # First call to Gemini
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            {"role": "user", "parts": [{"text": SYSTEM_PROMPT}]},
            {"role": "model", "parts": [{"text": "Entendido. Soy LifeOS AI y estoy listo para ayudarte a gestionar tu vida personal."}]},
            {"role": "user", "parts": [{"text": user_message}]}
        ],
        config={
            "tools": [{"function_declarations": function_declarations}]
        }
    )
    
    # Check if there are function calls
    if response.candidates and response.candidates[0].content.parts:
        parts = response.candidates[0].content.parts
        function_calls = []
        function_responses = []
        
        for part in parts:
            if hasattr(part, 'function_call') and part.function_call:
                fc = part.function_call
                tool_name = fc.name
                tool_args = dict(fc.args) if fc.args else {}
                
                # Execute the tool
                result = execute_tool(tool_name, tool_args)
                function_calls.append(part)
                function_responses.append({
                    "function_response": {
                        "name": tool_name,
                        "response": {"result": result}
                    }
                })
        
        # If there were function calls, make a second call with results
        if function_calls:
            final_response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[
                    {"role": "user", "parts": [{"text": SYSTEM_PROMPT}]},
                    {"role": "model", "parts": [{"text": "Entendido. Soy LifeOS AI."}]},
                    {"role": "user", "parts": [{"text": user_message}]},
                    {"role": "model", "parts": function_calls},
                    {"role": "user", "parts": function_responses}
                ],
                config={
                    "tools": [{"function_declarations": function_declarations}]
                }
            )
            
            if final_response.candidates and final_response.candidates[0].content.parts:
                for part in final_response.candidates[0].content.parts:
                    if hasattr(part, 'text') and part.text:
                        return part.text
    
    # Return text response if no function calls
    if response.candidates and response.candidates[0].content.parts:
        for part in response.candidates[0].content.parts:
            if hasattr(part, 'text') and part.text:
                return part.text
    
    return "No pude procesar tu solicitud."


def main():
    """Interactive chat loop."""
    print("\n🧠 LifeOS AI - Tu asistente personal inteligente")
    print("=" * 50)
    print("Escribe 'salir' para terminar.\n")
    
    while True:
        try:
            user_input = input("Tú: ").strip()
            if not user_input:
                continue
            if user_input.lower() in ['salir', 'exit', 'quit']:
                print("\n¡Hasta luego! 👋")
                break
            
            response = chat(user_input)
            print(f"\n🤖 LifeOS: {response}\n")
            
        except KeyboardInterrupt:
            print("\n\n¡Hasta luego! 👋")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}\n")


if __name__ == "__main__":
    main()
