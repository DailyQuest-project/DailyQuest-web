#!/usr/bin/env python3
"""
Script principal - Demonstração automatizada DailyQuest
Baseado na arquitetura modular com ações e cenários JSON
"""
import json
import sys
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import os
from pathlib import Path

# Adiciona diretório atual ao path
sys.path.insert(0, str(Path(__file__).parent))

from config import BASE_URL, DEFAULT_TIMEOUT, DEFAULT_DELAY, CHROME_OPTIONS
from utils import wait, log_action

# Importa módulos de ações
from actions import auth, dashboard, tasks, achievements, profile
from actions import habits


def setup_driver():
    """Configura e retorna driver do Chrome"""
    log_action("Configurando Chrome WebDriver")
    
    options = webdriver.ChromeOptions()
    for option in CHROME_OPTIONS:
        options.add_argument(option)
    # webdriver-manager may return a path that is not the actual executable (e.g. a NOTICE file)
    install_path = ChromeDriverManager().install()
    driver_path = Path(install_path)
    
    log_action(f"webdriver-manager returned: {install_path}")
    
    # Check if the returned file is actually the chromedriver binary
    is_valid_binary = (
        driver_path.is_file() and 
        driver_path.name == 'chromedriver' and 
        os.access(str(driver_path), os.X_OK)
    )
    
    if not is_valid_binary:
        log_action(f"Returned path is not the chromedriver binary (is_file={driver_path.is_file()}, name={driver_path.name})")
        log_action("Searching for actual chromedriver binary...")
        
        # Search in the same directory for the actual chromedriver
        search_dir = driver_path.parent if driver_path.is_file() else driver_path
        log_action(f"Searching in: {search_dir}")
        
        exec_candidate = None
        # List all files in the directory for debugging
        try:
            files = list(search_dir.iterdir())
            log_action(f"Files in directory: {[f.name for f in files]}")
        except Exception as e:
            log_action(f"Could not list directory: {e}")
        
        # Look for files named exactly 'chromedriver' (no extension)
        for candidate in search_dir.iterdir():
            if candidate.name == 'chromedriver' and candidate.is_file():
                log_action(f"Found candidate: {candidate}, executable={os.access(str(candidate), os.X_OK)}")
                # Try to make it executable if not already
                try:
                    if not os.access(str(candidate), os.X_OK):
                        log_action(f"Making {candidate} executable...")
                        os.chmod(str(candidate), 0o755)
                    exec_candidate = candidate
                    log_action(f"✓ Using chromedriver at: {candidate}")
                    break
                except Exception as e:
                    log_action(f"Could not use {candidate}: {e}")
        
        if exec_candidate:
            final_path = str(exec_candidate)
        else:
            log_action("ERROR: Could not find chromedriver binary!")
            final_path = str(driver_path)  # Will fail, but with clear error
    else:
        final_path = str(driver_path)
    
    log_action(f"Final path: {final_path}")
    service = Service(final_path)
    driver = webdriver.Chrome(service=service, options=options)
    driver.implicitly_wait(DEFAULT_TIMEOUT)
    
    log_action("Chrome iniciado com sucesso")
    return driver


