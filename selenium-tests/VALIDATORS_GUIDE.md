# Validadores de Entrada - DailyQuest Selenium Tests

## 📋 Visão Geral

Sistema completo de validação para todos os campos de entrada nos testes Selenium do DailyQuest. Os validadores garantem integridade dos dados antes de serem enviados ao sistema.

## 🔍 Validadores Disponíveis

### 1. **validate_username(username)**
Valida nomes de usuário/nicknames.

**Regras:**
- ✅ Não pode ser vazio
- ✅ Mínimo 3 caracteres
- ✅ Máximo 50 caracteres
- ✅ Apenas letras, números, underscores, hífens e espaços

**Exemplos:**
```python
validate_username("testuser")      # ✓ OK
validate_username("user_123")      # ✓ OK
validate_username("ab")            # ✗ Muito curto
validate_username("")              # ✗ Vazio
```

---

### 2. **validate_email(email)**
Valida endereços de email.

**Regras:**
- ✅ Não pode ser vazio
- ✅ Formato válido (user@domain.com)
- ✅ Máximo 100 caracteres

**Exemplos:**
```python
validate_email("test@example.com")     # ✓ OK
validate_email("user@domain.co.uk")    # ✓ OK
validate_email("not-an-email")         # ✗ Formato inválido
validate_email("@example.com")         # ✗ Sem usuário
```

---

### 3. **validate_password(password)**
Valida senhas.

**Regras:**
- ✅ Não pode ser vazia
- ✅ Mínimo 6 caracteres
- ✅ Máximo 100 caracteres

**Exemplos:**
```python
validate_password("123456")       # ✓ OK (mínimo 6)
validate_password("P@ssw0rd!")    # ✓ OK
validate_password("12345")        # ✗ Muito curta
```

---

### 4. **validate_title(title, field_name="Título")**
Valida títulos de hábitos/tarefas.

**Regras:**
- ✅ Não pode ser vazio
- ✅ Mínimo 3 caracteres
- ✅ Máximo 100 caracteres

**Exemplos:**
```python
validate_title("Estudar Python")           # ✓ OK
validate_title("abc")                      # ✓ OK (mínimo 3)
validate_title("ab")                       # ✗ Muito curto
validate_title("a" * 101)                  # ✗ Muito longo
```

---

### 5. **validate_description(description, field_name="Descrição", required=False)**
Valida descrições (campo opcional).

**Regras:**
- ✅ Pode ser vazia (padrão: opcional)
- ✅ Máximo 500 caracteres
- ✅ Espaços em branco são convertidos para string vazia

**Exemplos:**
```python
validate_description("")                    # ✓ OK (opcional)
validate_description("Uma descrição curta") # ✓ OK
validate_description("a" * 500)             # ✓ OK (máximo)
validate_description("a" * 501)             # ✗ Muito longa
```

---

### 6. **validate_deadline(deadline_str)**
Valida prazos/deadlines.

**Regras:**
- ✅ Formatos aceitos: DD-MM-YYYY, YYYY-MM-DD, DD/MM/YYYY, YYYY/MM/DD
- ✅ Data deve ser válida
- ✅ Data não pode ser no passado (tolerância de 1 dia)

**Exemplos:**
```python
validate_deadline("26-11-2025")    # ✓ OK
validate_deadline("2025-12-31")    # ✓ OK
validate_deadline("01-01-2020")    # ✗ No passado
validate_deadline("32-13-2025")    # ✗ Data inválida
validate_deadline("abc")           # ✗ Formato inválido
```

---

### 7. **validate_frequency(frequency)**
Valida frequência de hábitos.

**Regras:**
- ✅ Valores aceitos: 'Diário', 'Semanal', 'Mensal' (case-insensitive)

**Exemplos:**
```python
validate_frequency("Diário")       # ✓ OK
validate_frequency("semanal")      # ✓ OK (case-insensitive)
validate_frequency("Anual")        # ✗ Não suportado
validate_frequency("daily")        # ✗ Inglês não suportado
```

---

### 8. **validate_category(category)**
Valida categorias.

**Regras:**
- ✅ Não pode ser vazia
- ✅ Máximo 50 caracteres

---

### 9. **validate_all_fields(fields_dict)**
Valida múltiplos campos de uma vez.

