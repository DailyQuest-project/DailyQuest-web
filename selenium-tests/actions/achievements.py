"""
Ações de conquistas (achievements) - DailyQuest
"""
import sys
from pathlib import Path

# Adiciona diretório pai ao path para imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from utils import (
    wait,
    wait_for_element,
    wait_for_clickable,
    safe_click,
    find_element_safe,
    log_action
)
from config import DEFAULT_DELAY
import ui_selectors as selectors


def open_achievements_modal(driver):
    """Abre modal de conquistas"""
    log_action("Abrindo modal de conquistas")
    
    try:
        # Tenta o seletor pré-definido
        try:
            btn = wait_for_clickable(driver, selectors.ACHIEVEMENTS_BUTTON, timeout=4)
            try:
                btn.click()
            except Exception:
                driver.execute_script("arguments[0].click();", btn)
        except Exception:
            btn = wait_for_clickable(driver, (By.XPATH, "//button[contains(., 'Conquistas') or contains(., 'Achievements') or contains(., 'Ver Todas')]"), timeout=4)
            try:
                btn.click()
            except Exception:
                driver.execute_script("arguments[0].click();", btn)

        # pequena espera para animação
        wait(0.3)

        # Verifica se modal abriu
        modal = wait_for_element(driver, (
            By.CSS_SELECTOR,
            "[role='dialog'], [class*='modal']"
        ), timeout=6)

        log_action("Modal de conquistas aberto")
        return True
    except Exception as e:
        log_action("Erro ao abrir modal de conquistas", str(e)[:120])
        try:
            alt = driver.find_element(By.XPATH, "//a[contains(., 'Conquistas') or contains(., 'Achievements')]")
            driver.execute_script("arguments[0].click();", alt)
            wait(0.3)
            modal = wait_for_element(driver, (By.CSS_SELECTOR, "[role='dialog'], [class*='modal']"), timeout=5)
            log_action("Modal de conquistas aberto via fallback")
            return True
        except Exception as e2:
            log_action("Falha ao abrir modal mesmo com fallback", str(e2)[:120])
            return False


def close_achievements_modal(driver):
    """Fecha modal de conquistas"""
    log_action("Fechando modal de conquistas")
    
    try:
        # Tenta ESC key primeiro (mais rápido)
        driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.ESCAPE)
        log_action("Modal de conquistas fechado (ESC)")
        return True
    except Exception:
        pass
    
    try:
        # Procura botão de fechar (X, Close, Fechar)
        close_button = wait_for_clickable(driver, (
            By.XPATH,
            "//button[contains(@aria-label, 'Close') or contains(@aria-label, 'Fechar') or contains(text(), '×')]"
        ), timeout=4)
        try:
            close_button.click()
        except Exception:
            driver.execute_script("arguments[0].click();", close_button)
        
        log_action("Modal de conquistas fechado")
        return True
    except Exception as e:
        log_action("Erro ao fechar modal", str(e)[:80])
        return False


def verify_achievement_unlocked(driver, achievement_name):
    """Verifica se uma conquista está desbloqueada"""
    log_action("Verificando conquista", achievement_name)
    
    try:
        # Procura conquista desbloqueada pelo nome
        achievement_element = find_element_safe(driver, (
            By.XPATH,
            f"//div[contains(text(), '{achievement_name}')]/ancestor::div[not(contains(@class, 'locked')) and not(contains(@class, 'grayscale'))]"
        ), timeout=3)
        
        unlocked = achievement_element is not None
        status = "✓ Desbloqueada" if unlocked else "✗ Bloqueada"
        log_action(f"  {status}: {achievement_name}")
        
        return unlocked
    except Exception as e:
        log_action("Erro ao verificar conquista", str(e))
        return False


def count_achievements(driver):
    """Conta conquistas totais e desbloqueadas"""
    log_action("Contando conquistas")
    
    try:
        # Conta todas as conquistas
        all_achievements = driver.find_elements(By.CSS_SELECTOR, "[class*='achievement'], [data-achievement]")
        total = len(all_achievements)
        
        # Conta conquistas desbloqueadas (não locked/grayscale)
        unlocked_achievements = driver.find_elements(By.XPATH, 
            "//div[contains(@class, 'achievement') and not(contains(@class, 'locked')) and not(contains(@class, 'grayscale'))]"
        )
        unlocked = len(unlocked_achievements)
        
        log_action("Conquistas", f"{unlocked}/{total} desbloqueadas")
        return {"total": total, "unlocked": unlocked}
    except Exception as e:
        log_action("Erro ao contar conquistas", str(e))
        return {"total": 0, "unlocked": 0}


def search_achievement(driver, search_term):
    """Busca conquista no modal"""
    log_action("Buscando conquista", search_term)
    
    try:
        # Procura campo de busca
        search_field = wait_for_clickable(driver, (
            By.CSS_SELECTOR,
            "input[type='search'], input[placeholder*='Buscar'], input[placeholder*='Search']"
        ), timeout=5)
        
        search_field.clear()
        search_field.send_keys(search_term)
        wait(DEFAULT_DELAY)
        
        log_action("Busca realizada")
        return True
    except Exception as e:
        log_action("Campo de busca não encontrado", str(e))
        return False


def filter_achievements_by_rarity(driver, rarity):
    """Filtra conquistas por raridade (common, rare, epic, legendary)"""
    log_action("Filtrando por raridade", rarity)
    
    try:
        # Procura botão/filtro de raridade
        rarity_button = safe_click(driver, (
            By.XPATH,
            f"//button[contains(text(), '{rarity}') or contains(@data-rarity, '{rarity}')]"
        ))
        wait(DEFAULT_DELAY)
        
        log_action(f"Filtro aplicado: {rarity}")
        return True
    except Exception as e:
        log_action("Filtro de raridade não encontrado", str(e))
        return False


def scroll_achievements(driver):
    """Scroll no modal de conquistas"""
    log_action("Visualizando conquistas")
    
    try:
        # Procura container de conquistas
        modal = driver.find_element(By.CSS_SELECTOR, "[role='dialog'], [class*='modal']")
        
        # Scroll rápido dentro do modal
        driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight / 2", modal)
        wait(0.25)
        
        driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", modal)
        wait(0.25)
        
        log_action("Conquistas visualizadas")
        return True
    except Exception as e:
        log_action("Modal não encontrado")
        return False
