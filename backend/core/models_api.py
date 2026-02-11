"""
Models API - Fetch available AI models from providers
Provides real-time model lists from OpenRouter and other AI providers.
"""
import requests
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.cache import cache


# Fallback models if API fails
FALLBACK_MODELS = {
    'openrouter': [
        {'id': 'anthropic/claude-3.5-sonnet', 'name': 'Claude 3.5 Sonnet', 'description': 'Via OpenRouter'},
        {'id': 'openai/gpt-4o', 'name': 'GPT-4o', 'description': 'Via OpenRouter'},
        {'id': 'google/gemini-pro-1.5', 'name': 'Gemini 1.5 Pro', 'description': 'Via OpenRouter'},
    ],
    'groq': [
        {'id': 'llama-3.3-70b-versatile', 'name': 'Llama 3.3 70B', 'description': 'Latest flagship'},
        {'id': 'llama-3.1-8b-instant', 'name': 'Llama 3.1 8B', 'description': 'Fast & Efficient'},
    ],
    'openai': [
        {'id': 'gpt-4o', 'name': 'GPT-4o', 'description': 'Most capable'},
        {'id': 'gpt-4o-mini', 'name': 'GPT-4o Mini', 'description': 'Fast and cost-effective'},
    ],
    'anthropic': [
        {'id': 'claude-3-5-sonnet-20241022', 'name': 'Claude 3.5 Sonnet', 'description': 'Best balance'},
        {'id': 'claude-3-opus-20240229', 'name': 'Claude 3 Opus', 'description': 'Most capable'},
    ],
    'together': [
        {'id': 'meta-llama/Llama-3-70b-chat-hf', 'name': 'Llama 3 70B', 'description': 'Meta flagship'},
    ]
}


def fetch_openrouter_models():
    """Fetch models from OpenRouter API."""
    try:
        response = requests.get(
            'https://openrouter.ai/api/v1/models',
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        # Parse models from response
        models = []
        for model in data.get('data', []):
            # Filter for popular/recommended models to avoid overwhelming UI
            # You can adjust this logic based on pricing, context_length, etc.
            models.append({
                'id': model.get('id', ''),
                'name': model.get('name', ''),
                'description': model.get('description', '')[:100] if model.get('description') else '',
                'context_length': model.get('context_length', 0),
            })
        
        return models
    except Exception as e:
        print(f"Error fetching OpenRouter models: {e}")
        return None


def fetch_groq_models():
    """Fetch models from Groq API."""
    try:
        # Note: Groq's models endpoint requires API key
        # For now, we'll use fallback or you can add API key support
        # response = requests.get('https://api.groq.com/openai/v1/models', headers={'Authorization': f'Bearer {api_key}'})
        return None  # Fallback to hardcoded for now
    except Exception as e:
        print(f"Error fetching Groq models: {e}")
        return None


@csrf_exempt
@require_http_methods(["GET"])
def get_models(request, provider):
    """
    Get available models for a provider.
    Caches results for 1 hour to avoid rate limits.
    
    GET /api/models/<provider>
    """
    # Check cache first
    cache_key = f'models_{provider}'
    cached_models = cache.get(cache_key)
    
    if cached_models:
        return JsonResponse({
            'models': cached_models,
            'cached': True,
            'provider': provider
        })
    
    # Fetch fresh models
    models = None
    
    if provider == 'openrouter':
        models = fetch_openrouter_models()
    elif provider == 'groq':
        models = fetch_groq_models()
    # Add more providers as needed
    
    # Fallback to hardcoded if API fails
    if models is None:
        models = FALLBACK_MODELS.get(provider, [])
        cached = False
    else:
        # Cache successful API response for 1 hour
        cache.set(cache_key, models, 60 * 60)
        cached = False
    
    return JsonResponse({
        'models': models,
        'cached': cached,
        'provider': provider
    })
