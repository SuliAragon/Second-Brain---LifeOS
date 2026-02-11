"""
LifeOS Chat API View
Handles chat requests with multi-provider support (Groq, OpenAI, Anthropic, Together, OpenRouter).
"""
import json
from datetime import date, datetime, timedelta

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# Import services for tool execution
from services import finance_service, tasks_service, journal_service, projects_service


# Tool definitions for function calling
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_daily_summary",
            "description": "Obtiene un resumen completo del día: tareas, finanzas y estado de ánimo.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_all_tasks",
            "description": "Obtiene todas las tareas del usuario.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_tasks_by_status",
            "description": "Obtiene tareas por estado: INBOX, TODO, DONE.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {"type": "string", "enum": ["INBOX", "TODO", "DONE"]}
                },
                "required": ["status"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_task",
            "description": "Crea una nueva tarea. Por defecto se crea como TODO (pendiente, marcada en rojo en el calendario).",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Título de la tarea"},
                    "due_date": {"type": "string", "description": "Fecha de vencimiento YYYY-MM-DD"},
                    "due_time": {"type": "string", "description": "Hora de la tarea HH:MM (formato 24h)"},
                    "status": {"type": "string", "enum": ["INBOX", "TODO"], "description": "Estado de la tarea. TODO = pendiente (rojo), INBOX = bandeja de entrada"}
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Marca una tarea como completada. Puedes usar el ID o buscar por título.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {"type": "integer", "description": "ID de la tarea (si lo conoces)"},
                    "task_title": {"type": "string", "description": "Título o parte del título de la tarea a completar"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_overdue_tasks",
            "description": "Obtiene las tareas vencidas.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_financial_summary",
            "description": "Obtiene resumen financiero del mes: ingresos, gastos, balance.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_transaction",
            "description": "Añade una transacción financiera (ingreso o gasto).",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Descripción del gasto/ingreso"},
                    "amount": {"type": "number", "description": "Cantidad en euros"},
                    "transaction_type": {"type": "string", "enum": ["INCOME", "EXPENSE"]}
                },
                "required": ["title", "amount", "transaction_type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_budget_status",
            "description": "Obtiene el estado de los presupuestos del mes actual.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "check_budget_alerts",
            "description": "Comprueba si hay alertas de presupuesto (>70% o >90%).",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_savings_goals",
            "description": "Obtiene todas las metas de ahorro con su progreso.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_mood_stats",
            "description": "Obtiene estadísticas de estado de ánimo y energía.",
            "parameters": {
                "type": "object",
                "properties": {
                    "days": {"type": "integer", "description": "Número de días a analizar", "default": 30}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_all_projects",
            "description": "Obtiene todos los proyectos con sus estadísticas.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    # Journal tools
    {
        "type": "function",
        "function": {
            "name": "get_journal_categories",
            "description": "Obtiene todas las categorías del diario disponibles.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "write_journal_entry",
            "description": "Escribe una nueva entrada en el diario. Puede especificar una categoría existente o crear una nueva.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Título de la entrada"},
                    "content": {"type": "string", "description": "Contenido de la entrada"},
                    "category_name": {"type": "string", "description": "Nombre de la categoría (existente o nueva a crear)"},
                    "mood": {"type": "integer", "description": "Estado de ánimo 1-5"},
                    "energy": {"type": "integer", "description": "Nivel de energía 1-5"}
                },
                "required": ["title", "content"]
            }
        }
    },
    # Project tools
    {
        "type": "function",
        "function": {
            "name": "create_project",
            "description": "Crea un nuevo proyecto.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Nombre del proyecto"},
                    "description": {"type": "string", "description": "Descripción del proyecto"},
                    "color": {"type": "string", "description": "Color en formato hex (#RRGGBB)"}
                },
                "required": ["name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_project_objective",
            "description": "Añade un objetivo a un proyecto existente. IMPORTANTE: Primero busca el project_id usando get_all_projects.",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_id": {"type": "integer", "description": "ID del proyecto (NO el nombre, busca el ID primero)"},
                    "title": {"type": "string", "description": "Título del objetivo"},
                    "description": {"type": "string", "description": "Descripción del objetivo"},
                    "deadline": {"type": "string", "description": "Fecha límite YYYY-MM-DD"}
                },
                "required": ["project_id", "title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_project_objectives_batch",
            "description": "Añade múltiples objetivos a un proyecto de una sola vez. Úsalo cuando tengas que crear varios objetivos.",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_id": {"type": "integer", "description": "ID del proyecto"},
                    "objectives": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "title": {"type": "string"},
                                "description": {"type": "string"},
                                "deadline": {"type": "string", "description": "YYYY-MM-DD"}
                            },
                            "required": ["title"]
                        }
                    }
                },
                "required": ["project_id", "objectives"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_objective",
            "description": "Marca un objetivo de proyecto como completado.",
            "parameters": {
                "type": "object",
                "properties": {
                    "objective_id": {"type": "integer", "description": "ID del objetivo"}
                },
                "required": ["objective_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_project_objectives",
            "description": "Obtiene los objetivos de un proyecto.",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_id": {"type": "integer", "description": "ID del proyecto"}
                },
                "required": ["project_id"]
            }
        }
    },
    # Savings Goals tools
    {
        "type": "function",
        "function": {
            "name": "create_savings_goal",
            "description": "Crea una nueva meta de ahorro con objetivo y nombre. El usuario podrá ir agregando fondos hasta alcanzar la meta.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Nombre de la meta (ej: Vacaciones, Nuevo coche)"},
                    "target_amount": {"type": "number", "description": "Cantidad objetivo a ahorrar"},
                    "initial_amount": {"type": "number", "description": "Cantidad inicial (opcional, por defecto 0)"}
                },
                "required": ["name", "target_amount"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_funds_to_goal",
            "description": "Añade fondos a una meta de ahorro existente. Incrementa el progreso hacia el objetivo.",
            "parameters": {
                "type": "object",
                "properties": {
                    "goal_name": {"type": "string", "description": "Nombre de la meta de ahorro"},
                    "amount": {"type": "number", "description": "Cantidad a agregar"}
                },
                "required": ["goal_name", "amount"]
            }
        }
    },
    # Delete tools
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Elimina una tarea. Puedes usar el ID o buscar por título.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {"type": "integer", "description": "ID de la tarea (si lo conoces)"},
                    "task_title": {"type": "string", "description": "Título o parte del título de la tarea a eliminar"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_project",
            "description": "Elimina un proyecto. Puedes usar el ID o buscar por nombre.",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_id": {"type": "integer", "description": "ID del proyecto (si lo conoces)"},
                    "project_name": {"type": "string", "description": "Nombre o parte del nombre del proyecto a eliminar"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_savings_goal",
            "description": "Elimina una meta de ahorro. Puedes usar el ID o buscar por nombre.",
            "parameters": {
                "type": "object",
                "properties": {
                    "goal_id": {"type": "integer", "description": "ID de la meta (si lo conoces)"},
                    "goal_name": {"type": "string", "description": "Nombre o parte del nombre de la meta a eliminar"}
                },
                "required": []
            }
        }
    }
]


