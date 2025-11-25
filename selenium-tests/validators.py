"""
Validadores para campos de entrada - DailyQuest
"""
import re
from datetime import datetime


class ValidationError(Exception):
    """Exceção customizada para erros de validação"""
    pass


def validate_username(username):
    """
    Valida username/nickname
    Regras:
    - Não pode ser vazio
    - Mínimo 3 caracteres
    - Máximo 50 caracteres
    - Apenas letras, números, underscores e hífens
    """
    if not username or not username.strip():
        raise ValidationError("Username não pode ser vazio")
    
    username = username.strip()
    
    if len(username) < 3:
        raise ValidationError(f"Username muito curto (mínimo 3 caracteres): '{username}'")
    
    if len(username) > 50:
        raise ValidationError(f"Username muito longo (máximo 50 caracteres): '{username}'")
    
    # Permite letras, números, underscores, hífens e espaços
    if not re.match(r'^[\w\s\-]+$', username, re.UNICODE):
        raise ValidationError(f"Username contém caracteres inválidos: '{username}'")
    
    return username.strip()


def validate_email(email):
    """
    Valida formato de email
    Regras:
    - Não pode ser vazio
    - Deve ter formato válido (user@domain.com)
    - Máximo 100 caracteres
    """
    if not email or not email.strip():
        raise ValidationError("Email não pode ser vazio")
    
    email = email.strip().lower()
    
    if len(email) > 100:
        raise ValidationError(f"Email muito longo (máximo 100 caracteres): '{email}'")
    
    # Regex básico para validar email
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise ValidationError(f"Email com formato inválido: '{email}'")
    
    return email


def validate_password(password):
    """
    Valida senha
    Regras:
    - Não pode ser vazia
    - Mínimo 6 caracteres
    - Máximo 100 caracteres
    """
    if not password:
        raise ValidationError("Senha não pode ser vazia")
    
    if len(password) < 6:
        raise ValidationError(f"Senha muito curta (mínimo 6 caracteres)")
    
    if len(password) > 100:
        raise ValidationError(f"Senha muito longa (máximo 100 caracteres)")
    
    return password


def validate_title(title, field_name="Título"):
    """
    Valida título de hábito/tarefa
    Regras:
    - Não pode ser vazio
    - Mínimo 3 caracteres
    - Máximo 100 caracteres
    """
    if not title or not title.strip():
        raise ValidationError(f"{field_name} não pode ser vazio")
    
    title = title.strip()
    
    if len(title) < 3:
        raise ValidationError(f"{field_name} muito curto (mínimo 3 caracteres): '{title}'")
    
    if len(title) > 100:
        raise ValidationError(f"{field_name} muito longo (máximo 100 caracteres): '{title}'")
    
    return title


def validate_description(description, field_name="Descrição", required=False):
    """
    Valida descrição
    Regras:
    - Pode ser vazia (opcional por padrão)
    - Se preenchida, máximo 500 caracteres
    """
    if not description or not description.strip():
        if required:
            raise ValidationError(f"{field_name} não pode ser vazia")
        return ""  # Descrição opcional
    
    description = description.strip()
    
    if len(description) > 500:
        raise ValidationError(f"{field_name} muito longa (máximo 500 caracteres)")
    
    return description


def validate_deadline(deadline_str):
    """
    Valida deadline/prazo
    Regras:
    - Deve estar no formato DD-MM-YYYY ou YYYY-MM-DD
    - Data deve ser válida
    - Data não pode ser no passado (com tolerância de 1 dia)
    """
    if not deadline_str or not deadline_str.strip():
        raise ValidationError("Deadline não pode ser vazio")
    
    deadline_str = deadline_str.strip()
    
    # Tenta parsear diferentes formatos
    date_formats = [
        '%d-%m-%Y',  # DD-MM-YYYY
        '%Y-%m-%d',  # YYYY-MM-DD
        '%d/%m/%Y',  # DD/MM/YYYY
        '%Y/%m/%d',  # YYYY/MM/DD
    ]
    
    parsed_date = None
    for date_format in date_formats:
        try:
            parsed_date = datetime.strptime(deadline_str, date_format)
            break
        except ValueError:
            continue
    
    if not parsed_date:
        raise ValidationError(f"Deadline com formato inválido: '{deadline_str}'. Use DD-MM-YYYY ou YYYY-MM-DD")
    
    # Verifica se não é muito no passado (tolerância de 1 dia)
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday = today.replace(day=today.day - 1) if today.day > 1 else today
    
    if parsed_date.date() < yesterday.date():
        raise ValidationError(f"Deadline não pode ser no passado: '{deadline_str}'")
    
    return deadline_str


def validate_frequency(frequency):
    """
    Valida frequência de hábito
    Regras:
    - Deve ser um dos valores: 'Diário', 'Semanal', 'Mensal'
    """
    valid_frequencies = ['Diário', 'Semanal', 'Mensal', 'diário', 'semanal', 'mensal']
    
    if not frequency or not frequency.strip():
        raise ValidationError("Frequência não pode ser vazia")
    
    frequency = frequency.strip()
    
    if frequency not in valid_frequencies:
        raise ValidationError(f"Frequência inválida: '{frequency}'. Valores válidos: Diário, Semanal, Mensal")
    
    return frequency


def validate_category(category):
    """
    Valida categoria
    Regras:
    - Não pode ser vazia
    - Máximo 50 caracteres
    """
    if not category or not category.strip():
        raise ValidationError("Categoria não pode ser vazia")
    
    category = category.strip()
    
    if len(category) > 50:
        raise ValidationError(f"Categoria muito longa (máximo 50 caracteres): '{category}'")
    
    return category


def validate_all_fields(fields_dict):
    """
    Valida múltiplos campos de uma vez
    
    Args:
        fields_dict: Dicionário com {campo: (validador, valor)}
        
    Returns:
        Dicionário com valores validados
        
    Raises:
        ValidationError: Se algum campo for inválido
    """
    validated = {}
    errors = []
    
    for field_name, (validator, value) in fields_dict.items():
        try:
            validated[field_name] = validator(value)
        except ValidationError as e:
            errors.append(f"{field_name}: {str(e)}")
    
    if errors:
        raise ValidationError(f"Erros de validação:\n" + "\n".join(errors))
    
    return validated
