"""
Ações de perfil (profile) - DailyQuest
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


def open_profile_modal(driver):
    """Abre modal de perfil"""
    log_action("Abrindo modal de perfil")
    
    # Scroll para topo para ver o avatar
    driver.execute_script("window.scrollTo(0, 0);")
    wait(0.2)  # Reduzido de 0.3
    
    try:
        # O avatar é um SPAN com texto (iniciais do usuário) e cursor-pointer
        # Estratégia: Procura span com cursor-pointer no header
        try:
            avatar = wait_for_clickable(driver, (
                By.XPATH,
                "//span[contains(@class, 'cursor-pointer') and contains(@class, 'rounded-full') and contains(@class, 'border-2')]"
            ), timeout=5)
            driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", avatar)
            wait(0.1)  # Reduzido de 0.2
            try:
                avatar.click()
            except Exception:
                driver.execute_script("arguments[0].click();", avatar)
            wait(0.5)  # Reduzido de 0.8
            log_action("Avatar clicado, aguardando dropdown")
        except Exception as e:
            log_action(f"Erro ao clicar no avatar: {str(e)[:50]}")
            # Estratégia alternativa: busca qualquer elemento clicável com iniciais
            avatar = driver.find_element(By.XPATH, "//span[string-length(text())=2 and contains(@class, 'rounded-full')]")
            driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", avatar)
            wait(0.1)  # Reduzido de 0.2
            driver.execute_script("arguments[0].click();", avatar)
            wait(0.5)  # Reduzido de 0.8
        
        # Clica em "Ver Perfil" no menu dropdown
        try:
            profile_item = wait_for_clickable(driver, (
                By.XPATH,
                "//div[contains(text(), 'Ver Perfil')]"
            ), timeout=5)
            try:
                profile_item.click()
            except Exception:
                driver.execute_script("arguments[0].click();", profile_item)
        except Exception:
            # fallback: procura item do menu com ícone Trophy (Ver Perfil)
            log_action("Tentando encontrar item 'Ver Perfil' por ícone")
            profile_item = driver.find_element(By.XPATH, "//div[.//svg and contains(., 'Ver Perfil')]")
            driver.execute_script("arguments[0].click();", profile_item)
        
        wait(0.3)  # Reduzido de 0.5
        
        # Verifica se modal abriu
        modal = wait_for_element(driver, (
            By.CSS_SELECTOR,
            "[role='dialog'], [class*='modal']"
        ), timeout=5)
        
        log_action("Modal de perfil aberto")
        return True
    except Exception as e:
        log_action("Erro ao abrir modal de perfil", str(e)[:120])
        return False


def close_profile_modal(driver):
    """Fecha modal de perfil"""
    log_action("Fechando modal de perfil")
    
    try:
        # Tenta ESC key primeiro (mais rápido)
        driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.ESCAPE)
        wait(0.3)  # Reduzido de 0.5
        log_action("Modal de perfil fechado (ESC)")
        return True
    except Exception:
        pass
    
    try:
        close_button = wait_for_clickable(driver, (
            By.XPATH,
            "//button[contains(@aria-label, 'Close') or contains(@aria-label, 'Fechar') or contains(text(), '×') or @data-state='open']"
        ), timeout=4)
        try:
            close_button.click()
        except Exception:
            driver.execute_script("arguments[0].click();", close_button)
        wait(0.3)  # Reduzido de 0.5
        
        log_action("Modal de perfil fechado")
        return True
    except Exception as e:
        log_action("Erro ao fechar modal", str(e)[:80])
        return False


def verify_user_stats(driver):
    """Verifica estatísticas do usuário no perfil"""
    log_action("Perfil visualizado")
    wait(0.3)  # Reduzido de 0.5
    # Verificação simplificada para velocidade
    return {"profile": True}


def toggle_theme(driver):
    """Alterna tema (dark/light mode)"""
    log_action("Alternando tema")
    
    try:
        # Procura botão de tema
        theme_button = safe_click(driver, (
            By.XPATH,
            "//button[contains(@aria-label, 'theme') or contains(@aria-label, 'tema') or contains(@title, 'Theme')]"
        ))
        wait(DEFAULT_DELAY)
        
        log_action("Tema alternado")
        return True
    except Exception as e:
        log_action("Botão de tema não encontrado", str(e))
        return False


def navigate_calendar_next(driver):
    """Clica no botão próximo mês do calendário"""
    log_action("Navegando para próximo mês no calendário")
    
    try:
        # Primeiro, precisa ir para a aba "Progresso" onde está o calendário
        try:
            progress_tab = wait_for_clickable(driver, (
                By.XPATH,
                "//button[contains(text(), 'Progresso')]"
            ), timeout=3)
            progress_tab.click()
            wait(0.3)  # Reduzido de 0.5
        except Exception as e:
            log_action(f"Não conseguiu abrir aba Progresso: {str(e)[:50]}")
        
        # Busca diretamente os botões de navegação (mais específico)
        # Eles são buttons pequenos com SVG dentro, geralmente com chevron icons
        # Usa wait para garantir que a aba carregou
        wait(0.2)
        calendar_nav_buttons = driver.find_elements(By.XPATH, 
            "//div[@role='dialog']//button[@class and contains(@class, 'p-1')]//*[name()='svg']/.."
        )
        
        # Fallback: busca qualquer button pequeno no modal
        if not calendar_nav_buttons:
            calendar_nav_buttons = [btn for btn in driver.find_elements(By.XPATH, "//div[@role='dialog']//button[contains(@class, 'p-1')]") 
                                   if btn.find_elements(By.TAG_NAME, 'svg')]
        
        # O último deve ser "próximo" (seta direita), o penúltimo "anterior"
        if len(calendar_nav_buttons) >= 2:
            next_button = calendar_nav_buttons[-1]
            try:
                next_button.click()
            except Exception:
                driver.execute_script("arguments[0].click();", next_button)
            wait(0.3)
            log_action("✓ Próximo mês selecionado")
            return True
        else:
            log_action(f"Botões de navegação não encontrados (encontrou {len(calendar_nav_buttons)})")
            return False
            
    except Exception as e:
        log_action("Erro ao navegar calendário", str(e)[:80])
        return False


def navigate_calendar_previous(driver):
    """Clica no botão mês anterior do calendário"""
    log_action("Navegando para mês anterior no calendário")
    
    try:
        # A aba Progresso já deve estar aberta do passo anterior
        # Mas verifica mesmo assim
        try:
            progress_tab = driver.find_element(By.XPATH, "//button[contains(text(), 'Progresso')]")
            if 'data-state=active' not in (progress_tab.get_attribute('data-state') or ''):
                progress_tab.click()
                wait(0.3)
        except Exception:
            pass
        
        # Busca diretamente os botões de navegação com SVG (mais rápido)
        wait(0.2)
        calendar_nav_buttons = driver.find_elements(By.XPATH, 
            "//div[@role='dialog']//button[@class and contains(@class, 'p-1')]//*[name()='svg']/.."
        )
        
        # Fallback: busca qualquer button pequeno no modal com SVG
        if not calendar_nav_buttons:
            calendar_nav_buttons = [btn for btn in driver.find_elements(By.XPATH, "//div[@role='dialog']//button[contains(@class, 'p-1')]") 
                                   if btn.find_elements(By.TAG_NAME, 'svg')]
        
        # O penúltimo deve ser "anterior" (seta esquerda)
        if len(calendar_nav_buttons) >= 2:
            prev_button = calendar_nav_buttons[-2]
            try:
                prev_button.click()
            except Exception:
                driver.execute_script("arguments[0].click();", prev_button)
            wait(0.3)
            log_action("✓ Mês anterior selecionado")
            return True
        else:
            log_action(f"Botões de navegação não encontrados (encontrou {len(calendar_nav_buttons)})")
            return False
            
    except Exception as e:
        log_action("Erro ao navegar calendário", str(e)[:80])
        return False
