from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ObjectiveViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'objectives', ObjectiveViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
