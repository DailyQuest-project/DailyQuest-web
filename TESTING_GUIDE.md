# 🧪 Guia de Teste - DailyQuest Frontend

## Pré-requisitos

Certifique-se de que os serviços backend estão rodando:

```bash
# Terminal 1 - Auth Service
cd DailyQuest-auth
docker compose up

# Terminal 2 - Main API
cd DailyQuest-api
docker compose up

# Terminal 3 - Frontend
cd DailyQuest-web
pnpm dev
```

## 🎯 Cenários de Teste

### 1. Fluxo de Registro e Login

#### Teste 1.1: Criar Nova Conta
1. Acesse: http://localhost:3000/register
2. Preencha:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `senha123`
   - Confirmar Password: `senha123`
3. Clique em "Criar conta"
4. ✅ **Esperado**: Redirecionamento automático para dashboard

#### Teste 1.2: Login Manual
1. Faça logout (menu do usuário → Sair)
2. Acesse: http://localhost:3000/login
3. Entre com as credenciais criadas
4. ✅ **Esperado**: Dashboard carrega com dados do usuário

### 2. Criação de Hábitos

#### Teste 2.1: Hábito Diário
1. No dashboard, clique em "Nova Tarefa"
2. Preencha:
   - Título: `Meditar 10 minutos`
   - Tipo: Hábito
   - Frequência: Diariamente
   - Dificuldade: Fácil
3. Clique em "Criar Hábito"
4. ✅ **Esperado**: Toast de sucesso + card aparece na lista

#### Teste 2.2: Hábito com Meta Semanal
1. Nova Tarefa
2. Preencha:
   - Título: `Academia`
   - Tipo: Hábito
   - Frequência: N vezes por semana
   - Meta: `3` (validar que aceita 1-7)
   - Dificuldade: Médio
3. ✅ **Esperado**: Mostra "2/3 esta semana" no card

#### Teste 2.3: Hábito em Dias Específicos
1. Nova Tarefa
2. Preencha:
   - Título: `Reunião Semanal`
   - Tipo: Hábito
   - Frequência: Dias específicos
   - Selecione: Segunda, Quarta, Sexta
   - Dificuldade: Médio
3. ✅ **Esperado**: Card mostra "Seg, Qua, Sex"

### 3. Criação de ToDos

#### Teste 3.1: ToDo com Deadline Futuro
1. Nova Tarefa
2. Preencha:
   - Título: `Entregar Relatório`
   - Tipo: Afazer
   - Deadline: Amanhã 18:00
   - Dificuldade: Difícil
3. ✅ **Esperado**: Card mostra "em X horas"

#### Teste 3.2: Validação de Deadline Passado
1. Nova Tarefa
2. Tente criar com data de ontem
3. ✅ **Esperado**: Erro "Deadline não pode ser no passado"

### 4. Completar Tarefas e Gamificação

#### Teste 4.1: Completar Hábito (Ganhar XP)
1. Clique em "Completar" no hábito criado
2. ✅ **Esperado**:
   - Toast: "🎉 Tarefa Completada! Você ganhou X XP!"
   - Barra de XP aumenta imediatamente
   - Botão fica verde "Completado"

#### Teste 4.2: Level Up
1. Complete várias tarefas até acumular 100+ XP
2. ✅ **Esperado**:
   - Modal "LEVEL UP!" aparece
   - Animação de confetti
   - Badge mostra novo nível
   - Sidebar atualiza o nível

#### Teste 4.3: Streak de Hábito
1. Complete um hábito diário
2. Verifique o card no dia seguinte
3. Complete novamente
4. ✅ **Esperado**:
   - Badge de streak aumenta (🔥 2 dias)
   - Toast mostra "🔥 X dias de sequência!"

### 5. Edição e Exclusão

#### Teste 5.1: Deletar Tarefa
1. No card de uma tarefa, clique nos 3 pontos (⋯)
2. Clique em "Deletar"
3. Confirme no dialog
4. ✅ **Esperado**: 
   - Toast "Tarefa removida"
   - Card desaparece da lista

#### Teste 5.2: Tarefa Já Completada
1. Tente completar uma tarefa já marcada como completada
2. ✅ **Esperado**: Botão desabilitado, não faz nova requisição

### 6. Filtros e Navegação

