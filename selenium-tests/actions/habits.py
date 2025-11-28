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

    # Abre modal de criação
    try:
        btn = wait_for_clickable(driver, selectors.NEW_TASK_BUTTON, timeout=5)
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", btn)
        try:
            btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", btn)
    except Exception:
        log_action("Não encontrou botão 'Nova Tarefa', tentando alternativa")
        try:
            btn = driver.find_element(By.XPATH, "//button[contains(., 'Nova')]")
            driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", btn)
            driver.execute_script("arguments[0].click();", btn)
        except Exception:
            pass

    # Aguarda modal abrir
    wait(0.4)

    # Preenche título e descrição
    title_field = wait_for_clickable(driver, selectors.TITLE, timeout=5)
    title_field.clear()
    title_field.send_keys(title)

    if description:
        desc_field = wait_for_clickable(driver, selectors.DESCRIPTION, timeout=3)
        desc_field.clear()
        desc_field.send_keys(description)

    # Submete (padrão cria hábito)
    submit = wait_for_clickable(driver, selectors.MODAL_SUBMIT, timeout=5)
    submit.click()
    wait(0.3)
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
    
    # Scroll para topo da página
    driver.execute_script("window.scrollTo(0, 0);")
    
    try:
        btn = wait_for_clickable(driver, selectors.NEW_TASK_BUTTON, timeout=5)
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", btn)
        try:
            btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", btn)
    except Exception:
        log_action("Botão 'Nova Tarefa' não encontrado, tentando alternativa")
        try:
            btn = driver.find_element(By.XPATH, "//button[contains(., 'Nova')]")
            driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", btn)
            driver.execute_script("arguments[0].click();", btn)
        except Exception:
            pass

    wait(0.4)

    # Seleciona tipo 'Afazer'
    try:
        todo_card = wait_for_clickable(driver, selectors.TYPE_TODO, timeout=4)
        try:
            todo_card.click()
        except Exception:
            driver.execute_script("arguments[0].click();", todo_card)
        wait(0.2)
    except Exception:
        log_action("Não conseguiu selecionar tipo 'Afazer', continuando")

    title_field = wait_for_clickable(driver, selectors.TITLE, timeout=5)
    title_field.clear()
    title_field.send_keys(title)

    if description:
        try:
            desc_field = wait_for_clickable(driver, selectors.DESCRIPTION, timeout=3)
            desc_field.clear()
            desc_field.send_keys(description)
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
        log_action(f"Deadline definido: {deadline}")
    except Exception as e:
        log_action(f"Campo deadline não encontrado: {str(e)[:50]}")

    try:
        submit = wait_for_clickable(driver, selectors.MODAL_SUBMIT, timeout=5)
        submit.click()
    except Exception:
        submit = driver.find_element(By.CSS_SELECTOR, "[role='dialog'] button[type='submit']")
        driver.execute_script("arguments[0].click();", submit)
    
    wait(0.3)
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
        wait(0.3)
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
            wait(0.3)
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
        wait(0.25)
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
        wait(0.3)
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
        wait(0.3)
        log_action(f"Filtro '{filter_name}' aplicado")
        return True
    except Exception as e:
        log_action("Filtro não encontrado", str(e)[:50])
        return False


