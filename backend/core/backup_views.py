from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.core.serializers.json import DjangoJSONEncoder
import json
from datetime import datetime

# Import all models
from tasks.models import Task
from projects.models import Project, Objective
from journal.models import Entry, Category
from finance.models import Transaction, FinanceCategory, Budget, SavingsGoal

# Import all serializers
from tasks.serializers import TaskSerializer
from projects.serializers import ProjectSerializer, ObjectiveSerializer
from journal.serializers import EntrySerializer, CategorySerializer
from finance.serializers import (
    TransactionSerializer, 
    FinanceCategorySerializer, 
    BudgetSerializer, 
    SavingsGoalSerializer
)


@require_http_methods(["GET"])
def export_all_data(request):
    """
    Export all user data to a single JSON file.
    Returns a downloadable JSON file with all tasks, projects, journal entries, and finance data.
    """
    try:
        # Serialize all data
        # For projects, we need to exclude the computed 'stats' field during export
        projects_data = []
        for project in Project.objects.all():
            proj_dict = {
                'id': project.id,
                'name': project.name,
                'description': project.description,
                'color': project.color,
                'icon': project.icon,
                'is_active': project.is_active,
                'created_at': project.created_at.isoformat() if project.created_at else None,
                'updated_at': project.updated_at.isoformat() if project.updated_at else None,
            }
            projects_data.append(proj_dict)
        
        data = {
            'export_date': datetime.now().isoformat(),
            'version': '1.0',
            'data': {
                # Tasks
                'tasks': list(TaskSerializer(Task.objects.all(), many=True).data),
                
                # Projects & Objectives
                'projects': projects_data,
                'objectives': list(ObjectiveSerializer(Objective.objects.all(), many=True).data),
                
                # Journal
                'journal_categories': list(CategorySerializer(Category.objects.all(), many=True).data),
                'journal_entries': list(EntrySerializer(Entry.objects.all(), many=True).data),
                
                # Finance
                'finance_categories': list(FinanceCategorySerializer(FinanceCategory.objects.all(), many=True).data),
                'transactions': list(TransactionSerializer(Transaction.objects.all(), many=True).data),
                'budgets': list(BudgetSerializer(Budget.objects.all(), many=True).data),
                'savings_goals': list(SavingsGoalSerializer(SavingsGoal.objects.all(), many=True).data),
            }
        }
        
        # Create filename with current date
        filename = f"second-brain-backup-{datetime.now().strftime('%Y-%m-%d')}.json"
        
        # Return as downloadable file
        response = HttpResponse(
            json.dumps(data, indent=2, ensure_ascii=False, cls=DjangoJSONEncoder),
            content_type='application/json'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def import_all_data(request):
    """
    Import data from a JSON backup file.
    Replaces all existing data with the imported data.
    """
    try:
        # Parse JSON data
        data = json.loads(request.body)
        
        # Validate format
        if 'data' not in data:
            return JsonResponse({
                'success': False,
                'error': 'Invalid backup file format: missing "data" key'
            }, status=400)
        
        import_data = data['data']
        
        # Use atomic transaction to ensure all-or-nothing import
        with transaction.atomic():
            # Clear existing data (in reverse order of dependencies)
            Task.objects.all().delete()
            Objective.objects.all().delete()
            Entry.objects.all().delete()
            Category.objects.all().delete()
            Budget.objects.all().delete()
            Transaction.objects.all().delete()
            SavingsGoal.objects.all().delete()
            FinanceCategory.objects.all().delete()
            Project.objects.all().delete()
            
            # Import data in order of dependencies
            stats = {
                'projects': 0,
                'objectives': 0,
                'tasks': 0,
                'journal_categories': 0,
                'journal_entries': 0,
                'finance_categories': 0,
                'transactions': 0,
                'budgets': 0,
                'savings_goals': 0,
            }
            
            # 1. Projects (no dependencies)
            if 'projects' in import_data:
                for item in import_data['projects']:
                    # Remove computed fields
                    item.pop('stats', None)
                    Project.objects.create(**item)
                    stats['projects'] += 1
            
            # 2. Objectives (depends on Projects)
            if 'objectives' in import_data:
                for item in import_data['objectives']:
                    Objective.objects.create(**item)
                    stats['objectives'] += 1
            
            # 3. Tasks (depends on Projects)
            if 'tasks' in import_data:
                for item in import_data['tasks']:
                    Task.objects.create(**item)
                    stats['tasks'] += 1
            
            # 4. Journal Categories (no dependencies)
            if 'journal_categories' in import_data:
                for item in import_data['journal_categories']:
                    Category.objects.create(**item)
                    stats['journal_categories'] += 1
            
            # 5. Journal Entries (depends on Categories and Projects)
            if 'journal_entries' in import_data:
                for item in import_data['journal_entries']:
                    # Remove computed fields
                    item.pop('category_detail', None)
                    Entry.objects.create(**item)
                    stats['journal_entries'] += 1
            
            # 6. Finance Categories (no dependencies)
            if 'finance_categories' in import_data:
                for item in import_data['finance_categories']:
                    FinanceCategory.objects.create(**item)
                    stats['finance_categories'] += 1
            
            # 7. Transactions (depends on Finance Categories and Projects)
            if 'transactions' in import_data:
                for item in import_data['transactions']:
                    # Remove computed fields
                    item.pop('category_name', None)
                    item.pop('category_color', None)
                    Transaction.objects.create(**item)
                    stats['transactions'] += 1
            
            # 8. Budgets (depends on Finance Categories)
            if 'budgets' in import_data:
                for item in import_data['budgets']:
                    # Remove computed fields
                    item.pop('category_name', None)
                    item.pop('category_color', None)
                    item.pop('spent', None)
                    item.pop('percentage', None)
                    Budget.objects.create(**item)
                    stats['budgets'] += 1
            
            # 9. Savings Goals (no dependencies)
            if 'savings_goals' in import_data:
                for item in import_data['savings_goals']:
                    # Remove computed fields
                    item.pop('percentage', None)
                    SavingsGoal.objects.create(**item)
                    stats['savings_goals'] += 1
        
        return JsonResponse({
            'success': True,
            'message': 'Data imported successfully',
            'stats': stats
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON format'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Import failed: {str(e)}'
        }, status=500)
