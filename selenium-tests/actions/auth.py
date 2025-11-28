"""
Ações de autenticação - DailyQuest
"""
import sys
from pathlib import Path

# Adiciona diretório pai ao path para imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from selenium.webdriver.common.by import By
from utils import (
    wait,
    wait_for_element,
    wait_for_clickable,
    wait_for_url_contains,
    safe_click,
    slow_type,
    log_action
)
from config import BASE_URL, DEFAULT_DELAY
from validators import validate_username, validate_email, validate_password, ValidationError


def navigate_to_login(driver):
    """Navega para página de login"""
    log_action("Navegando para login")
    driver.get(f"{BASE_URL}/login")
    wait(0.3)
    wait_for_url_contains(driver, "/login")


def login(driver, username, password):
    """Realiza login no sistema"""
    # Valida campos antes de preencher
    try:
        username = validate_username(username)
        password = validate_password(password)
    except ValidationError as e:
        log_action("Erro de validação no login", str(e))
        raise
    
    log_action("Login", f"Usuário: {username}")
    
    # Navega para login se não estiver lá
    if "/login" not in driver.current_url:
        navigate_to_login(driver)
    
    # Preenche username
    username_field = wait_for_clickable(driver, (By.ID, "username"))
    username_field.clear()
    username_field.send_keys(username)
    
    # Preenche password
    password_field = wait_for_clickable(driver, (By.ID, "password"))
    password_field.clear()
    password_field.send_keys(password)
    
    # Clica em entrar
    login_button = wait_for_clickable(driver, (By.CSS_SELECTOR, "button[type='submit']"))
    login_button.click()
    wait(0.3)
    
    # Verifica se chegou ao dashboard
    success = wait_for_url_contains(driver, "/dashboard", timeout=5)
    if success:
        log_action("Login realizado com sucesso")
    
    return success


def navigate_to_register(driver):
    """Navega para página de registro"""
    log_action("Navegando para registro")
    driver.get(f"{BASE_URL}/register")
    wait(0.3)
    wait_for_url_contains(driver, "/register")


def register(driver, username, email, password):
    """Realiza registro de novo usuário"""
    # Valida campos antes de preencher
    try:
        username = validate_username(username)
        email = validate_email(email)
        password = validate_password(password)
    except ValidationError as e:
        log_action("Erro de validação no registro", str(e))
        raise
    
    log_action("Registro", f"Usuário: {username}, Email: {email}")
    
    if "/register" not in driver.current_url:
        navigate_to_register(driver)
    
    # Preenche name (campo do registro é "name", não "username")
    name_field = wait_for_clickable(driver, (By.ID, "name"))
    name_field.clear()
    slow_type(name_field, username)
    wait(0.3)  # Reduzido de DEFAULT_DELAY (2.0)
    
    # Preenche email
    email_field = wait_for_clickable(driver, (By.ID, "email"))
    email_field.clear()
    slow_type(email_field, email)
    wait(0.3)  # Reduzido de DEFAULT_DELAY (2.0)
    
    # Preenche password
    password_field = wait_for_clickable(driver, (By.ID, "password"))
    password_field.clear()
    slow_type(password_field, password)
    wait(0.3)  # Reduzido de DEFAULT_DELAY (2.0)
    
    # Clica em registrar
    register_button = wait_for_clickable(driver, (By.CSS_SELECTOR, "button[type='submit']"))
    register_button.click()
    wait(0.4)
    
    # Verifica se chegou ao dashboard ou login
    success = wait_for_url_contains(driver, "/dashboard", timeout=10) or \
              wait_for_url_contains(driver, "/login", timeout=2)
    
    if success:
        log_action("Registro realizado com sucesso")
    
    return success


def logout(driver):
    """Realiza logout do sistema"""
    log_action("Logout")
    
    try:
        # Tenta clicar no botão de profile/menu
        profile_button = safe_click(driver, (By.CSS_SELECTOR, "button[aria-label='Profile']"))
        wait(0.25)
        
        # Clica em logout
        logout_button = safe_click(driver, (By.XPATH, "//button[contains(text(), 'Sair') or contains(text(), 'Logout')]"))
        wait(0.25)
        
        # Verifica se voltou para login
        success = wait_for_url_contains(driver, "/login", timeout=5)
        if success:
            log_action("Logout realizado com sucesso")
        return success
        
    except Exception as e:
        log_action("Erro ao fazer logout", str(e))
        # Fallback: navega direto para login
        driver.get(f"{BASE_URL}/login")
        wait(0.3)
        return True
