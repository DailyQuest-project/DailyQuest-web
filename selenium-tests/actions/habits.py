"""
Ações de hábitos - DailyQuest
"""
import sys
from pathlib import Path

# Adiciona diretório pai ao path para imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from selenium.webdriver.common.by import By
from utils import wait, wait_for_clickable, safe_click, log_action
import ui_selectors as selectors
from datetime import datetime, timedelta
from validators import (
    validate_title, 
    validate_description, 
    validate_deadline, 
    validate_frequency,
    ValidationError
)

def create_habit(driver, title, description="", difficulty="medium"):
    """Cria um novo hábito (padrão tipo 'habit')"""
    # Valida campos antes de preencher
    try:
        title = validate_title(title, "Título do hábito")
        description = validate_description(description, "Descrição do hábito", required=False)
    except ValidationError as e:
        log_action("Erro de validação ao criar hábito", str(e))
        raise
    
    log_action("Criando hábito", title)

    # Scroll para topo da página para garantir que botão esteja visível
    driver.execute_script("window.scrollTo(0, 0);")
    wait(0.3)  # Reduzido de 0.5

    # Abre modal de criação
    try:
        btn = wait_for_clickable(driver, selectors.NEW_TASK_BUTTON, timeout=5)
        # Scroll para o botão estar visível
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", btn)
        wait(0.2)  # Reduzido de 0.3
        try:
            btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", btn)
    except Exception:
        log_action("Não encontrou botão 'Nova Tarefa', tentando alternativa")
        try:
            btn = driver.find_element(By.XPATH, "//button[contains(., 'Nova')]")
            driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", btn)
            wait(0.2)  # Reduzido de 0.3
            driver.execute_script("arguments[0].click();", btn)
        except Exception:
            pass

    # Aguarda modal abrir
    wait(1.0)  # Reduzido de 2.0

    # Preenche título e descrição
    title_field = wait_for_clickable(driver, selectors.TITLE, timeout=5)
    title_field.clear()
    title_field.send_keys(title)
    wait(0.3)  # Reduzido de 0.5

    if description:
        desc_field = wait_for_clickable(driver, selectors.DESCRIPTION, timeout=3)
        desc_field.clear()
        desc_field.send_keys(description)
        wait(0.3)  # Reduzido de 0.5

    # Submete (padrão cria hábito)
    submit = wait_for_clickable(driver, selectors.MODAL_SUBMIT, timeout=5)
    submit.click()
    wait(1.0)  # Reduzido de 2.0
    log_action("Hábito criado (tentativa)")
    return True

def create_todo(driver, title, description="", deadline=""):
    """Cria um novo afazer (todo) selecionando tipo 'Afazer' no modal"""
    # Valida campos antes de preencher
    try:
        title = validate_title(title, "Título do afazer")
        description = validate_description(description, "Descrição do afazer", required=False)
        if deadline:
            deadline = validate_deadline(deadline)
    except ValidationError as e:
        log_action("Erro de validação ao criar afazer", str(e))
        raise
    
    log_action("Criando Afazer", title)
    
    # Aguarda para garantir que modal anterior fechou
    wait(0.5)  # Reduzido de 1.0
    
    # Scroll para topo da página
    driver.execute_script("window.scrollTo(0, 0);")
    wait(0.3)  # Reduzido de 0.5
    
    try:
        btn = wait_for_clickable(driver, selectors.NEW_TASK_BUTTON, timeout=5)
        # Scroll para o botão estar visível
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", btn)
        wait(0.2)  # Reduzido de 0.3
        try:
            btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", btn)
    except Exception:
        log_action("Botão 'Nova Tarefa' não encontrado, tentando alternativa")
        try:
            btn = driver.find_element(By.XPATH, "//button[contains(., 'Nova')]")
            driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", btn)
            wait(0.2)  # Reduzido de 0.3
            driver.execute_script("arguments[0].click();", btn)
        except Exception:
            pass

    wait(0.8)  # Reduzido de 1.5

    # Seleciona tipo 'Afazer'
    try:
        todo_card = wait_for_clickable(driver, selectors.TYPE_TODO, timeout=4)
        try:
            todo_card.click()
        except Exception:
            driver.execute_script("arguments[0].click();", todo_card)
        wait(0.3)  # Reduzido de 0.5
    except Exception:
        log_action("Não conseguiu selecionar tipo 'Afazer', continuando")

    title_field = wait_for_clickable(driver, selectors.TITLE, timeout=5)
    title_field.clear()
    title_field.send_keys(title)
    wait(0.3)  # Reduzido de 0.5

    if description:
        try:
            desc_field = wait_for_clickable(driver, selectors.DESCRIPTION, timeout=3)
            desc_field.clear()
            desc_field.send_keys(description)
            wait(0.3)  # Reduzido de 0.5
        except Exception:
            pass

    # Se não forneceu deadline, usa amanhã no formato DD-MM-YYYY
    if not deadline:
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%d-%m-%Y")
        deadline = tomorrow
    
    try:
        deadline_field = wait_for_clickable(driver, selectors.DEADLINE, timeout=3)
        deadline_field.clear()
        deadline_field.send_keys(deadline)
        wait(0.3)  # Reduzido de 0.5
        log_action(f"Deadline definido: {deadline}")
    except Exception as e:
        log_action(f"Campo deadline não encontrado: {str(e)[:50]}")

    try:
        submit = wait_for_clickable(driver, selectors.MODAL_SUBMIT, timeout=5)
        submit.click()
    except Exception:
        submit = driver.find_element(By.CSS_SELECTOR, "[role='dialog'] button[type='submit']")
        driver.execute_script("arguments[0].click();", submit)
    
    wait(1.0)  # Reduzido de 2.0
    log_action("Afazer criado com sucesso")
    return True


