BASE_URL = "http://localhost:3000"
API_URL = "http://localhost:8000"

# Timeouts
DEFAULT_TIMEOUT = 5
LONG_TIMEOUT = 10
SHORT_TIMEOUT = 3

# Delays (em segundos) - Otimizados para fluidez máxima
DEFAULT_DELAY = 0.3   # Delay padrão entre ações
SHORT_DELAY = 0.1     # Delay curto
LONG_DELAY = 0.5      # Delay longo

# Configuração do Chrome
CHROME_OPTIONS = [
    "--window-size=1920,1080",
    "--disable-blink-features=AutomationControlled",
    "--disable-gpu",
    "--no-sandbox"
]
