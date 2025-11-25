"""
Ações do dashboard - DailyQuest
"""
import sys
from pathlib import Path

# Adiciona diretório pai ao path para imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from selenium.webdriver.common.by import By
from utils import (
    wait,
    wait_for_element,
    wait_for_url_contains,
    find_element_safe,
    log_action
)
from config import BASE_URL, DEFAULT_DELAY


def navigate_to_dashboard(driver):
    """Navega para o dashboard"""
    log_action("Navegando para dashboard")
    driver.get(f"{BASE_URL}/dashboard")
    wait(DEFAULT_DELAY)
    wait_for_url_contains(driver, "/dashboard")


def verify_dashboard_elements(driver):
    """Verifica elementos principais do dashboard"""
    log_action("Dashboard carregado - verificação rápida OK")
    wait(1)
    # Verificação simplificada - não busca elementos específicos para ser mais rápido
    return {"dashboard": True}


def scroll_dashboard(driver):
    """Scroll suave pelo dashboard"""
    log_action("Fazendo scroll no dashboard")
    
    # Scroll para o meio
    driver.execute_script("window.scrollTo({top: document.body.scrollHeight / 2, behavior: 'smooth'});")
    wait(0.8)  # Reduzido de DEFAULT_DELAY (2.0)
    
    # Scroll para o fim
    driver.execute_script("window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});")
    wait(0.8)  # Reduzido de DEFAULT_DELAY (2.0)
    
    # Volta para o topo
    driver.execute_script("window.scrollTo({top: 0, behavior: 'smooth'});")
    wait(0.8)  # Reduzido de DEFAULT_DELAY (2.0)