def execute_tool(name: str, args: dict) -> dict:
    """Execute a tool and return the result."""
    today = date.today()
    
    if name == "get_daily_summary":
        all_tasks = tasks_service.get_all_tasks()
        overdue = tasks_service.get_overdue_tasks()
        finance_summary = finance_service.get_monthly_summary(today.year, today.month)
        mood_stats = journal_service.get_mood_stats(7)
        
        return {
            'fecha': str(today),
            'tareas': {
                'inbox': len([t for t in all_tasks if t.status == 'INBOX']),
                'pendientes': len([t for t in all_tasks if t.status == 'TODO']),
                'vencidas': len(overdue)
            },
            'finanzas': {
                'ingresos_mes': finance_summary['income'],
                'gastos_mes': finance_summary['expense'],
                'balance': finance_summary['balance']
            },
            'animo': {
                'promedio_7d': mood_stats['average_mood'],
                'energia_7d': mood_stats['average_energy']
            }
        }
    
    elif name == "get_all_tasks":
        tasks = tasks_service.get_all_tasks()
        return [{'id': t.id, 'titulo': t.title, 'estado': t.status, 'fecha': str(t.due_date) if t.due_date else None} for t in tasks]
    
    elif name == "get_tasks_by_status":
        tasks = tasks_service.get_tasks_by_status(args.get('status', 'TODO'))
        return [{'id': t.id, 'titulo': t.title} for t in tasks]
    
    elif name == "create_task":
        due_date = None
        due_time = None
        if args.get('due_date'):
            due_date = datetime.strptime(args['due_date'], '%Y-%m-%d').date()
        if args.get('due_time'):
            due_time = args['due_time']
        status = args.get('status', 'TODO')  # Por defecto TODO (rojo en calendario)
        task = tasks_service.create_task(
            title=args['title'], 
            due_date=due_date,
            due_time=due_time,
            status=status
        )
        return {'id': task.id, 'titulo': task.title, 'estado': task.status, 'creada': True}
    
    elif name == "complete_task":
        from tasks.models import Task
        task_id = args.get('task_id')
        task_title = args.get('task_title')
        
        if task_id:
            task = tasks_service.update_task_status(task_id, 'DONE')
        elif task_title:
            # Find task by title (case-insensitive partial match)
            matching = Task.objects.filter(title__icontains=task_title, status__in=['TODO', 'INBOX']).first()
            if not matching:
                return {'error': f"No se encontró tarea pendiente con título '{task_title}'"}
            task = tasks_service.update_task_status(matching.id, 'DONE')
        else:
            return {'error': 'Debes especificar task_id o task_title'}
        
        return {'id': task.id, 'titulo': task.title, 'completada': True}
    
    elif name == "get_overdue_tasks":
        tasks = tasks_service.get_overdue_tasks()
        return [{'id': t.id, 'titulo': t.title, 'fecha': str(t.due_date), 'dias_vencida': (today - t.due_date).days} for t in tasks]
    
    elif name == "get_financial_summary":
        return finance_service.get_monthly_summary(today.year, today.month)
    
    elif name == "add_transaction":
        tx = finance_service.create_transaction(
            title=args['title'],
            amount=args['amount'],
            transaction_type=args['transaction_type'],
            transaction_date=today
        )
        return {'id': tx.id, 'titulo': tx.title, 'cantidad': float(tx.amount), 'tipo': tx.type}
    
    elif name == "get_budget_status":
        return finance_service.get_budgets_for_month(today.year, today.month)
    
    elif name == "check_budget_alerts":
        return finance_service.check_budget_alerts()
    
    elif name == "get_savings_goals":
        goals = finance_service.get_all_savings_goals()
        return [{'id': g.id, 'nombre': g.name, 'objetivo': float(g.target_amount), 'actual': float(g.current_amount), 'porcentaje': g.get_percentage()} for g in goals]
    
    elif name == "get_mood_stats":
        days = args.get('days', 30)
        return journal_service.get_mood_stats(days)
    
    elif name == "get_all_projects":
        projects = projects_service.get_all_projects()
        return [{'id': p.id, 'nombre': p.name, 'color': p.color, 'stats': p.get_stats()} for p in projects]
    
    # Journal tools
    elif name == "get_journal_categories":
        categories = journal_service.get_all_categories()
        return [{'id': c.id, 'nombre': c.name} for c in categories]
    
    elif name == "write_journal_entry":
        # Buscar o crear categoría si se especifica
        category_id = None
        if args.get('category_name'):
            from journal.models import Category
            category, created = Category.objects.get_or_create(
                name=args['category_name']
            )
            category_id = category.id
        
        entry = journal_service.create_entry(
            title=args['title'],
            content=args['content'],
            entry_date=today,
            category_id=category_id,
            mood=args.get('mood'),
            energy=args.get('energy')
        )
        return {'id': entry.id, 'titulo': entry.title, 'categoria': args.get('category_name'), 'creada': True}
    
    # Project tools
    elif name == "create_project":
        project = projects_service.create_project(
            name=args['name'],
            description=args.get('description', ''),
            color=args.get('color', '#6366F1')
        )
        return {'id': project.id, 'nombre': project.name, 'creado': True}
    
    elif name == "add_project_objective":
        deadline = None
        if args.get('deadline'):
            deadline = datetime.strptime(args['deadline'], '%Y-%m-%d').date()
        objective = projects_service.create_objective(
            project_id=args['project_id'],
            title=args['title'],
            description=args.get('description', ''),
            deadline=deadline
        )
        if not objective:
            return {'error': f"No se encontró proyecto con ID {args['project_id']}"}
            
        return {'id': objective.id, 'titulo': objective.title, 'creado': True}
    
    elif name == "add_project_objectives_batch":
        result = projects_service.create_objectives_batch(
            project_id=args['project_id'],
            objectives=args['objectives']
        )
        if not result['success']:
            return {'error': result.get('error', 'Error creating objectives')}
        return result
    
    elif name == "complete_objective":
        objective = projects_service.update_objective_status(args['objective_id'], 'COMPLETED')
        return {'id': objective.id, 'titulo': objective.title, 'completado': True}
    
    elif name == "get_project_objectives":
        objectives = projects_service.get_project_objectives(args['project_id'])
        return objectives
    
    # Savings Goals tools
    elif name == "create_savings_goal":
        goal = finance_service.create_savings_goal(
            name=args['name'],
            target_amount=args['target_amount'],
            current_amount=args.get('initial_amount', 0)
        )
        return {
            'id': goal.id, 
            'nombre': goal.name, 
            'objetivo': float(goal.target_amount),
            'actual': float(goal.current_amount),
            'porcentaje': float(goal.get_percentage()),
            'creada': True
        }
    
    elif name == "add_funds_to_goal":
        from finance.models import SavingsGoal
        try:
            goal = SavingsGoal.objects.get(name__icontains=args['goal_name'])
            goal = finance_service.add_funds_to_goal(goal.id, args['amount'])
            return {
                'id': goal.id,
                'nombre': goal.name,
                'nuevo_saldo': float(goal.current_amount),
                'objetivo': float(goal.target_amount),
                'porcentaje': float(goal.get_percentage()),
                'agregado': float(args['amount'])
            }
        except SavingsGoal.DoesNotExist:
            return {'error': f"No se encontró meta de ahorro con nombre '{args['goal_name']}'"}
    
    # Delete tools execution
    elif name == "delete_task":
        from tasks.models import Task
        task_id = args.get('task_id')
        task_title = args.get('task_title')
        
        try:
            if task_id:
                task = Task.objects.get(id=task_id)
            elif task_title:
                task = Task.objects.filter(title__icontains=task_title).first()
                if not task:
                    return {'error': f"No se encontró tarea con título '{task_title}'"}
            else:
                return {'error': 'Debes especificar task_id o task_title'}
            
            task_name = task.title
            task.delete()
            return {'eliminada': True, 'titulo': task_name}
        except Task.DoesNotExist:
            return {'error': f"No se encontró tarea con ID {task_id}"}
    
    elif name == "delete_project":
        from projects.models import Project
        project_id = args.get('project_id')
        project_name = args.get('project_name')
        
        try:
            if project_id:
                project = Project.objects.get(id=project_id)
            elif project_name:
                project = Project.objects.filter(name__icontains=project_name).first()
                if not project:
                    return {'error': f"No se encontró proyecto con nombre '{project_name}'"}
            else:
                return {'error': 'Debes especificar project_id o project_name'}
            
            proj_name = project.name
            project.delete()
            return {'eliminado': True, 'nombre': proj_name}
        except Project.DoesNotExist:
            return {'error': f"No se encontró proyecto con ID {project_id}"}
    
    elif name == "delete_savings_goal":
        from finance.models import SavingsGoal
        goal_id = args.get('goal_id')
        goal_name = args.get('goal_name')
        
        try:
            if goal_id:
                goal = SavingsGoal.objects.get(id=goal_id)
            elif goal_name:
                goal = SavingsGoal.objects.filter(name__icontains=goal_name).first()
                if not goal:
                    return {'error': f"No se encontró meta de ahorro con nombre '{goal_name}'"}
            else:
                return {'error': 'Debes especificar goal_id o goal_name'}
            
            g_name = goal.name
            goal.delete()
            return {'eliminada': True, 'nombre': g_name}
        except SavingsGoal.DoesNotExist:
            return {'error': f"No se encontró meta de ahorro con ID {goal_id}"}
    
    return {"error": f"Herramienta desconocida: {name}"}


