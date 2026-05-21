from django.db import models
import os

class Empresa(models.Model):
    razao_social = models.CharField(max_length=255, verbose_name='Razão Social')
    nome_fantasia = models.CharField(max_length=255, verbose_name='Nome Fantasia')
    cnpj = models.CharField(max_length=18, verbose_name='CNPJ')  # XX.XXX.XXX/XXXX-XX
    logo = models.ImageField(
        upload_to='logos/', null=True, blank=True, verbose_name='Logo'
    )

    class Meta:
        db_table = 'empresa'
        verbose_name = 'Empresa'
        verbose_name_plural = 'Empresas'
        ordering = ['nome_fantasia']

    def __str__(self):
        return self.nome_fantasia

    def save(self, *args, **kwargs):
            if self.pk:
                try:
                    old = Empresa.objects.get(pk=self.pk)
                    if old.logo and old.logo != self.logo:
                        try:
                            if old.logo.storage.exists(old.logo.name):
                                old.logo.storage.delete(old.logo.name)
                        except Exception:
                            pass
                except Empresa.DoesNotExist:
                    pass
            super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.logo:
            try:
                if self.logo.storage.exists(self.logo.name):
                    self.logo.storage.delete(self.logo.name)
            except Exception:
                pass
        super().delete(*args, **kwargs)

class EmpresaLogin(models.Model):
    login = models.CharField(max_length=255, verbose_name='Login')
    senha = models.CharField(max_length=255, verbose_name='Senha')
    empresa = models.ForeignKey(
        Empresa, on_delete=models.CASCADE,
        related_name='logins', verbose_name='Empresa'
    )

    class Meta:
        db_table = 'empresa_login'
        verbose_name = 'Login da Empresa'
        verbose_name_plural = 'Logins das Empresas'

    def __str__(self):
        return f'{self.login} — {self.empresa.nome_fantasia}'

class Paciente(models.Model):
    empresa = models.ForeignKey(
        Empresa,
        on_delete=models.CASCADE,
        related_name='pacientes',
        blank=True
    )

    classificacao = models.IntegerField(
        verbose_name='Classificação'
    )

    nome = models.CharField(max_length=255, verbose_name='Nome')
    cpf = models.CharField(max_length=14, verbose_name='CPF')          # XXX.XXX.XXX-XX
    rg = models.CharField(max_length=20, verbose_name='RG')            # XX.XXX.XXX-X
    celular = models.CharField(max_length=16, blank=True, verbose_name='Celular')  # (XX) XXXXX-XXXX
    telefone = models.CharField(max_length=15, blank=True, default='', verbose_name='Telefone')  # (XX) XXXX-XXXX
    email = models.EmailField(blank=True, default='', verbose_name='E-mail')
    cep = models.CharField(max_length=9, verbose_name='CEP')           # XXXXX-XXX
    endereco = models.CharField(max_length=255, blank=True, verbose_name='Endereço')
    numero = models.CharField(max_length=10, verbose_name='Número')
    bairro = models.CharField(max_length=255, blank=True, verbose_name='Bairro')
    complemento = models.CharField(max_length=255, blank=True, default='', verbose_name='Complemento')
    assinatura = models.ImageField(upload_to='assinaturas/', null=True, blank=True, verbose_name='Assinatura')

    class Meta:
        db_table = 'paciente'
        verbose_name = 'Paciente'
        verbose_name_plural = 'Pacientes'
        ordering = ['nome']

    def __str__(self):
        return self.nome

    def save(self, *args, **kwargs):
        # Remove assinatura antiga ao substituir de forma segura (Local ou Nuvem)
        if self.pk:
            try:
                old = Paciente.objects.get(pk=self.pk)
                if old.assinatura and old.assinatura != self.assinatura:
                    try:
                        if old.assinatura.storage.exists(old.assinatura.name):
                            old.assinatura.storage.delete(old.assinatura.name)
                    except Exception:
                        pass
            except Paciente.DoesNotExist:
                pass
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Remove o arquivo ao deletar o paciente
        if self.assinatura:
            try:
                if self.assinatura.storage.exists(self.assinatura.name):
                    self.assinatura.storage.delete(self.assinatura.name)
            except Exception:
                pass
        super().delete(*args, **kwargs)

