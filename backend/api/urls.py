from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'empresas', views.EmpresaViewSet, basename='empresa')
router.register(r'empresa-logins', views.EmpresaLoginViewSet, basename='empresa-login')
router.register(r'pacientes', views.PacienteViewSet, basename='paciente')
router.register(r'anamneses', views.PacienteAnamneseViewSet, basename='anamnese')
router.register(r'exames-clinicos', views.PacienteExameClinicoViewSet, basename='exame-clinico')
router.register(r'dentes-exame-clinico', views.DentesExameClinicoViewSet, basename='dente-exame-clinico')
router.register(r'dentes-exame-clinico-pos-exame', views.DentesExameClinicoPosExameViewSet, basename='dente-exame-clinico-pos-exame')

urlpatterns = [
    path('auth/login/', views.login_view, name='login'),
    path('auth/admin-login/', views.admin_login),
    path('', include(router.urls)),
]