def load_scenarios():
    """Carrega cenários do arquivo JSON"""
    scenarios_path = Path(__file__).parent / "data" / "scenarios.json"
    
    log_action("Carregando cenários", str(scenarios_path))
    
    with open(scenarios_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    log_action("Cenários carregados com sucesso")
    return data


def execute_test_flow(driver, scenarios):
    """Executa fluxo de testes baseado nos cenários"""
    user_data = scenarios["user"]
    flow = scenarios["test_flow"]["steps"]
    
    log_action("========================================")
    log_action("INICIANDO DEMONSTRAÇÃO DAILYQUEST")
    log_action("========================================")
    wait(0.3)
    
    # Contadores para criar múltiplos items
    habit_counter = 0
    task_counter = 0
    
    for idx, step in enumerate(flow, 1):
        action = step["action"]
        description = step["description"]
        
        log_action("========================================")
        log_action(f"PASSO {idx}/{len(flow)}: {description}")
        log_action("========================================")
        
        try:
            if action == "login":
                auth.login(driver, user_data["username"], user_data["password"])
            
            elif action == "verify_dashboard":
                dashboard.verify_dashboard_elements(driver)
            
            elif action == "scroll_dashboard" or action == "final_scroll":
                dashboard.scroll_dashboard(driver)
            
            elif action == "open_achievements":
                achievements.open_achievements_modal(driver)

            elif action == "create_habit":
                # Cria um hábito a partir do próximo habit do cenário
                habits_list = scenarios.get("habits", [])
                if habit_counter < len(habits_list):
                    habit = habits_list[habit_counter]
                    habits.create_habit(driver, habit.get("name", f"Hábito Demo {habit_counter+1}"), habit.get("description", ""))
                    habit_counter += 1
                else:
                    # Se não tiver mais hábitos definidos, cria um genérico
                    habits.create_habit(driver, f"Hábito Demo {habit_counter+1}", "Descrição padrão")
                    habit_counter += 1

            elif action == "create_habit_specific_days":
                # Cria um hábito com dias específicos da semana
                days = step.get("days", [1, 3, 5])  # Default: Seg, Qua, Sex
                habits_list = scenarios.get("habits", [])
                
                # Procura o próximo hábito com frequência SPECIFIC_DAYS
                habit_data = None
                for h in habits_list[habit_counter:]:
                    if h.get("frequency") == "SPECIFIC_DAYS":
                        habit_data = h
                        break
                
                if habit_data:
                    habits.create_habit_with_specific_days(
                        driver, 
                        habit_data.get("name", f"Hábito Dias Específicos {habit_counter+1}"),
                        habit_data.get("description", ""),
                        habit_data.get("difficulty", "medium"),
                        habit_data.get("days", days)
                    )
                else:
                    habits.create_habit_with_specific_days(
                        driver,
                        f"Hábito Dias Específicos {habit_counter+1}",
                        "Hábito com dias específicos",
                        "medium",
                        days
                    )
                habit_counter += 1

            elif action == "manage_tags":
                # Demonstra CRUD completo de tags
                habits.manage_tags_full_crud(driver)

            elif action == "create_todo":
                # Cria um afazer (todo) usando o próximo task do cenário
                tasks_list = scenarios.get("tasks", [])
                if task_counter < len(tasks_list):
                    task = tasks_list[task_counter]
                    habits.create_todo(driver, task.get("title", f"Afazer Demo {task_counter+1}"), task.get("description", ""))
                    task_counter += 1
                else:
                    # Se não tiver mais tasks definidas, cria uma genérica
                    habits.create_todo(driver, f"Afazer Demo {task_counter+1}", "Descrição padrão")
                    task_counter += 1
            
            elif action == "complete_habit":
                habits.complete_first_habit(driver)
            
            elif action == "complete_2_habits":
                habits.complete_multiple_habits(driver, 2)
            
            elif action == "uncomplete_habit":
                habits.uncomplete_first_habit(driver)
            
            elif action == "switch_to_todos":
                habits.switch_to_todos_tab(driver)
            
            elif action == "use_filter":
                filter_name = step.get("filter_name", "Todas")
                habits.use_filter(driver, filter_name)
            
            elif action == "scroll_achievements":
                achievements.scroll_achievements(driver)
            
            elif action == "close_achievements":
                achievements.close_achievements_modal(driver)
            
            elif action == "open_profile":
                profile.open_profile_modal(driver)
            
            elif action == "close_profile":
                profile.close_profile_modal(driver)
            
            elif action == "view_profile":
                profile.verify_user_stats(driver)
            
            elif action == "calendar_next":
                profile.navigate_calendar_next(driver)
            
            elif action == "calendar_previous":
                profile.navigate_calendar_previous(driver)
            
            elif action == "edit_character":
                # Edita o avatar/personagem do usuário
                avatar_index = step.get("avatar_index", None)
                profile.edit_character(driver, avatar_index)
            
            else:
                log_action(f"Ação não implementada: {action}")
            
            wait(0.2)
            
        except Exception as e:
            log_action(f"Erro no passo {idx}: {str(e)[:100]}")
            wait(0.3)
    
    log_action("========================================")
    log_action("DEMONSTRAÇÃO CONCLUÍDA")
    log_action("========================================")


def main():
    """Função principal"""
    driver = None
    
    try:
        # Setup
        driver = setup_driver()
        scenarios = load_scenarios()
        
        # Navega para aplicação
        log_action("Navegando para DailyQuest", BASE_URL)
        driver.get(BASE_URL)
        wait(DEFAULT_DELAY)
        
        # Executa fluxo de testes
        execute_test_flow(driver, scenarios)
        
        # Mantém navegador aberto por alguns segundos
        log_action("Mantendo navegador aberto por 3 segundos...")
        wait(3)
        
    except KeyboardInterrupt:
        log_action("Interrompido pelo usuário")
    
    except Exception as e:
        log_action("ERRO CRÍTICO", str(e))
        import traceback
        traceback.print_exc()
    
    finally:
        if driver:
            log_action("Fechando navegador")
            driver.quit()


if __name__ == "__main__":
    main()