SYSTEM_PROMPT = """Eres LifeOS AI, un asistente personal inteligente que ayuda a gestionar la vida del usuario.

Tienes acceso a herramientas para:
- Ver y gestionar tareas (crear, completar, ELIMINAR, ver pendientes/vencidas)
- Ver resumen financiero, añadir gastos/ingresos, revisar presupuestos
- Crear, gestionar y ELIMINAR METAS DE AHORRO (create_savings_goal, add_funds_to_goal, delete_savings_goal)
- Ver estadísticas de estado de ánimo
- Gestionar proyectos y sus objetivos (crear, ELIMINAR)
- Escribir entradas en el diario

IMPORTANTE:
- Cuando el usuario quiera crear una meta de ahorro (ej: "quiero ahorrar 5000€ para vacaciones"), usa create_savings_goal
- Cuando el usuario diga que ha ahorrado dinero (ej: "he ahorrado 100€"), usa add_funds_to_goal
- Cuando el usuario quiera ELIMINAR algo (tarea, proyecto, meta de ahorro), usa delete_task, delete_project o delete_savings_goal
- NO confundas metas de ahorro con ingresos. Los ingresos son dinero que entra, las metas de ahorro son objetivos a largo plazo.
- Antes de añadir un objetivo a un proyecto, PRIMERO usa get_all_projects para encontrar el ID del proyecto correcto.

Responde siempre en español de forma concisa y amigable. Usa emojis cuando sea apropiado.
Cuando el usuario pregunte por su día o resumen, usa get_daily_summary.
Cuando pida añadir un gasto, usa add_transaction con type EXPENSE.
Cuando pida añadir un ingreso, usa add_transaction con type INCOME.
Cuando debas crear VARIOS objetivos para un proyecto, usa add_project_objectives_batch para hacerlo en una sola llamada."""



