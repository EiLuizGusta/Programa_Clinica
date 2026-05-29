import base64
import uuid
from django.core.files.base import ContentFile
from rest_framework import serializers
from .models import Empresa, EmpresaLogin, Paciente, PacienteAnamnese, PacienteExameClinico, DentesExameClinico, DentesExameClinicoPosExame


class Base64ImageField(serializers.ImageField):
    """
    Aceita imagens tanto como upload multipart quanto como string base64.
    Formato base64 esperado: 'data:image/png;base64,<dados>'
    """

    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith('data:'):
            try:
                header, imgstr = data.split(';base64,')
                ext = header.split('/')[-1]
                if ext not in ['png', 'jpg', 'jpeg', 'gif', 'webp']:
                    ext = 'png'
                data = ContentFile(
                    base64.b64decode(imgstr),
                    name=f'{uuid.uuid4()}.{ext}'
                )
            except Exception:
                self.fail('invalid_image')
        return super().to_internal_value(data)

    def to_representation(self, value):
        if not value:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(value.url)
        return value.url

# ── EmpresaLogin ─────────────────────────────────────────────────────────────

class EmpresaLoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmpresaLogin
        fields = ['id', 'login', 'senha', 'empresa']

class EmpresaLoginListSerializer(serializers.ModelSerializer):
    """Versão leve para listar dentro do modal de empresa."""
    class Meta:
        model = EmpresaLogin
        fields = ['id', 'login', 'empresa']

# ── Empresa ──────────────────────────────────────────────────────────────────

class EmpresaSerializer(serializers.ModelSerializer):
    logo = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    logins = EmpresaLoginListSerializer(many=True, read_only=True)

    class Meta:
        model = Empresa
        fields = ['id', 'razao_social', 'nome_fantasia', 'cnpj', 'logo', 'logins']

# ── Paciente ─────────────────────────────────────────────────────────────────

class PacienteSerializer(serializers.ModelSerializer):
    assinatura = Base64ImageField(required=False, allow_null=True)

    class Meta:
        model = Paciente
        fields = '__all__'
        read_only_fields = ['classificacao']

# ── PacienteAnamnese ─────────────────────────────────────────────────────────

class PacienteAnamneseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PacienteAnamnese
        fields = '__all__'
        read_only_fields = ['data_anamnese']

# ── PacienteExameClinico ─────────────────────────────────────────────────────

class PacienteExameClinicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PacienteExameClinico
        fields = '__all__'
        read_only_fields = ['data_exame']

# ── DentesExameClinico ───────────────────────────────────────────────────────

class DentesExameClinicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DentesExameClinico
        fields = '__all__'

class DentesExameClinicoPosExameSerializer(serializers.ModelSerializer):
    class Meta:
        model = DentesExameClinicoPosExame
        fields = '__all__'