def complete_first_habit(driver):
    """Completa o primeiro hábito visível (clica no checkbox)"""
    log_action("Completando primeiro hábito")
    try:
        # Procura primeiro checkbox não marcado na aba de hábitos
        checkbox = wait_for_clickable(driver, (
            By.XPATH,
            "//button[contains(@class, 'rounded-full') and contains(@class, 'border-2') and not(contains(@class, 'bg-green'))]"
        ), timeout=5)
        checkbox.click()
        wait(0.8)  # Reduzido de 2.0
        log_action("Hábito completado")
        return True
    except Exception as e:
        log_action("Erro ao completar hábito", str(e)[:50])
        return False


def complete_multiple_habits(driver, count=2):
    """Completa os primeiros N hábitos visíveis"""
    log_action(f"Completando {count} hábitos")
    completed = 0
    
    for i in range(count):
        try:
            # Busca novamente os checkboxes a cada iteração para evitar stale element
            checkboxes = driver.find_elements(By.XPATH,
                "//button[contains(@class, 'rounded-full') and contains(@class, 'border-2') and not(contains(@class, 'bg-green'))]"
            )
            
            if len(checkboxes) == 0:
                log_action(f"Nenhum hábito não-completado encontrado (completados: {completed})")
                break
            
            # Clica no primeiro checkbox disponível
            try:
                checkboxes[0].click()
            except Exception:
                # Se o click falhar, tenta JS
                driver.execute_script("arguments[0].click();", checkboxes[0])
            
            completed += 1
            wait(0.8)  # Reduzido de 2.0
            log_action(f"Hábito {completed} completado")
            
        except Exception as e:
            log_action(f"Erro ao completar hábito {i+1}: {str(e)[:50]}")
            break
    
    log_action(f"Total: {completed} hábitos completados")
    return True if completed > 0 else False


def uncomplete_first_habit(driver):
    """Descomplet primeiro hábito (clica novamente no checkbox verde)"""
    log_action("Desmarcando hábito")
    try:
        # Procura checkbox marcado (verde com check)
        checkbox = wait_for_clickable(driver, (
            By.XPATH,
            "//button[contains(@class, 'bg-green-500')]"
        ), timeout=5)
        checkbox.click()
        wait(2.0)
        log_action("Hábito desmarcado")
        return True
    except Exception as e:
        log_action("Erro ao desmarcar hábito", str(e)[:50])
        return False


def switch_to_todos_tab(driver):
    """Alterna para aba de Afazeres"""
    log_action("Alternando para aba Afazeres")
    try:
        tab_button = wait_for_clickable(driver, (
            By.XPATH,
            "//button[@role='tab' and contains(., 'Afazeres')]"
        ), timeout=5)
        tab_button.click()
        wait(2.0)
        log_action("Aba Afazeres selecionada")
        return True
    except Exception as e:
        log_action("Erro ao alternar aba", str(e)[:50])
        return False


def use_filter(driver, filter_name="Todas"):
    """Usa filtro de tarefas (ex: 'Todas', 'Ativas', 'Concluídas')"""
    log_action("Aplicando filtro", filter_name)
    try:
        # Procura botão de filtro ou select
        filter_button = wait_for_clickable(driver, (
            By.XPATH,
            f"//button[contains(., '{filter_name}') or @aria-label='{filter_name}']"
        ), timeout=5)
        filter_button.click()
        wait(2.0)
        log_action(f"Filtro '{filter_name}' aplicado")
        return True
    except Exception as e:
        log_action("Filtro não encontrado", str(e)[:50])
        return False