class PacienteAnamnese(models.Model):
    paciente = models.ForeignKey(
        Paciente, on_delete=models.CASCADE,
        related_name='anamneses', verbose_name='Paciente'
    )
    em_tratamento_medico = models.BooleanField(
        default=False, verbose_name='Está em tratamento médico atualmente?'
    )
    em_tratamento_medico_obs = models.TextField(
        blank=True, default='', verbose_name='Qual médico / tratamento?'
    )

    usa_medicamento = models.BooleanField(
        default=False, verbose_name='Faz uso de algum medicamento regularmente?'
    )
    usa_medicamento_obs = models.TextField(
        blank=True, default='', verbose_name='Qual(is) medicamento(s)?'
    )

    alergia_medicamento = models.BooleanField(
        default=False, verbose_name='Tem alergia a algum medicamento ou substância?'
    )
    alergia_medicamento_obs = models.TextField(
        blank=True, default='', verbose_name='Qual(is) alergia(s)?'
    )

    diabetico = models.BooleanField(
        default=False, verbose_name='É diabético(a)?'
    )

    hipertensao = models.BooleanField(
        default=False, verbose_name='Tem pressão alta (hipertensão)?'
    )

    hipotensao = models.BooleanField(
        default=False, verbose_name='Tem pressão baixa (hipotensão)?'
    )

    problema_cardiaco = models.BooleanField(
        default=False, verbose_name='Tem algum problema cardíaco?'
    )
    problema_cardiaco_obs = models.TextField(
        blank=True, default='', verbose_name='Qual problema cardíaco?'
    )

    problema_respiratorio = models.BooleanField(
        default=False, verbose_name='Tem algum problema respiratório? (asma, bronquite, rinite…)'
    )
    problema_respiratorio_obs = models.TextField(
        blank=True, default='', verbose_name='Qual problema respiratório?'
    )

    hepatite = models.BooleanField(
        default=False, verbose_name='Já teve hepatite ou doença hepática?'
    )
    hepatite_obs = models.TextField(
        blank=True, default='', verbose_name='Qual hepatite / doença hepática?'
    )

    problema_renal = models.BooleanField(
        default=False, verbose_name='Tem algum problema nos rins?'
    )

    hiv = models.BooleanField(
        default=False, verbose_name='É portador(a) de HIV/AIDS?'
    )

    epilepsia = models.BooleanField(
        default=False, verbose_name='Tem epilepsia ou convulsões?'
    )

    disturbio_coagulacao = models.BooleanField(
        default=False, verbose_name='Tem distúrbio de coagulação ou sangramento excessivo?'
    )

    osteoporose = models.BooleanField(
        default=False, verbose_name='Tem osteoporose ou outro problema ósseo?'
    )

    gravida = models.BooleanField(
        default=False, verbose_name='Está grávida ou suspeita de gravidez?'
    )

    amamentando = models.BooleanField(
        default=False, verbose_name='Está amamentando?'
    )

    fumante = models.BooleanField(
        default=False, verbose_name='É fumante?'
    )
    fumante_obs = models.CharField(
        max_length=100, blank=True, default='', verbose_name='Quantidade de cigarros por dia?'
    )

    alcool = models.BooleanField(
        default=False, verbose_name='Consome bebida alcoólica?'
    )
    alcool_obs = models.CharField(
        max_length=100, blank=True, default='', verbose_name='Com que frequência?'
    )

    historico_cirurgias = models.BooleanField(
        default=False, verbose_name='Já realizou alguma cirurgia?'
    )
    historico_cirurgias_obs = models.TextField(
        blank=True, default='', verbose_name='Qual(is) cirurgia(s)?'
    )

    historico_internacoes = models.BooleanField(
        default=False, verbose_name='Já foi internado(a)?'
    )
    historico_internacoes_obs = models.TextField(
        blank=True, default='', verbose_name='Motivo da internação?'
    )

    doenca_pele = models.BooleanField(
        default=False,
        verbose_name='Tem alguma doença de pele ou dificuldade de cicatrização?'
    )
    doenca_pele_obs = models.TextField(
        blank=True, default='', verbose_name='Qual doença / dificuldade?'
    )

    queixa_principal = models.TextField(
        blank=True, default='', verbose_name='Queixa principal'
    )

    observacoes_gerais = models.TextField(
        blank=True, default='', verbose_name='Observações gerais'
    )

    data_anamnese = models.DateField(auto_now_add=True, verbose_name='Data da Anamnese')

    class Meta:
        db_table = 'paciente_anamnese'
        verbose_name = 'Anamnese do Paciente'
        verbose_name_plural = 'Anamneses dos Pacientes'
        ordering = ['-data_anamnese']

    def __str__(self):
        return f'Anamnese de {self.paciente.nome} — {self.data_anamnese}'