def get_client_for_provider(provider: str, api_key: str):
    """Create appropriate client based on provider."""
    if provider == 'groq':
        from groq import Groq
        return Groq(api_key=api_key), 'groq'
    elif provider == 'openai':
        from openai import OpenAI
        return OpenAI(api_key=api_key), 'openai'
    elif provider == 'anthropic':
        import anthropic
        return anthropic.Anthropic(api_key=api_key), 'anthropic'
    elif provider == 'together':
        from openai import OpenAI
        return OpenAI(api_key=api_key, base_url="https://api.together.xyz/v1"), 'openai'
    elif provider == 'openrouter':
        from openai import OpenAI
        return OpenAI(api_key=api_key, base_url="https://openrouter.ai/api/v1"), 'openai'
    else:
        from groq import Groq
        return Groq(api_key=api_key), 'groq'


def call_openai_compatible(client, model: str, messages: list, tools: list):
    """Call OpenAI-compatible API (OpenAI, Together, OpenRouter, Groq)."""
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        tools=tools,
        tool_choice="auto",
        max_tokens=1024
    )
    return response


def call_anthropic(client, model: str, messages: list, tools: list):
    """Call Anthropic API with tool support."""
    # Convert tools to Anthropic format
    anthropic_tools = []
    for tool in tools:
        anthropic_tools.append({
            "name": tool["function"]["name"],
            "description": tool["function"]["description"],
            "input_schema": tool["function"]["parameters"]
        })
    
    # Extract system message and convert messages
    system_msg = ""
    anthropic_messages = []
    for msg in messages:
        if msg["role"] == "system":
            system_msg = msg["content"]
        else:
            anthropic_messages.append(msg)
    
    response = client.messages.create(
        model=model,
        max_tokens=1024,
        system=system_msg,
        messages=anthropic_messages,
        tools=anthropic_tools
    )
    return response