def create_habit_with_specific_days(driver, title, description="", difficulty="medium", days=[1, 3, 5]):
    """
    Cria um novo hábito com frequência SPECIFIC_DAYS (dias específicos da semana)
    days: lista de índices dos dias (0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb)
    """
    # Valida campos antes de preencher
    try:
        title = validate_title(title, "Título do hábito")
        description = validate_description(description, "Descrição do hábito", required=False)
    except ValidationError as e:
        log_action("Erro de validação ao criar hábito", str(e))
        raise
    
    log_action("Criando hábito com dias específicos", title)
    log_action(f"Dias selecionados: {days}")

    # Scroll para topo da página para garantir que botão esteja visível
    driver.execute_script("window.scrollTo(0, 0);")

    # Abre modal de criação
    try:
        btn = wait_for_clickable(driver, selectors.NEW_TASK_BUTTON, timeout=5)
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", btn)
        try:
            btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", btn)
    except Exception:
        log_action("Não encontrou botão 'Nova Tarefa', tentando alternativa")
        try:
            btn = driver.find_element(By.XPATH, "//button[contains(., 'Nova')]")
            driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", btn)
            driver.execute_script("arguments[0].click();", btn)
        except Exception:
            pass

    # Aguarda modal abrir
    wait(0.4)

    # Preenche título
    title_field = wait_for_clickable(driver, selectors.TITLE, timeout=5)
    title_field.clear()
    title_field.send_keys(title)

    # Preenche descrição (se fornecida)
    if description:
        desc_field = wait_for_clickable(driver, selectors.DESCRIPTION, timeout=3)
        desc_field.clear()
        desc_field.send_keys(description)

    # Seleciona frequência "Dias específicos"
    try:
        specific_days_card = wait_for_clickable(driver, (
            By.XPATH,
            "//div[contains(., 'Dias específicos') and contains(@class, 'cursor-pointer')]"
        ), timeout=4)
        try:
            specific_days_card.click()
        except Exception:
            driver.execute_script("arguments[0].click();", specific_days_card)
        wait(0.2)
        log_action("Frequência 'Dias específicos' selecionada")
    except Exception as e:
        log_action(f"Erro ao selecionar frequência: {str(e)[:50]}")

    # Seleciona os dias da semana
    day_labels = ["D", "S", "T", "Q", "Q", "S", "S"]  # Dom, Seg, Ter, Qua, Qui, Sex, Sáb
    
    for day_index in days:
        try:
            day_buttons = driver.find_elements(By.XPATH, 
                "//div[@role='dialog']//div[contains(@class, 'grid-cols-7')]//button[not(@disabled)]"
            )
            
            if day_index < len(day_buttons):
                day_btn = day_buttons[day_index]
                try:
                    day_btn.click()
                except Exception:
                    driver.execute_script("arguments[0].click();", day_btn)
                log_action(f"Dia {day_labels[day_index]} selecionado")
        except Exception as e:
            log_action(f"Erro ao selecionar dia {day_index}: {str(e)[:50]}")

    # Submete
    submit = wait_for_clickable(driver, selectors.MODAL_SUBMIT, timeout=5)
    submit.click()
    wait(0.3)
    log_action("Hábito com dias específicos criado")
    return True


def open_tag_manager(driver):
    """Abre o modal de gerenciamento de tags a partir do modal de criação de hábito"""
    log_action("Abrindo gerenciador de tags")
    
    # Primeiro, abre o modal de criação de hábito
    driver.execute_script("window.scrollTo(0, 0);")
    
    try:
        btn = wait_for_clickable(driver, selectors.NEW_TASK_BUTTON, timeout=5)
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", btn)
        try:
            btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", btn)
    except Exception:
        btn = driver.find_element(By.XPATH, "//button[contains(., 'Nova')]")
        driver.execute_script("arguments[0].click();", btn)
    
    wait(0.4)
    
    # Clica no botão "Gerenciar Tags" dentro do modal
    try:
        manage_tags_btn = wait_for_clickable(driver, (
            By.XPATH,
            "//button[contains(., 'Gerenciar') or contains(., 'Gerenciar Tags')]"
        ), timeout=5)
        try:
            manage_tags_btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", manage_tags_btn)
        wait(0.3)
        log_action("Modal de gerenciamento de tags aberto")
        return True
    except Exception as e:
        log_action(f"Erro ao abrir gerenciador de tags: {str(e)[:50]}")
        return False


def create_tag(driver, tag_name, color_index=0):
    """
    Cria uma nova tag
    color_index: índice da cor na paleta (0-15)
    """
    log_action(f"Criando tag: {tag_name}")
    
    try:
        # Preenche o nome da tag
        tag_input = wait_for_clickable(driver, (
            By.ID, "tag-name"
        ), timeout=5)
        tag_input.clear()
        tag_input.send_keys(tag_name)
        
        # Seleciona a cor (se especificado um índice diferente de 0)
        if color_index > 0:
            color_buttons = driver.find_elements(By.XPATH, 
                "//div[@role='dialog']//button[contains(@class, 'rounded-full') and contains(@class, 'w-8')]"
            )
            if color_index < len(color_buttons):
                try:
                    color_buttons[color_index].click()
                except Exception:
                    driver.execute_script("arguments[0].click();", color_buttons[color_index])
                log_action(f"Cor {color_index} selecionada")
        
        # Clica no botão "Criar Tag"
        create_btn = wait_for_clickable(driver, (
            By.XPATH,
            "//button[contains(., 'Criar Tag')]"
        ), timeout=5)
        try:
            create_btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", create_btn)
        wait(0.3)
        log_action(f"Tag '{tag_name}' criada")
        return True
    except Exception as e:
        log_action(f"Erro ao criar tag: {str(e)[:50]}")
        return False


