"""Predefinição de seletores usados pelos scripts Selenium (nome sem conflito com stdlib)
"""
from selenium.webdriver.common.by import By

# Login page
USERNAME = (By.ID, "username")
PASSWORD = (By.ID, "password")
LOGIN_SUBMIT = (By.CSS_SELECTOR, "form button[type='submit']")

# Create Habit / Task modal
MODAL_DIALOG = (By.CSS_SELECTOR, "[role='dialog']")
MODAL_SUBMIT = (By.CSS_SELECTOR, "[role='dialog'] button[type='submit']")
TITLE = (By.ID, "title")
DESCRIPTION = (By.ID, "description")
DEADLINE = (By.ID, "deadline")
FREQUENCY_TIMES = (By.ID, "frequency_target_times")

# Dashboard quick buttons
NEW_TASK_BUTTON = (
    By.XPATH,
    "//button[.//text()[contains(., 'Nova Tarefa')] or normalize-space(.)='Nova Tarefa']"
)

# Habit/Todo type cards inside modal (use visible text)
TYPE_HABIT = (By.XPATH, "//div[contains(., 'Hábito') and contains(@class, 'cursor-pointer')]")
TYPE_TODO = (By.XPATH, "//div[contains(., 'Afazer') and contains(@class, 'cursor-pointer')]")

# Achievement & profile triggers
ACHIEVEMENTS_BUTTON = (
    By.XPATH,
    "//button[contains(text(), 'Ver Todas') or contains(text(), 'Ver todas')]"
)
PROFILE_DROPDOWN = (
    By.CSS_SELECTOR,
    "[role='button'][class*='Avatar']"
)
PROFILE_MENU_ITEM = (
    By.XPATH,
    "//div[contains(text(), 'Ver Perfil')]"
)
