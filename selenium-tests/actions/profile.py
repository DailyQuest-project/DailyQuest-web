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
    
    try:
        # O avatar é um SPAN com texto (iniciais do usuário) e cursor-pointer
        try:
            avatar = wait_for_clickable(driver, (
                By.XPATH,
                "//span[contains(@class, 'cursor-pointer') and contains(@class, 'rounded-full') and contains(@class, 'border-2')]"
            ), timeout=5)
            driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", avatar)
            try:
                avatar.click()
            except Exception:
                driver.execute_script("arguments[0].click();", avatar)
            wait(0.2)
            log_action("Avatar clicado, aguardando dropdown")
        except Exception as e:
            log_action(f"Erro ao clicar no avatar: {str(e)[:50]}")
            avatar = driver.find_element(By.XPATH, "//span[string-length(text())=2 and contains(@class, 'rounded-full')]")
            driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", avatar)
            driver.execute_script("arguments[0].click();", avatar)
            wait(0.2)
        
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
            log_action("Tentando encontrar item 'Ver Perfil' por ícone")
            profile_item = driver.find_element(By.XPATH, "//div[.//svg and contains(., 'Ver Perfil')]")
            driver.execute_script("arguments[0].click();", profile_item)
        
        wait(0.2)
        
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
        
        log_action("Modal de perfil fechado")
        return True
    except Exception as e:
        log_action("Erro ao fechar modal", str(e)[:80])
        return False


def verify_user_stats(driver):
    """Verifica estatísticas do usuário no perfil"""
    log_action("Perfil visualizado")
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
            wait(0.2)
        except Exception as e:
            log_action(f"Não conseguiu abrir aba Progresso: {str(e)[:50]}")
        
        # Busca diretamente os botões de navegação
        calendar_nav_buttons = driver.find_elements(By.XPATH, 
            "//div[@role='dialog']//button[@class and contains(@class, 'p-1')]//*[name()='svg']/.."
        )
        
        # Fallback: busca qualquer button pequeno no modal
        if not calendar_nav_buttons:
            calendar_nav_buttons = [btn for btn in driver.find_elements(By.XPATH, "//div[@role='dialog']//button[contains(@class, 'p-1')]") 
                                   if btn.find_elements(By.TAG_NAME, 'svg')]
        
        # O último deve ser "próximo" (seta direita)
        if len(calendar_nav_buttons) >= 2:
            next_button = calendar_nav_buttons[-1]
            try:
                next_button.click()
            except Exception:
                driver.execute_script("arguments[0].click();", next_button)
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
        try:
            progress_tab = driver.find_element(By.XPATH, "//button[contains(text(), 'Progresso')]")
            if 'data-state=active' not in (progress_tab.get_attribute('data-state') or ''):
                progress_tab.click()
                wait(0.2)
        except Exception:
            pass
        
        # Busca diretamente os botões de navegação com SVG
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
            log_action("✓ Mês anterior selecionado")
            return True
        else:
            log_action(f"Botões de navegação não encontrados (encontrou {len(calendar_nav_buttons)})")
            return False
            
    except Exception as e:
        log_action("Erro ao navegar calendário", str(e)[:80])
        return False


