from django.contrib import admin
from .models import Empresa, EmpresaLogin, Paciente, PacienteAnamnese


class EmpresaLoginInline(admin.TabularInline):
    model = EmpresaLogin
    extra = 1


@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ['id', 'razao_social', 'nome_fantasia', 'cnpj']
    search_fields = ['razao_social', 'nome_fantasia', 'cnpj']
    inlines = [EmpresaLoginInline]


@admin.register(EmpresaLogin)
class EmpresaLoginAdmin(admin.ModelAdmin):
    list_display = ['id', 'login', 'empresa']
    search_fields = ['login', 'empresa__nome_fantasia']


@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ['id', 'nome', 'cpf', 'celular', 'email']
    search_fields = ['nome', 'cpf', 'email']


@admin.register(PacienteAnamnese)
class PacienteAnamneseAdmin(admin.ModelAdmin):
    list_display = ['id', 'paciente', 'data_anamnese']
    search_fields = ['paciente__nome']
    list_filter = ['data_anamnese']