#### Teste 6.1: Filtro por Tipo
1. Crie pelo menos 1 hábito e 1 todo
2. Clique na tab "Hábitos"
3. ✅ **Esperado**: Mostra apenas hábitos
4. Clique na tab "Afazeres"
5. ✅ **Esperado**: Mostra apenas todos

#### Teste 6.2: Estatísticas
1. Verifique o card "Estatísticas" na sidebar
2. ✅ **Esperado**:
   - Total de Tarefas: número correto
   - Completadas Hoje: atualiza ao completar
   - Hábitos: count correto
   - Afazeres: count correto

### 7. Temas e Responsividade

#### Teste 7.1: Alternar Tema
1. Clique no ícone de tema (sol/lua) no header
2. ✅ **Esperado**: Interface muda entre claro/escuro

#### Teste 7.2: Mobile
1. Redimensione a janela ou use DevTools (F12 → modo mobile)
2. ✅ **Esperado**: Layout adapta para single column

### 8. Erros e Edge Cases

#### Teste 8.1: Criar Tarefa Sem Título
1. Tente criar tarefa sem título
2. ✅ **Esperado**: Erro "Título é obrigatório"

#### Teste 8.2: Logout e Proteção de Rota
1. Faça logout
2. Tente acessar: http://localhost:3000/dashboard
3. ✅ **Esperado**: Redireciona para /login

#### Teste 8.3: Login com Credenciais Inválidas
1. Tente fazer login com senha errada
2. ✅ **Esperado**: Alert "Credenciais inválidas"

#### Teste 8.4: Erro 401 (Token Expirado)
1. Limpe o localStorage manualmente
2. Tente fazer qualquer ação (completar tarefa)
3. ✅ **Esperado**: Redireciona para login automaticamente

### 9. Performance e UX

#### Teste 9.1: Loading States
1. Complete uma tarefa
2. ✅ **Esperado**: Botão mostra "Completando..." durante requisição

#### Teste 9.2: Otimistic Updates
1. Complete uma tarefa
2. ✅ **Esperado**: XP atualiza instantaneamente (não espera reload)

#### Teste 9.3: Refresh de Dados
1. Complete uma tarefa em uma aba
2. Abra outra aba
3. Recarregue a página
4. ✅ **Esperado**: Estado sincronizado (tarefa aparece como completada)

## 🐛 Bugs Comuns e Soluções

### Problema: "Failed to fetch"
**Causa**: Backend não está rodando
**Solução**: 
```bash
docker compose up -d
```

### Problema: Token não salvando
**Causa**: localStorage bloqueado ou modo anônimo
**Solução**: Use janela normal, não anônima

### Problema: XP não atualiza
**Causa**: Response do backend não retorna user.xp
**Solução**: Verifique logs do backend, endpoint /complete deve retornar user completo

### Problema: Level Up não dispara
**Causa**: Comparação de level falhou
**Solução**: 
1. Abra DevTools Console
2. Verifique se `oldLevel` está sendo capturado
3. Verifique se `response.user.level` existe

## 📊 Checklist de Qualidade

- [ ] Todos os campos obrigatórios têm validação
- [ ] Erros HTTP são tratados com mensagens amigáveis
- [ ] Loading states em todas as ações assíncronas
- [ ] Toasts de sucesso/erro aparecem
- [ ] Level Up modal dispara no momento certo
- [ ] XP Bar anima suavemente
- [ ] Cards de tarefas mostram informações corretas (streak, deadline)
- [ ] Filtros funcionam corretamente
- [ ] Theme toggle persiste após refresh
- [ ] Logout limpa todos os dados

## 🎓 Dados de Teste Recomendados

### Usuário de Teste:
```
Username: demo
Email: demo@dailyquest.com
Password: demo123
```

### Hábitos de Exemplo:
1. **Fácil + Diário**: "Beber água ao acordar"
2. **Médio + 3x semana**: "Correr 30min"
3. **Difícil + Dias específicos**: "Estudar programação (Seg, Qua, Sex)"

### ToDos de Exemplo:
1. **Fácil**: "Responder emails" (deadline: hoje fim do dia)
2. **Médio**: "Fazer compras do mês" (deadline: fim de semana)
3. **Difícil**: "Entregar projeto final" (deadline: próxima semana)

---

**Resultado Esperado**: ✅ Todos os testes passam sem erros críticos