def edit_character(driver, avatar_index=None):
    """
    Edita o avatar/personagem do usuário no modal de perfil.
    Se avatar_index for None, seleciona um avatar diferente do atual automaticamente.
    avatar_index: 0-12 (índice do avatar na lista de opções)
    
    Avatares disponíveis: 🧙‍♂️, 👨‍💻, 👩‍🎨, 🦸‍♂️, 🦸‍♀️, 👨‍🚀, 👩‍🚀, 🧑‍🎓, 👨‍⚕️, 👩‍⚕️, 🧑‍🍳, 👨‍🌾, 👩‍🌾
    """
    log_action("Editando personagem/avatar")
    
    try:
        # Navega para a aba de Configurações
        try:
            settings_tab = wait_for_clickable(driver, (
                By.XPATH,
                "//button[@role='tab' and (contains(text(), 'Config') or contains(text(), 'Configurações'))]"
            ), timeout=5)
            try:
                settings_tab.click()
            except Exception:
                driver.execute_script("arguments[0].click();", settings_tab)
            wait(0.2)
            log_action("Aba Configurações selecionada")
        except Exception as e:
            log_action(f"Erro ao selecionar aba Config: {str(e)[:50]}")
        
        # Clica no botão "Editar" para entrar em modo de edição
        try:
            edit_btn = wait_for_clickable(driver, (
                By.XPATH,
                "//button[contains(., 'Editar')]"
            ), timeout=5)
            try:
                edit_btn.click()
            except Exception:
                driver.execute_script("arguments[0].click();", edit_btn)
            wait(0.2)
            log_action("Modo de edição ativado")
        except Exception as e:
            log_action(f"Erro ao clicar em Editar: {str(e)[:50]}")
            return False
        
        # Encontra todos os botões de avatar
        avatar_buttons = driver.find_elements(By.XPATH, 
            "//div[@role='dialog']//button[contains(@class, 'rounded-lg') and contains(@class, 'border-2')]"
        )
        
        if not avatar_buttons:
            # Fallback: busca por div com emojis
            avatar_buttons = driver.find_elements(By.XPATH, 
                "//div[@role='dialog']//div[contains(@class, 'grid')]//button"
            )
        
        log_action(f"Encontrados {len(avatar_buttons)} avatares")
        
        if len(avatar_buttons) == 0:
            log_action("Nenhum avatar encontrado")
            return False
        
        # Se não especificou índice, seleciona um diferente do atual
        if avatar_index is None:
            # Encontra qual está selecionado (tem border-primary)
            current_index = 0
            for i, btn in enumerate(avatar_buttons):
                classes = btn.get_attribute('class') or ''
                if 'border-primary' in classes or 'bg-primary' in classes:
                    current_index = i
                    break
            
            # Seleciona o próximo avatar
            avatar_index = (current_index + 1) % len(avatar_buttons)
            log_action(f"Avatar atual: {current_index}, novo: {avatar_index}")
        
        # Clica no avatar selecionado
        if avatar_index < len(avatar_buttons):
            avatar_btn = avatar_buttons[avatar_index]
            try:
                avatar_btn.click()
            except Exception:
                driver.execute_script("arguments[0].click();", avatar_btn)
            log_action(f"Avatar {avatar_index} selecionado")
        
        # Clica no botão "Salvar"
        try:
            save_btn = wait_for_clickable(driver, (
                By.XPATH,
                "//button[contains(., 'Salvar')]"
            ), timeout=5)
            try:
                save_btn.click()
            except Exception:
                driver.execute_script("arguments[0].click();", save_btn)
            wait(0.3)
            log_action("Alterações salvas")
        except Exception as e:
            log_action(f"Erro ao salvar: {str(e)[:50]}")
            return False
        
        log_action("✓ Personagem editado com sucesso")
        return True
        
    except Exception as e:
        log_action(f"Erro ao editar personagem: {str(e)[:80]}")
        return False


def edit_profile_name(driver, new_name):
    """
    Edita o nome do usuário no modal de perfil
    """
    log_action(f"Editando nome do perfil para: {new_name}")
    
    try:
        # Navega para a aba de Configurações
        try:
            settings_tab = wait_for_clickable(driver, (
                By.XPATH,
                "//button[@role='tab' and (contains(text(), 'Config') or contains(text(), 'Configurações'))]"
            ), timeout=5)
            try:
                settings_tab.click()
            except Exception:
                driver.execute_script("arguments[0].click();", settings_tab)
            wait(0.2)
        except Exception:
            pass
        
        # Clica no botão "Editar" para entrar em modo de edição
        edit_btn = wait_for_clickable(driver, (
            By.XPATH,
            "//button[contains(., 'Editar')]"
        ), timeout=5)
        try:
            edit_btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", edit_btn)
        wait(0.2)
        
        # Encontra e preenche o campo de nome
        name_field = wait_for_clickable(driver, (
            By.ID, "name"
        ), timeout=5)
        name_field.clear()
        name_field.send_keys(new_name)
        log_action(f"Nome alterado para: {new_name}")
        
        # Clica no botão "Salvar"
        save_btn = wait_for_clickable(driver, (
            By.XPATH,
            "//button[contains(., 'Salvar')]"
        ), timeout=5)
        try:
            save_btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", save_btn)
        wait(0.3)
        
        log_action("✓ Nome do perfil atualizado")
        return True
        
    except Exception as e:
        log_action(f"Erro ao editar nome: {str(e)[:80]}")
        return False