def edit_tag(driver, tag_name, new_name="", new_color_index=-1):
    """
    Edita uma tag existente (nome e/ou cor)
    """
    log_action(f"Editando tag: {tag_name}")
    
    try:
        # Encontra a tag na lista e clica no botão de edição
        tag_row = driver.find_element(By.XPATH, 
            f"//div[@role='dialog']//div[contains(@class, 'glass') and .//span[contains(text(), '{tag_name}')]]"
        )
        edit_btn = tag_row.find_element(By.XPATH, ".//button[.//*[name()='svg']]")
        try:
            edit_btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", edit_btn)
        wait(0.2)
        
        # Atualiza o nome se fornecido
        if new_name:
            tag_input = wait_for_clickable(driver, (By.ID, "tag-name"), timeout=3)
            tag_input.clear()
            tag_input.send_keys(new_name)
            log_action(f"Nome alterado para: {new_name}")
        
        # Atualiza a cor se fornecido
        if new_color_index >= 0:
            color_buttons = driver.find_elements(By.XPATH, 
                "//div[@role='dialog']//button[contains(@class, 'rounded-full') and contains(@class, 'w-8')]"
            )
            if new_color_index < len(color_buttons):
                try:
                    color_buttons[new_color_index].click()
                except Exception:
                    driver.execute_script("arguments[0].click();", color_buttons[new_color_index])
                log_action(f"Nova cor {new_color_index} selecionada")
        
        # Clica no botão "Atualizar Tag"
        update_btn = wait_for_clickable(driver, (
            By.XPATH,
            "//button[contains(., 'Atualizar Tag')]"
        ), timeout=5)
        try:
            update_btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", update_btn)
        wait(0.3)
        log_action(f"Tag atualizada")
        return True
    except Exception as e:
        log_action(f"Erro ao editar tag: {str(e)[:50]}")
        return False


def delete_tag(driver, tag_name):
    """Deleta uma tag existente"""
    log_action(f"Deletando tag: {tag_name}")
    
    try:
        # Encontra a tag na lista e clica no botão de deleção (segundo botão)
        tag_row = driver.find_element(By.XPATH, 
            f"//div[@role='dialog']//div[contains(@class, 'glass') and .//span[contains(text(), '{tag_name}')]]"
        )
        buttons = tag_row.find_elements(By.XPATH, ".//button[.//*[name()='svg']]")
        if len(buttons) >= 2:
            delete_btn = buttons[1]  # O segundo botão é o de deleção
            try:
                delete_btn.click()
            except Exception:
                driver.execute_script("arguments[0].click();", delete_btn)
            wait(0.2)
            
            # Confirma a deleção no alert
            try:
                from selenium.webdriver.common.alert import Alert
                alert = Alert(driver)
                alert.accept()
            except Exception:
                pass  # Pode não ter alert, pode ser confirmação inline
            
            log_action(f"Tag '{tag_name}' deletada")
            return True
    except Exception as e:
        log_action(f"Erro ao deletar tag: {str(e)[:50]}")
        return False


def close_tag_manager(driver):
    """Fecha o modal de gerenciamento de tags e o modal de criação de hábito"""
    log_action("Fechando gerenciador de tags")
    
    try:
        from selenium.webdriver.common.keys import Keys
        body = driver.find_element(By.TAG_NAME, 'body')
        
        # Primeiro ESC - fecha o modal de tags
        body.send_keys(Keys.ESCAPE)
        wait(0.3)
        
        # Segundo ESC - fecha o modal de criação de hábito
        body.send_keys(Keys.ESCAPE)
        wait(0.3)
        
        # Terceiro ESC - garantia extra caso haja outro modal
        body.send_keys(Keys.ESCAPE)
        wait(0.2)
        
        log_action("Modais fechados com sucesso")
        return True
    except Exception as e:
        log_action(f"Erro ao fechar modais: {str(e)[:50]}")
        return False


def manage_tags_full_crud(driver):
    """
    Demonstra CRUD completo de tags:
    1. Abre gerenciador
    2. Cria tag
    3. Edita tag (muda cor)
    4. Edita outra vez (muda nome)
    5. Deleta tag
    """
    log_action("========================================")
    log_action("DEMONSTRAÇÃO CRUD DE TAGS")
    log_action("========================================")
    
    # 1. Abre o gerenciador de tags
    open_tag_manager(driver)
    
    # 2. Cria primeira tag
    create_tag(driver, "Demo Tag", color_index=5)  # Verde
    
    # 3. Cria segunda tag para editar
    create_tag(driver, "Tag para Editar", color_index=0)  # Vermelho
    
    # 4. Edita a segunda tag - muda a cor
    edit_tag(driver, "Tag para Editar", new_color_index=10)  # Azul
    
    # 5. Edita novamente - muda o nome
    edit_tag(driver, "Tag para Editar", new_name="Tag Editada")
    
    # 6. Deleta a primeira tag
    delete_tag(driver, "Demo Tag")
    
    # 7. Fecha o gerenciador
    close_tag_manager(driver)
    
    log_action("CRUD de tags concluído")
    return True
