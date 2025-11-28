"""
Ações de tarefas (tasks) - DailyQuest
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
    safe_click,
    slow_type,
    find_element_safe,
    log_action
)
from config import DEFAULT_DELAY


def open_create_task_modal(driver):
    """Abre modal de criação de tarefa"""
    log_action("Abrindo modal de criar tarefa")
    
    # Procura botão de criar tarefa
    create_button = safe_click(driver, (
        By.XPATH,
        "//button[contains(text(), 'Nova Tarefa') or contains(text(), 'Criar Tarefa') or contains(text(), 'Add Task')]"
    ))
    wait(DEFAULT_DELAY)
    return create_button


def create_task(driver, title, description="", difficulty="MEDIUM"):
    """Cria uma nova tarefa"""
    log_action("Criando tarefa", title)

    # Abre modal de criação (reaproveita botão 'Nova Tarefa')
    try:
        safe_click(driver, (By.XPATH, "//button[.//text()[contains(., 'Nova Tarefa')] or normalize-space(.)='Nova Tarefa']"))
    except Exception:
        log_action("Botão 'Nova Tarefa' não encontrado diretamente, tentando alternativa")

    # Aguarda modal abrir
    wait(DEFAULT_DELAY)

    # Preenche título e descrição usando IDs do modal
    title_field = wait_for_clickable(driver, (By.ID, "title"), timeout=5)
    title_field.clear()
    title_field.send_keys(title)
    wait(0.2)

    if description:
        try:
            desc_field = wait_for_clickable(driver, (By.ID, "description"), timeout=3)
            desc_field.clear()
            desc_field.send_keys(description)
            wait(0.2)
        except Exception:
            log_action("Campo de descrição não encontrado, continuando...")

    # Se for ToDo com deadline, preencher o campo
    if difficulty == "TODO_DEADLINE":
        try:
            deadline_field = wait_for_clickable(driver, (By.ID, "deadline"), timeout=3)
            # deadline expected in YYYY-MM-DD format if provided in title var or elsewhere
            # If not provided, skip
            wait(0.2)
        except Exception:
            log_action("Campo deadline não encontrado")

    # Clica em criar dentro do modal
    submit_button = wait_for_clickable(driver, (By.CSS_SELECTOR, "[role='dialog'] button[type='submit']"), timeout=6)
    submit_button.click()
    wait(DEFAULT_DELAY)

    log_action("Tarefa criada com sucesso (tentativa)")


def complete_task(driver, task_title):
    """Completa uma tarefa pelo título"""
    log_action("Completando tarefa", task_title)
    
    try:
        # Procura a tarefa pelo título e o checkbox
        task_xpath = f"//div[contains(text(), '{task_title}')]/ancestor::div[contains(@class, 'task') or contains(@class, 'todo')]//input[@type='checkbox']"
        checkbox = safe_click(driver, (By.XPATH, task_xpath))
        wait(DEFAULT_DELAY * 2)  # Espera animação de XP
        
        log_action("Tarefa completada com sucesso")
        return True
    except Exception as e:
        log_action("Erro ao completar tarefa", str(e))
        return False


def complete_first_incomplete_task(driver):
    """Completa a primeira tarefa incompleta encontrada"""
    log_action("Completando primeira tarefa incompleta")
    
    try:
        # Procura primeiro checkbox não marcado
        checkbox = safe_click(driver, (
            By.XPATH,
            "//input[@type='checkbox' and not(@checked)]"
        ))
        wait(DEFAULT_DELAY * 2)  # Espera animação de XP
        
        log_action("Primeira tarefa completada")
        return True
    except Exception as e:
        log_action("Nenhuma tarefa incompleta encontrada", str(e))
        return False


def delete_task(driver, task_title):
    """Deleta uma tarefa pelo título"""
    log_action("Deletando tarefa", task_title)
    
    try:
        # Procura botão de delete da tarefa
        delete_xpath = f"//div[contains(text(), '{task_title}')]/ancestor::div[contains(@class, 'task') or contains(@class, 'todo')]//button[contains(@aria-label, 'Delete') or contains(@title, 'Deletar')]"
        delete_button = safe_click(driver, (By.XPATH, delete_xpath))
        wait(DEFAULT_DELAY)
        
        # Confirma se houver modal de confirmação
        try:
            confirm_button = safe_click(driver, (
                By.XPATH,
                "//button[contains(text(), 'Confirmar') or contains(text(), 'Deletar') or contains(text(), 'Delete')]"
            ), timeout=3)
            wait(DEFAULT_DELAY)
        except:
            pass  # Não havia confirmação
        
        log_action("Tarefa deletada com sucesso")
        return True
    except Exception as e:
        log_action("Erro ao deletar tarefa", str(e))
        return False


def count_tasks(driver):
    """Conta número de tarefas visíveis"""
    tasks = driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
    count = len(tasks)
    log_action("Tarefas encontradas", str(count))
    return count
