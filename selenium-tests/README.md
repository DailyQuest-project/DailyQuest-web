# DailyQuest - Testes Selenium Automatizados

Demonstração automatizada do sistema DailyQuest usando Selenium WebDriver com arquitetura modular.

## 📁 Estrutura do Projeto

```
selenium-tests/
├── main.py                    # Script principal (orquestrador)
├── config.py                  # Configurações (URLs, timeouts, delays)
├── utils.py                   # Funções utilitárias (waits, clicks seguros)
├── requirements.txt           # Dependências Python
├── README.md                  # Este arquivo
├── actions/                   # Módulos de ações
│   ├── __init__.py
│   ├── auth.py               # Autenticação (login, registro, logout)
│   ├── dashboard.py          # Dashboard (navegação, verificação)
│   ├── tasks.py              # Tarefas (criar, completar, deletar)
│   ├── achievements.py       # Conquistas (abrir modal, verificar)
│   └── profile.py            # Perfil (visualizar stats, alternar tema)
└── data/
    └── scenarios.json        # Cenários de teste (dados e fluxo)
```

## 🚀 Instalação

### 1. Pré-requisitos

- Python 3.8+
- Google Chrome instalado
- DailyQuest rodando em `http://localhost:3000`

### 2. Instalar dependências

```bash
cd selenium-tests
pip install -r requirements.txt
```

## ▶️ Executar Testes

### Executar demonstração completa

```bash
python main.py
```

### O que será demonstrado:

1. ✅ **Login** - Autenticação com usuário de teste
2. ✅ **Verificar Dashboard** - Elementos principais (XP bar, tarefas, hábitos)
3. ✅ **Criar Tarefas** - 3 tarefas de exemplo
4. ✅ **Completar Tarefas** - 2 tarefas (com animação de XP)
5. ✅ **Abrir Conquistas** - Modal de conquistas
6. ✅ **Verificar Conquistas** - Contar desbloqueadas/totais
7. ✅ **Buscar Conquista** - Testar campo de busca
8. ✅ **Fechar Conquistas** - Fechar modal
9. ✅ **Abrir Perfil** - Modal de perfil do usuário
10. ✅ **Verificar Stats** - Nível, XP, conquistas, tarefas
11. ✅ **Alternar Tema** - Dark/Light mode
12. ✅ **Scroll Dashboard** - Navegação suave

## 🎯 Configuração

### Usuário de Teste Padrão

Definido em `data/scenarios.json`:

```json
{
  "user": {
    "username": "testuser",
    "email": "testuser@dailyquest.com",
    "password": "testpass123"
  }
}
```

### URLs e Timeouts

Configurados em `config.py`:

```python
BASE_URL = "http://localhost:3000"
DEFAULT_TIMEOUT = 15
DEFAULT_DELAY = 2.0
```

## 🔧 Personalização

### Modificar cenários de teste

Edite `data/scenarios.json` para:

- Adicionar/remover tarefas
- Modificar credenciais de usuário
- Ajustar fluxo de testes
- Configurar conquistas esperadas

### Criar novas ações

1. Crie novo arquivo em `actions/` (ex: `habits.py`)
2. Implemente funções usando utilitários de `utils.py`
3. Adicione ao `actions/__init__.py`
4. Use no `main.py`

Exemplo:

```python
# actions/habits.py
from selenium.webdriver.common.by import By
from utils import safe_click, wait, log_action

def complete_habit(driver, habit_name):
    log_action("Completando hábito", habit_name)
    checkbox = safe_click(driver, (
        By.XPATH,
        f"//div[contains(text(), '{habit_name}')]//input[@type='checkbox']"
    ))
    wait(2)
```

## 📚 Módulos de Ações

### auth.py - Autenticação

```python
from actions import auth

# Login
auth.login(driver, "username", "password")

# Registro
auth.register(driver, "username", "email@test.com", "password")

# Logout
auth.logout(driver)
```

### tasks.py - Tarefas

