"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from core.chat_api import chat_api
from core.backup_views import export_all_data, import_all_data
from core.models_api import get_models

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('tasks.urls')),
    path('api/', include('finance.urls')),
    path('api/', include('journal.urls')),
    path('api/', include('projects.urls')),
    path('api/chat/', chat_api, name='chat_api'),
    path('api/backup/export/', export_all_data, name='backup_export'),
    path('api/backup/import/', import_all_data, name='backup_import'),
    path('api/models/<str:provider>/', get_models, name='get_models'),
]


