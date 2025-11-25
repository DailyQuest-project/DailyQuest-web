"""
Utilitários para testes Selenium - DailyQuest
"""
import time
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.remote.webelement import WebElement


def wait(seconds=2.0):
    """Pausa para esperar animações de UI"""
    time.sleep(seconds)


def wait_for_element(driver, locator, timeout=5):
    """Espera elemento ser visível"""
    element = WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located(locator)
    )
    return element


def wait_for_clickable(driver, locator, timeout=5):
    """Espera elemento ser clicável"""
    element = WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable(locator)
    )
    time.sleep(0.2)
    return element


def wait_for_url_contains(driver, snippet, timeout=5):
    """Espera URL conter determinado texto"""
    try:
        WebDriverWait(driver, timeout).until(EC.url_contains(snippet))
        return True
    except TimeoutException:
        return False


def wait_for_invisibility(driver, locator, timeout=3):
    """Espera elemento desaparecer"""
    try:
        WebDriverWait(driver, timeout).until(
            EC.invisibility_of_element_located(locator)
        )
    except Exception:
        pass


def safe_click(driver, locator, timeout=5):
    """Clique seguro com scroll e espera"""
    element = wait_for_clickable(driver, locator, timeout)
    driver.execute_script("arguments[0].scrollIntoView(true);", element)
    time.sleep(0.2)
    element.click()
    return element


def slow_type(element: WebElement, text: str, delay: float = 0.1):
    """Digita devagar caractere por caractere"""
    try:
        for character in text:
            element.send_keys(character)
            time.sleep(delay)
    except Exception as e:
        print(f"[Utils] Erro ao digitar: {e}")


def find_element_safe(driver, locator, timeout=2):
    """Tenta encontrar elemento, retorna None se não existir"""
    try:
        return WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located(locator)
        )
    except (TimeoutException, NoSuchElementException):
        return None


def log_action(action, detail=""):
    """Log formatado de ações"""
    timestamp = time.strftime("%H:%M:%S")
    if detail:
        print(f"[{timestamp}] {action}: {detail}")
    else:
        print(f"[{timestamp}] {action}")