class PacienteExameClinico(models.Model):
    paciente = models.ForeignKey(
        Paciente, on_delete=models.CASCADE,
        related_name='exames_clinicos', verbose_name='Paciente'
    )
    estado_geral = models.TextField(
        blank=True, default='', verbose_name='Estado Geral'
    )
    peso = models.DecimalField(
        max_digits=5, decimal_places=2, blank=True, null=True,
        verbose_name='Peso (kg)'
    )
    altura = models.DecimalField(
        max_digits=4, decimal_places=2, blank=True, null=True,
        verbose_name='Altura (m)'
    )
    pulso = models.DecimalField(
        max_digits=5, decimal_places=0, blank=True, null=True,
        verbose_name='Pulso (bpm)'
    )
    frequencia_cardiaca = models.DecimalField(
        max_digits=5, decimal_places=0, blank=True, null=True,
        verbose_name='Frequência Cardíaca (bpm)'
    )
    data_exame = models.DateField(auto_now_add=True, verbose_name='Data do Exame')

    class Meta:
        db_table = 'paciente_exame_clinico'
        verbose_name = 'Exame Clínico do Paciente'
        verbose_name_plural = 'Exames Clínicos dos Pacientes'
        ordering = ['-data_exame']

    def __str__(self):
        return f'Exame Clínico de {self.paciente.nome} — {self.data_exame}'

class DentesExameClinico(models.Model):
    exame_clinico = models.ForeignKey(
        PacienteExameClinico, on_delete=models.CASCADE,
        related_name='dentes', verbose_name='Exame Clínico'
    )
    dente_numero = models.IntegerField(verbose_name='Número do Dente')  # 11-18, 21-28, 31-38, 41-48
    dente_posicao = models.CharField(max_length=50, verbose_name='Posição do Dente')
    dente_descricao = models.TextField(blank=True, default='', verbose_name='Descrição')
    is_deleted = models.BooleanField(default=False, verbose_name='Removido (soft-delete)')

    class Meta:
        db_table = 'dentes_exame_clinico'
        verbose_name = 'Dente do Exame Clínico'
        verbose_name_plural = 'Dentes do Exame Clínico'
        ordering = ['dente_numero', 'dente_posicao']
        unique_together = ('exame_clinico', 'dente_numero', 'dente_posicao')

    def __str__(self):
        return f'Dente {self.dente_numero} ({self.dente_posicao}) — {self.exame_clinico}'

class DentesExameClinicoPosExame(models.Model):
    exame_clinico = models.ForeignKey(
        PacienteExameClinico,
        on_delete=models.CASCADE,
        related_name='dentes_pos_exame',
        verbose_name='Exame Clínico'
    )
    dente_numero = models.IntegerField(verbose_name='Número do Dente')
    dente_posicao = models.CharField(max_length=50, verbose_name='Posição do Dente')
    dente_descricao = models.TextField(blank=True, default='', verbose_name='Descrição')

    class Meta:
        db_table = 'dentes_exame_clinico_pos_exame'
        verbose_name = 'Dente Pós Exame Clínico'
        verbose_name_plural = 'Dentes Pós Exame Clínico'
        ordering = ['dente_numero', 'dente_posicao']
        unique_together = ('exame_clinico', 'dente_numero', 'dente_posicao')

    def __str__(self):
        return f'Dente {self.dente_numero} ({self.dente_posicao}) — Pós'