**Uso:**
```python
fields = {
    "username": (validate_username, "testuser"),
    "email": (validate_email, "test@example.com"),
    "password": (validate_password, "123456")
}

validated = validate_all_fields(fields)
# Retorna: {'username': 'testuser', 'email': 'test@example.com', 'password': '123456'}
```

---

## 🚀 Uso nos Testes

### Exemplo 1: Login
```python
from validators import validate_username, validate_password, ValidationError

def login(driver, username, password):
    try:
        username = validate_username(username)
        password = validate_password(password)
    except ValidationError as e:
        log_action("Erro de validação no login", str(e))
        raise
    
    # Preenche campos...
```

### Exemplo 2: Criar Hábito
```python
from validators import validate_title, validate_description, ValidationError

def create_habit(driver, title, description=""):
    try:
        title = validate_title(title, "Título do hábito")
        description = validate_description(description, "Descrição do hábito", required=False)
    except ValidationError as e:
        log_action("Erro de validação ao criar hábito", str(e))
        raise
    
    # Cria hábito...
```

### Exemplo 3: Criar Afazer com Deadline
```python
from validators import validate_title, validate_description, validate_deadline, ValidationError

def create_todo(driver, title, description="", deadline=""):
    try:
        title = validate_title(title, "Título do afazer")
        description = validate_description(description, "Descrição do afazer", required=False)
        if deadline:
            deadline = validate_deadline(deadline)
    except ValidationError as e:
        log_action("Erro de validação ao criar afazer", str(e))
        raise
    
    # Cria afazer...
```

---

## 🧪 Testes

Execute os testes dos validadores:

```bash
cd selenium-tests
python3 test_validators.py
```

**Resultado esperado:**
```
============================================================
TESTANDO VALIDADORES - DAILYQUEST
============================================================

=== Testando Username ===
✓ 'testuser' -> 'testuser'
✓ 'user_123' -> 'user_123'
...

=== Testando Email ===
✓ 'test@example.com' -> 'test@example.com'
...

============================================================
TESTES CONCLUÍDOS
============================================================
```

---

## 📁 Arquivos

### `validators.py`
Contém todos os validadores e a classe `ValidationError`.

### `test_validators.py`
Suite completa de testes para todos os validadores.

### Arquivos modificados com validações:
- ✅ `actions/auth.py` - Login e registro
- ✅ `actions/habits.py` - Criação de hábitos e afazeres

---

## ⚠️ Tratamento de Erros

Todos os validadores lançam `ValidationError` quando a validação falha:

```python
try:
    validate_email("invalid-email")
except ValidationError as e:
    print(f"Erro: {e}")
    # Erro: Email com formato inválido: 'invalid-email'
```

---

## ✅ Benefícios

1. **Segurança**: Previne dados inválidos antes de enviar ao sistema
2. **Mensagens Claras**: Erros descritivos para debugging
3. **Manutenibilidade**: Validações centralizadas em um único arquivo
4. **Testabilidade**: Suite completa de testes unitários
5. **Reutilização**: Validadores podem ser usados em outros contextos

---

## 🔧 Extensão

Para adicionar novos validadores:

1. Adicione a função em `validators.py`
2. Documente as regras de validação
3. Adicione testes em `test_validators.py`
4. Use nos arquivos de ação relevantes

**Exemplo:**
```python
def validate_new_field(value):
    """
    Valida novo campo
    Regras:
    - Sua regra aqui
    """
    if not value:
        raise ValidationError("Campo não pode ser vazio")
    
    return value.strip()
```

---

## 📊 Status de Implementação

| Campo | Validador | Implementado em | Status |
|-------|-----------|----------------|---------|
| Username | `validate_username` | `auth.py` | ✅ |
| Email | `validate_email` | `auth.py` | ✅ |
| Senha | `validate_password` | `auth.py` | ✅ |
| Título | `validate_title` | `habits.py` | ✅ |
| Descrição | `validate_description` | `habits.py` | ✅ |
| Deadline | `validate_deadline` | `habits.py` | ✅ |
| Frequência | `validate_frequency` | - | ⏳ Disponível |
| Categoria | `validate_category` | - | ⏳ Disponível |

---

**Criado em**: 25/11/2025  
**Última atualização**: 25/11/2025  
**Versão**: 1.0.0