@csrf_exempt
@require_http_methods(["POST"])
def chat_api(request):
    """Handle chat requests with multi-provider support and conversation memory."""
    try:
        data = json.loads(request.body)
        user_message = data.get('message', '')
        conversation_history = data.get('conversation_history', [])
        provider = data.get('provider', 'groq')
        api_key = data.get('api_key', '')
        model = data.get('model', 'llama-3.1-70b-versatile')

        mask_key = f"{api_key[:4]}...{api_key[-4:]}" if api_key and len(api_key) > 8 else "INVALID/EMPTY"
        print(f"DEBUG: Chat Request - Provider: {provider}, Model: {model}, Key: {mask_key}")

        
        if not user_message:
            return JsonResponse({'error': 'Mensaje vacío'}, status=400)
        
        if not api_key:
            return JsonResponse({'error': 'API key no configurada. Ve a Configuración.'}, status=400)
        
        # Get appropriate client
        client, client_type = get_client_for_provider(provider, api_key)
        
        # Build system prompt with current date
        today = date.today()
        dynamic_prompt = f"""{SYSTEM_PROMPT}

INFORMACIÓN IMPORTANTE:
- Fecha actual: {today.strftime('%Y-%m-%d')} ({today.strftime('%A, %d de %B de %Y')})
- Cuando el usuario diga "mañana", calcula la fecha como {(today + timedelta(days=1)).strftime('%Y-%m-%d')}
- Cuando el usuario diga "pasado mañana", calcula la fecha como {(today + timedelta(days=2)).strftime('%Y-%m-%d')}
- Siempre usa el formato YYYY-MM-DD para las fechas en las herramientas."""
        
        # Build messages with conversation history
        messages = [{"role": "system", "content": dynamic_prompt}]
        
        # Add conversation history (limit to last 20 messages to avoid token limits)
        history_limit = conversation_history[-20:] if len(conversation_history) > 20 else conversation_history
        for msg in history_limit:
            if msg.get('role') in ['user', 'assistant'] and msg.get('content'):
                messages.append({"role": msg['role'], "content": msg['content']})
        
        tools_used = []
        
        if client_type == 'anthropic':
            # Anthropic flow with iterative tool calling
            max_iterations = 5
            iteration = 0
            
            while iteration < max_iterations:
                iteration += 1
                response = call_anthropic(client, model, messages, TOOLS)
                
                # Check for tool use
                tool_uses = [block for block in response.content if block.type == "tool_use"]
                
                if tool_uses:
                    # Execute tools
                    tool_results = []
                    for tool_use in tool_uses:
                        tool_name = tool_use.name
                        tool_args = tool_use.input
                        tools_used.append(tool_name)
                        
                        result = execute_tool(tool_name, tool_args)
                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": tool_use.id,
                            "content": json.dumps(result, ensure_ascii=False)
                        })
                    
                    # Add assistant message and tool results
                    messages.append({"role": "assistant", "content": response.content})
                    messages.append({"role": "user", "content": tool_results})
                    
                    # Continue loop to allow more tool calls
                else:
                    # No more tool calls, return final response
                    text_content = next((b.text for b in response.content if hasattr(b, 'text')), '')
                    return JsonResponse({
                        'response': text_content,
                        'tools_used': tools_used
                    })
            
            # Max iterations reached, return last response
            text_content = next((b.text for b in response.content if hasattr(b, 'text')), '')
            return JsonResponse({
                'response': text_content,
                'tools_used': tools_used
            })
        
        else:
            # OpenAI-compatible flow (Groq, OpenAI, Together, OpenRouter) with iterative tool calling
            max_iterations = 5
            iteration = 0
            
            while iteration < max_iterations:
                iteration += 1
                response = call_openai_compatible(client, model, messages, TOOLS)
                assistant_message = response.choices[0].message
                
                # Check for tool calls
                if assistant_message.tool_calls:
                    messages.append(assistant_message)
                    
                    for tool_call in assistant_message.tool_calls:
                        tool_name = tool_call.function.name
                        tool_args = json.loads(tool_call.function.arguments) if tool_call.function.arguments else {}
                        tools_used.append(tool_name)
                        
                        result = execute_tool(tool_name, tool_args)
                        
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": json.dumps(result, ensure_ascii=False)
                        })
                    
                    # Continue loop to allow more tool calls
                else:
                    # No more tool calls, return final response
                    return JsonResponse({
                        'response': assistant_message.content,
                        'tools_used': tools_used
                    })
            
            # Max iterations reached, return last response
            return JsonResponse({
                'response': assistant_message.content,
                'tools_used': tools_used
            })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

