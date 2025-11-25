BASE_URL = "http://localhost:3000"
API_URL = "http://localhost:8000"

# Timeouts
DEFAULT_TIMEOUT = 5
LONG_TIMEOUT = 10
SHORT_TIMEOUT = 3

# Delays (em segundos) - Otimizados para performance
DEFAULT_DELAY = 1.0  # Reduzido de 2.0 para 1.0
SHORT_DELAY = 0.3    # Reduzido de 0.5 para 0.3
LONG_DELAY = 1.5     # Reduzido de 3.0 para 1.5

# Configuração do Chrome
CHROME_OPTIONS = [
    "--window-size=1920,1080",
    "--disable-blink-features=AutomationControlled",
    "--disable-gpu",
    "--no-sandbox"
]
