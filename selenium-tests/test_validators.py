"""
Testes para validadores - DailyQuest
Execute: python3 test_validators.py
"""
import sys
from pathlib import Path

# Adiciona diretório pai ao path
sys.path.insert(0, str(Path(__file__).parent))

from validators import (
    validate_username,
    validate_email,
    validate_password,
    validate_title,
    validate_description,
    validate_deadline,
    validate_frequency,
    validate_category,
    ValidationError
)


def test_username():
    """Testa validação de username"""
    print("\n=== Testando Username ===")
    
    # Casos válidos
    valid_cases = [
        "testuser",
        "user_123",
        "user-name",
        "abc",  # mínimo 3
        "a" * 50,  # máximo 50
    ]
    
    for username in valid_cases:
        try:
            result = validate_username(username)
            print(f"✓ '{username}' -> '{result}'")
        except ValidationError as e:
            print(f"✗ '{username}' FALHOU: {e}")
    
    # Casos inválidos
    invalid_cases = [
        ("", "vazio"),
        ("  ", "apenas espaços"),
        ("ab", "muito curto"),
        ("a" * 51, "muito longo"),
    ]
    
    for username, reason in invalid_cases:
        try:
            result = validate_username(username)
            print(f"✗ '{username}' deveria falhar ({reason}) mas passou: '{result}'")
        except ValidationError as e:
            print(f"✓ '{username}' falhou corretamente ({reason}): {e}")


def test_email():
    """Testa validação de email"""
    print("\n=== Testando Email ===")
    
    # Casos válidos
    valid_cases = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.com",
        "123@test.com",
    ]
    
    for email in valid_cases:
        try:
            result = validate_email(email)
            print(f"✓ '{email}' -> '{result}'")
        except ValidationError as e:
            print(f"✗ '{email}' FALHOU: {e}")
    
    # Casos inválidos
    invalid_cases = [
        ("", "vazio"),
        ("not-an-email", "sem @"),
        ("@example.com", "sem usuário"),
        ("user@", "sem domínio"),
        ("user@domain", "sem TLD"),
        ("a" * 100 + "@test.com", "muito longo"),
    ]
    
    for email, reason in invalid_cases:
        try:
            result = validate_email(email)
            print(f"✗ '{email}' deveria falhar ({reason}) mas passou: '{result}'")
        except ValidationError as e:
            print(f"✓ '{email}' falhou corretamente ({reason})")


def test_password():
    """Testa validação de senha"""
    print("\n=== Testando Password ===")
    
    # Casos válidos
    valid_cases = [
        "123456",  # mínimo 6
        "password123",
        "P@ssw0rd!",
        "a" * 100,  # máximo 100
    ]
    
    for password in valid_cases:
        try:
            result = validate_password(password)
            print(f"✓ Senha válida (len={len(password)})")
        except ValidationError as e:
            print(f"✗ Senha FALHOU: {e}")
    
    # Casos inválidos
    invalid_cases = [
        ("", "vazia"),
        ("12345", "muito curta"),
        ("a" * 101, "muito longa"),
    ]
    
    for password, reason in invalid_cases:
        try:
            result = validate_password(password)
            print(f"✗ Senha deveria falhar ({reason}) mas passou")
        except ValidationError as e:
            print(f"✓ Senha falhou corretamente ({reason})")


def test_title():
    """Testa validação de título"""
    print("\n=== Testando Título ===")
    
    # Casos válidos
    valid_cases = [
        "Estudar Python",
        "abc",  # mínimo 3
        "a" * 100,  # máximo 100
    ]
    
    for title in valid_cases:
        try:
            result = validate_title(title)
            print(f"✓ '{title}' -> '{result}'")
        except ValidationError as e:
            print(f"✗ '{title}' FALHOU: {e}")
    
    # Casos inválidos
    invalid_cases = [
        ("", "vazio"),
        ("ab", "muito curto"),
        ("a" * 101, "muito longo"),
    ]
    
    for title, reason in invalid_cases:
        try:
            result = validate_title(title)
            print(f"✗ '{title}' deveria falhar ({reason}) mas passou: '{result}'")
        except ValidationError as e:
            print(f"✓ '{title}' falhou corretamente ({reason})")


def test_deadline():
    """Testa validação de deadline"""
    print("\n=== Testando Deadline ===")
    
    from datetime import datetime, timedelta
    
    # Casos válidos
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%d-%m-%Y')
    next_week = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
    
    valid_cases = [
        tomorrow,
        next_week,
        "31-12-2025",
        "2025-12-31",
    ]
    
    for deadline in valid_cases:
        try:
            result = validate_deadline(deadline)
            print(f"✓ '{deadline}' -> '{result}'")
        except ValidationError as e:
            print(f"✗ '{deadline}' FALHOU: {e}")
    
    # Casos inválidos
    invalid_cases = [
        ("", "vazio"),
        ("01-01-2020", "passado"),
        ("2020-01-01", "passado"),
        ("32-13-2025", "data inválida"),
        ("abc", "formato inválido"),
    ]
    
    for deadline, reason in invalid_cases:
        try:
            result = validate_deadline(deadline)
            print(f"✗ '{deadline}' deveria falhar ({reason}) mas passou: '{result}'")
        except ValidationError as e:
            print(f"✓ '{deadline}' falhou corretamente ({reason})")


def test_frequency():
    """Testa validação de frequência"""
    print("\n=== Testando Frequência ===")
    
    # Casos válidos
    valid_cases = ["Diário", "Semanal", "Mensal", "diário", "semanal", "mensal"]
    
    for freq in valid_cases:
        try:
            result = validate_frequency(freq)
            print(f"✓ '{freq}' -> '{result}'")
        except ValidationError as e:
            print(f"✗ '{freq}' FALHOU: {e}")
    
    # Casos inválidos
    invalid_cases = [
        ("", "vazio"),
        ("Anual", "não suportado"),
        ("daily", "inglês não suportado"),
    ]
    
    for freq, reason in invalid_cases:
        try:
            result = validate_frequency(freq)
            print(f"✗ '{freq}' deveria falhar ({reason}) mas passou: '{result}'")
        except ValidationError as e:
            print(f"✓ '{freq}' falhou corretamente ({reason})")


def test_description():
    """Testa validação de descrição"""
    print("\n=== Testando Descrição ===")
    
    # Casos válidos
    valid_cases = [
        "",  # opcional
        "   ",  # será convertido para vazio
        "Uma descrição curta",
        "a" * 500,  # máximo 500
    ]
    
    for desc in valid_cases:
        try:
            result = validate_description(desc)
            print(f"✓ Descrição válida (len={len(result)})")
        except ValidationError as e:
            print(f"✗ Descrição FALHOU: {e}")
    
    # Casos inválidos
    invalid_cases = [
        ("a" * 501, "muito longa"),
    ]
    
    for desc, reason in invalid_cases:
        try:
            result = validate_description(desc)
            print(f"✗ Descrição deveria falhar ({reason}) mas passou")
        except ValidationError as e:
            print(f"✓ Descrição falhou corretamente ({reason})")


if __name__ == "__main__":
    print("=" * 60)
    print("TESTANDO VALIDADORES - DAILYQUEST")
    print("=" * 60)
    
    test_username()
    test_email()
    test_password()
    test_title()
    test_deadline()
    test_frequency()
    test_description()
    
    print("\n" + "=" * 60)
    print("TESTES CONCLUÍDOS")
    print("=" * 60)