```python
from actions import tasks

# Criar tarefa
tasks.create_task(driver, "Título", "Descrição", "MEDIUM")

# Completar primeira tarefa incompleta
tasks.complete_first_incomplete_task(driver)

# Completar por título
tasks.complete_task(driver, "Título da tarefa")

# Contar tarefas
count = tasks.count_tasks(driver)
```

### achievements.py - Conquistas

```python
from actions import achievements

# Abrir modal
achievements.open_achievements_modal(driver)

# Verificar conquista específica
achievements.verify_achievement_unlocked(driver, "FIRST_LOGIN")

# Contar conquistas
stats = achievements.count_achievements(driver)
# Retorna: {"total": 20, "unlocked": 5}

# Buscar conquista
achievements.search_achievement(driver, "Primeira")

# Fechar modal
achievements.close_achievements_modal(driver)
```

### profile.py - Perfil

```python
from actions import profile

# Abrir perfil
profile.open_profile_modal(driver)

# Verificar estatísticas
stats = profile.verify_user_stats(driver)
# Retorna: {"level": "3", "xp": "450/500", ...}

# Alternar tema
profile.toggle_theme(driver)
```

### dashboard.py - Dashboard

```python
from actions import dashboard

# Navegar para dashboard
dashboard.navigate_to_dashboard(driver)

# Verificar elementos
elements = dashboard.verify_dashboard_elements(driver)

# Scroll
dashboard.scroll_dashboard(driver)
```

## 🛠️ Utilitários (utils.py)

### Esperas e Interações

```python
from utils import (
    wait,                    # Pausa simples
    wait_for_element,        # Espera elemento visível
    wait_for_clickable,      # Espera elemento clicável
    safe_click,              # Clique seguro com scroll
    slow_type,               # Digita devagar
    find_element_safe,       # Busca sem exception
    log_action               # Log formatado
)

# Exemplos
wait(2)  # Espera 2 segundos

element = wait_for_element(driver, (By.ID, "username"))
safe_click(driver, (By.CSS_SELECTOR, "button[type='submit']"))
slow_type(input_field, "texto", delay=0.1)
log_action("Ação realizada", "detalhes opcionais")
```

## 🐛 Troubleshooting

### ChromeDriver não encontrado

O script usa `webdriver-manager` para baixar automaticamente. Se falhar:

```bash
pip install --upgrade webdriver-manager
```

### Elemento não encontrado

- Verifique se o DailyQuest está rodando em `http://localhost:3000`
- Aumente `DEFAULT_TIMEOUT` em `config.py`
- Adicione `wait()` antes de interações

### Aplicação não carrega

- Certifique-se que frontend e backend estão rodando
- Verifique `BASE_URL` em `config.py`
- Limpe cache do navegador

## 📝 Logs

O script gera logs detalhados com timestamps:

```
[14:30:45] Configurando Chrome WebDriver
[14:30:47] Chrome iniciado com sucesso
[14:30:47] Carregando cenários
[14:30:47] PASSO 1/12: Realizar login com usuário de teste
[14:30:48] Login: Usuário: testuser
[14:30:52] Login realizado com sucesso
...
```

## 🎓 Arquitetura

### Padrão de Design

- **Modular**: Ações separadas por contexto (auth, tasks, etc.)
- **Reusável**: Funções utilitárias compartilhadas
- **JSON-driven**: Cenários configuráveis externamente
- **Resiliente**: Tratamento de erros em cada ação

### Fluxo de Execução

```
main.py
  ├─> load_scenarios() → Carrega data/scenarios.json
  ├─> setup_driver() → Configura Chrome
  └─> execute_test_flow()
       ├─> actions.auth.login()
       ├─> actions.tasks.create_task()
       ├─> actions.achievements.verify()
       └─> ...
```

## 📄 Licença

Este projeto é parte do DailyQuest e segue a mesma licença.

## 🤝 Contribuindo

Para adicionar novos testes:

1. Crie função no módulo apropriado em `actions/`
2. Adicione step em `data/scenarios.json`
3. Implemente lógica em `main.py` (função `execute_test_flow`)
4. Teste com `python main.py`

---

**Desenvolvido para avaliação acadêmica - DailyQuest**
