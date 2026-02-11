"""
Journal Service Module
Pure business logic functions for journal operations.
Can be used by both Django ViewSets and future MCP server.
"""
from datetime import date
from typing import Optional, List, Dict, Any
from django.db.models import Avg

from journal.models import Entry, Category


# ==================== ENTRIES ====================

def get_all_entries() -> List[Entry]:
    """Get all journal entries."""
    return list(Entry.objects.all())


def get_entries_by_category(category_id: int) -> List[Entry]:
    """Get entries for a specific category."""
    return list(Entry.objects.filter(category_id=category_id))


def get_entries_by_project(project_id: int) -> List[Entry]:
    """Get entries linked to a specific project."""
    return list(Entry.objects.filter(project_id=project_id))


def create_entry(
    title: str,
    content: str,
    entry_date: date,
    category_id: Optional[int] = None,
    project_id: Optional[int] = None,
    mood: Optional[int] = None,
    energy: Optional[int] = None,
    publication_date: Optional[date] = None
) -> Entry:
    """Create a new journal entry."""
    return Entry.objects.create(
        title=title,
        content=content,
        date=entry_date,
        publication_date=publication_date or entry_date,
        category_id=category_id,
        project_id=project_id,
        mood=mood,
        energy=energy
    )


def update_entry(
    entry_id: int,
    title: Optional[str] = None,
    content: Optional[str] = None,
    mood: Optional[int] = None,
    energy: Optional[int] = None
) -> Optional[Entry]:
    """Update a journal entry."""
    try:
        entry = Entry.objects.get(id=entry_id)
        if title:
            entry.title = title
        if content:
            entry.content = content
        if mood:
            entry.mood = mood
        if energy:
            entry.energy = energy
        entry.save()
        return entry
    except Entry.DoesNotExist:
        return None


def delete_entry(entry_id: int) -> bool:
    """Delete an entry by ID."""
    try:
        Entry.objects.filter(id=entry_id).delete()
        return True
    except Exception:
        return False


# ==================== CATEGORIES ====================

def get_all_categories() -> List[Category]:
    """Get all journal categories."""
    return list(Category.objects.all())


def create_category(name: str) -> Category:
    """Create a new journal category."""
    return Category.objects.create(name=name)


# ==================== MOOD ANALYTICS ====================

def get_mood_stats(days: int = 30) -> Dict[str, Any]:
    """
    Get mood and energy statistics for the past N days.
    Useful for agentic insights.
    """
    from datetime import timedelta
    start_date = date.today() - timedelta(days=days)
    
    entries = Entry.objects.filter(date__gte=start_date)
    entries_with_mood = entries.exclude(mood__isnull=True)
    entries_with_energy = entries.exclude(energy__isnull=True)
    
    avg_mood = entries_with_mood.aggregate(avg=Avg('mood'))['avg'] or 0
    avg_energy = entries_with_energy.aggregate(avg=Avg('energy'))['avg'] or 0
    
    # Mood distribution
    mood_distribution = {}
    for i in range(1, 6):
        mood_distribution[i] = entries_with_mood.filter(mood=i).count()
    
    return {
        'period_days': days,
        'total_entries': entries.count(),
        'entries_with_mood': entries_with_mood.count(),
        'average_mood': round(avg_mood, 2),
        'average_energy': round(avg_energy, 2),
        'mood_distribution': mood_distribution
    }


def detect_mood_patterns() -> Dict[str, Any]:
    """
    Detect patterns in mood/energy data.
    Useful for agentic recommendations.
    """
    from datetime import timedelta
    from collections import defaultdict
    
    # Get last 90 days of data
    start_date = date.today() - timedelta(days=90)
    entries = Entry.objects.filter(
        date__gte=start_date
    ).exclude(mood__isnull=True)
    
    # Analyze by day of week
    day_moods = defaultdict(list)
    for entry in entries:
        day_name = entry.date.strftime('%A')
        day_moods[day_name].append(entry.mood)
    
    day_averages = {
        day: round(sum(moods) / len(moods), 2) if moods else 0 
        for day, moods in day_moods.items()
    }
    
    best_day = max(day_averages, key=day_averages.get) if day_averages else None
    worst_day = min(day_averages, key=day_averages.get) if day_averages else None
    
    return {
        'day_averages': day_averages,
        'best_day': best_day,
        'worst_day': worst_day,
        'insight': f"Tu mejor día suele ser {best_day} y el peor {worst_day}." if best_day else "Necesitas más datos para detectar patrones."
    }
