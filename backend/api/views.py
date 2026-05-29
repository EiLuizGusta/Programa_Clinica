from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Empresa, EmpresaLogin, Paciente, PacienteAnamnese, PacienteExameClinico, DentesExameClinico, DentesExameClinicoPosExame
from .serializers import (
    EmpresaSerializer, EmpresaLoginSerializer, PacienteSerializer, PacienteAnamneseSerializer, PacienteExameClinicoSerializer, DentesExameClinicoSerializer, DentesExameClinicoPosExameSerializer
)
from django.db.models import Max

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    login = request.data.get('login', '').strip()
    senha = request.data.get('senha', '').strip()

    if login == 'luiz' and senha == '1003':
        return Response({'success': True})
    
    return Response({'error': 'Credenciais inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

# ── Autenticação customizada (empresa_login) ──────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    login = request.data.get('login', '').strip()
    senha = request.data.get('senha', '').strip()

    if not login or not senha:
        return Response(
            {'error': 'Login e senha são obrigatórios.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        empresa_login = EmpresaLogin.objects.select_related('empresa').get(login=login)
    except EmpresaLogin.DoesNotExist:
        return Response(
            {'error': 'Credenciais inválidas.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if empresa_login.senha != senha:
        return Response(
            {'error': 'Credenciais inválidas.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Usa (ou cria) um usuário Django genérico apenas para gerar o JWT
    system_user, _ = User.objects.get_or_create(username='clinica_system')
    empresa = empresa_login.empresa

    refresh = RefreshToken.for_user(system_user)
    refresh['empresa_id'] = empresa.id
    refresh['empresa_nome'] = empresa.nome_fantasia

    logo_base64 = empresa.logo if empresa.logo else None

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'empresa': {
            'id': empresa.id,
            'razao_social': empresa.razao_social,
            'nome_fantasia': empresa.nome_fantasia,
            'logo': logo_base64,
        },
    })

def get_empresa_id(request):
    if request.auth:
        return request.auth.get('empresa_id')
    return None

# ── ViewSets ──────────────────────────────────────────────────────────────────

class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.all().order_by('nome_fantasia')
    serializer_class = EmpresaSerializer
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

class EmpresaLoginViewSet(viewsets.ModelViewSet):
    serializer_class = EmpresaLoginSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        empresa_id = self.request.query_params.get('empresa_id')
        if empresa_id:
            return EmpresaLogin.objects.filter(empresa_id=empresa_id)
        return EmpresaLogin.objects.all()

class PacienteViewSet(viewsets.ModelViewSet):
    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        empresa_id = get_empresa_id(self.request)

        return Paciente.objects.filter(
            empresa_id=empresa_id
        ).order_by('classificacao')

    def perform_create(self, serializer):
        empresa_id = get_empresa_id(self.request)

        ultima_classificacao = (
            Paciente.objects
            .filter(empresa_id=empresa_id)
            .aggregate(Max('classificacao'))
        )['classificacao__max']

        nova_classificacao = (
            1 if ultima_classificacao is None
            else ultima_classificacao + 1
        )

        serializer.save(
            empresa_id=empresa_id,
            classificacao=nova_classificacao
        )

class PacienteAnamneseViewSet(viewsets.ModelViewSet):
    serializer_class = PacienteAnamneseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        empresa_id = get_empresa_id(self.request)
        queryset = PacienteAnamnese.objects.filter(paciente__empresa_id=empresa_id)

        paciente_id = self.request.query_params.get('paciente_id')
        if paciente_id:
            queryset = queryset.filter(paciente_id=paciente_id)

        return queryset

class PacienteExameClinicoViewSet(viewsets.ModelViewSet):
    serializer_class = PacienteExameClinicoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        empresa_id = get_empresa_id(self.request)
        queryset = PacienteExameClinico.objects.filter(paciente__empresa_id=empresa_id)

        paciente_id = self.request.query_params.get('paciente_id')
        if paciente_id:
            queryset = queryset.filter(paciente_id=paciente_id)

        return queryset

class DentesExameClinicoViewSet(viewsets.ModelViewSet):
    serializer_class = DentesExameClinicoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        empresa_id = get_empresa_id(self.request)
        queryset = DentesExameClinico.objects.filter(exame_clinico__paciente__empresa_id=empresa_id)

        exame_clinico_id = self.request.query_params.get('exame_clinico_id')
        if exame_clinico_id:
            queryset = queryset.filter(exame_clinico_id=exame_clinico_id)

        return queryset

class DentesExameClinicoPosExameViewSet(viewsets.ModelViewSet):
    serializer_class = DentesExameClinicoPosExameSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        empresa_id = get_empresa_id(self.request)
        queryset = DentesExameClinicoPosExame.objects.filter(
            exame_clinico__paciente__empresa_id=empresa_id
        )

        exame_clinico_id = self.request.query_params.get('exame_clinico_id')
        if exame_clinico_id:
            queryset = queryset.filter(exame_clinico_id=exame_clinico_id)

        return queryset
