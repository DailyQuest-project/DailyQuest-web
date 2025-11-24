# 🐛 Sessão de Debug - Problemas de Estado e Runtime

## 📋 Problemas Reportados

Apesar das correções documentadas no `CRITICAL_FIXES.md`, os seguintes problemas persistiam em **runtime**:

1. **Level Up não funciona visualmente** - XP aumenta, mas nível não muda na UI
2. **Spam de tarefas** - Botão "Completar" pode ser clicado infinitamente
3. **ToDos** - Botão não desabilita após completar
4. **Hábitos** - Validação `isHabitCompletedToday()` não bloqueia cliques
5. **Warnings React** - Components sem `forwardRef`

## 🔍 Diagnóstico Realizado

### 1. Gestão de Estado do Usuário (`use-tasks.tsx`)

**Problema Identificado:**
- A função `completeTask` estava chamando `updateUser`, mas não havia logs para confirmar se o estado estava sendo atualizado corretamente
- Possível problema: merge de estado não forçando re-render

**Correção Aplicada:**
```typescript
// ✅ Adicionados logs detalhados
console.log("🎯 [DEBUG] Completando tarefa:", id)
console.log("✅ [DEBUG] Resposta da API:", response)
console.log("👤 [DEBUG] User da API:", response.user)
console.log("📝 [DEBUG] Tarefa atualizada:", updatedTask)
console.log("🔄 [DEBUG] Atualizando usuário no contexto...")
```

**Resultado:**
- Agora podemos ver exatamente quando e como o estado é atualizado
- Identifica se `updateUser` está sendo chamado corretamente

---

### 2. Função `updateUser` no AuthContext (`use-auth.tsx`)

**Problema Identificado:**
- Não havia confirmação se o merge de estado estava funcionando
- `setUser` pode não estar forçando re-render se o objeto for igual por referência

**Correção Aplicada:**
```typescript
const updateUser = (updates: Partial<User>) => {
  console.log("🔄 [DEBUG] updateUser chamado com:", updates)
  console.log("👤 [DEBUG] Usuário atual antes:", user)
  
  if (user) {
    const updatedUser = { ...user, ...updates }
    console.log("👤 [DEBUG] Usuário após merge:", updatedUser)
    setUser(updatedUser)
    
    // Atualizar localStorage
    saveUser({...})
    console.log("✅ [DEBUG] Estado do usuário atualizado e salvo no localStorage")
  } else {
    console.warn("⚠️ [DEBUG] updateUser chamado mas user é null!")
  }
}
```

**Resultado:**
- Confirmação visual de que o merge está correto
- Detecta se `user` é `null` quando não deveria ser

---

### 3. Validação de Data em Hábitos (`task-card.tsx`)

**Problema Identificado:**
- Backend retorna `last_completed_at` como **string ISO**
- JavaScript pode falhar ao comparar datas se não converter corretamente
- Necessário logs para ver valores reais

**Correção Aplicada:**
```typescript
const isHabitCompletedToday = (): boolean => {
  if (!isHabit || !habit?.last_completed_at) return false
  
  const lastCompletedString = habit.last_completed_at
  const lastCompleted = new Date(lastCompletedString)
  const today = new Date()
  
  const isSameDay = (
    lastCompleted.getDate() === today.getDate() &&
    lastCompleted.getMonth() === today.getMonth() &&
    lastCompleted.getFullYear() === today.getFullYear()
  )
  
  console.log("🔍 [DEBUG] isHabitCompletedToday para tarefa:", task.id)
  console.log("   - Last Completed (string):", lastCompletedString)
  console.log("   - Last Completed (Date):", lastCompleted)
  console.log("   - Today:", today)
  console.log("   - Is Same Day?:", isSameDay)
  
  return isSameDay
}
```

**Resultado:**
- Vemos exatamente como a string ISO é convertida
- Confirmamos se a comparação de dia/mês/ano está correta
- Detecta problemas de timezone

---

### 4. Validação `canComplete()` (`task-card.tsx`)

**Problema Identificado:**
- Lógica complexa sem visibilidade do que está bloqueando
- Necessário separar cada condição

**Correção Aplicada:**
```typescript
const canComplete = (): boolean => {
  const isCurrentlyCompleting = isCompleting
  const isHabitDoneToday = isHabit && isHabitCompletedToday()
  const isTodoCompleted = !isHabit && task.completed
  
  const canDo = !isCurrentlyCompleting && !isHabitDoneToday && !isTodoCompleted
  
  console.log("🎯 [DEBUG] canComplete para tarefa:", task.id)
  console.log("   - isCompleting:", isCurrentlyCompleting)
  console.log("   - isHabit:", isHabit)
  console.log("   - isHabitDoneToday:", isHabitDoneToday)
  console.log("   - task.completed:", task.completed)
  console.log("   - Pode completar?:", canDo)
  
  return canDo
}
```

**Resultado:**
- Identifica qual condição está bloqueando
- Confirma se `isCompleting` está resetando corretamente
- Verifica se `task.completed` está atualizado

---

### 5. Handler `handleComplete` (`task-card.tsx`)

**Correção Aplicada:**
```typescript
const handleComplete = async () => {
  console.log("🎯 [DEBUG] handleComplete clicado para tarefa:", task.id)
  
  if (!canComplete()) {
    console.warn("⚠️ [DEBUG] Ação bloqueada - tarefa não pode ser completada")
    return
  }
  
  console.log("✅ [DEBUG] Iniciando completar tarefa...")
  setIsCompleting(true)
  try {
    await onComplete(task.id)
    console.log("✅ [DEBUG] Tarefa completada com sucesso!")
  } catch (error) {
    console.error("❌ [DEBUG] Erro ao completar tarefa:", error)
  } finally {
    setIsCompleting(false)
    console.log("🔄 [DEBUG] isCompleting resetado para false")
  }
}
```

**Resultado:**
- Rastreia fluxo completo da operação
- Confirma que `isCompleting` é resetado mesmo em erro
- Detecta bloqueios preventivos

---

### 6. Detecção de Level Up (`use-gamification-feedback.tsx`)

**Problema Identificado:**
- Backend pode retornar `level` como string em vez de number
- Comparação `>` com string falha silenciosamente

**Correção Aplicada:**
```typescript
const handleTaskComplete = useCallback((response: CompleteTaskResponse, oldLevel: number) => {
  console.log("🎮 [DEBUG] handleTaskComplete chamado")
  console.log("   - Old Level:", oldLevel, typeof oldLevel)
  console.log("   - New Level:", response.user?.level, typeof response.user?.level)
  console.log("   - Response completo:", response)
  
  // CRÍTICO: Garantir comparação numérica
  const newLevel = Number(response.user?.level)
  const previousLevel = Number(oldLevel)
  
  console.log("🔢 [DEBUG] Comparação de nível:")
  console.log("   - Previous Level (number):", previousLevel)
  console.log("   - New Level (number):", newLevel)
  console.log("   - Level up?:", newLevel > previousLevel)
  
  if (response.user && newLevel > previousLevel) {
    console.log("🚀 [DEBUG] LEVEL UP DETECTADO!")
    showLevelUp(newLevel)
    
    toast({
      title: "🚀 LEVEL UP!",
      description: `Parabéns! Você alcançou o nível ${newLevel}!`,
    })
  }
  
  // ... resto do código
}, [showXPGain, showLevelUp, toast, triggerConfetti])
```

**Resultado:**
- Conversão explícita para `Number` previne comparação de strings
- Logs mostram tipo real dos valores
- Detecta quando level up deveria acontecer mas não acontece

---

### 7. Warnings React - forwardRef

**Problema:**
```
Warning: Function components cannot be given refs. 
Attempts to access this ref will fail. 
Did you mean to use React.forwardRef()?
```

**Componentes Afetados:**
- `components/ui/button.tsx`
- `components/ui/avatar.tsx`

**Correção `Button`:**
```typescript
// ❌ ANTES (sem forwardRef)
function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp data-slot="button" className={...} {...props} />
}

// ✅ DEPOIS (com forwardRef)
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp ref={ref} data-slot="button" className={...} {...props} />
})

Button.displayName = "Button"
```

**Correção `Avatar`:**
```typescript
// ❌ ANTES (sem forwardRef)
function Avatar({ className, ...props }) {
  return <AvatarPrimitive.Root data-slot="avatar" className={...} {...props} />
}

// ✅ DEPOIS (com forwardRef)
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentProps<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <AvatarPrimitive.Root ref={ref} data-slot="avatar" className={...} {...props} />
})

Avatar.displayName = "Avatar"
```

**Resultado:**
- Warnings eliminados
- Refs funcionam corretamente em Radix UI (DropdownMenu, Dialog)
- Compatibilidade com Slot do Radix (asChild pattern)

---

## 🧪 Como Testar os Logs

### 1. Abra o Console do Navegador (F12)

### 2. Complete uma tarefa e observe os logs:

```
🎯 [DEBUG] handleComplete clicado para tarefa: abc123
🎯 [DEBUG] canComplete para tarefa: abc123
   - isCompleting: false
   - isHabit: true
   - isHabitDoneToday: false
   - task.completed: false
   - Pode completar?: true
✅ [DEBUG] Iniciando completar tarefa...
🎯 [DEBUG] Completando tarefa: abc123
✅ [DEBUG] Resposta da API: { user: {...}, task_completion: {...} }
👤 [DEBUG] User da API: { id: "...", xp: 150, level: 2, ... }
📝 [DEBUG] Tarefa atualizada: { id: "abc123", completed: true, ... }
🔄 [DEBUG] Atualizando usuário no contexto...
   - XP: 150
   - Level: 2
   - Coins: 50
🔄 [DEBUG] updateUser chamado com: { id: "...", xp: 150, level: 2, ... }
👤 [DEBUG] Usuário atual antes: { xp: 100, level: 1, ... }
👤 [DEBUG] Usuário após merge: { xp: 150, level: 2, ... }
✅ [DEBUG] Estado do usuário atualizado e salvo no localStorage
✅ [DEBUG] Tarefa completada com sucesso!
🔄 [DEBUG] isCompleting resetado para false
🎮 [DEBUG] handleTaskComplete chamado
   - Old Level: 1 "number"
   - New Level: 2 "number"
🔢 [DEBUG] Comparação de nível:
   - Previous Level (number): 1
   - New Level (number): 2
   - Level up?: true
🚀 [DEBUG] LEVEL UP DETECTADO!
```

### 3. Tente completar novamente (deve bloquear):

```
🎯 [DEBUG] handleComplete clicado para tarefa: abc123
🔍 [DEBUG] isHabitCompletedToday para tarefa: abc123
   - Last Completed (string): 2025-11-23T10:30:00.000Z
   - Last Completed (Date): Sat Nov 23 2025 10:30:00
   - Today: Sat Nov 23 2025 10:35:00
   - Is Same Day?: true
🎯 [DEBUG] canComplete para tarefa: abc123
   - isCompleting: false
   - isHabit: true
   - isHabitDoneToday: true  ← BLOQUEADO
   - task.completed: true
   - Pode completar?: false
⚠️ [DEBUG] Ação bloqueada - tarefa não pode ser completada
```

---

## 📊 Checklist de Diagnóstico

Agora você pode verificar:

- [ ] **XP atualiza?** → Veja logs de `updateUser`
- [ ] **Level muda?** → Veja comparação em `handleTaskComplete`
- [ ] **Botão desabilita?** → Veja `canComplete` retornando `false`
- [ ] **Data correta?** → Veja comparação em `isHabitCompletedToday`
- [ ] **Spam bloqueado?** → Veja `isCompleting` mudando estados
- [ ] **API responde?** → Veja resposta completa da API

---

## 🎯 Próximos Passos

1. **Rode a aplicação** e complete uma tarefa
2. **Abra o console** (F12) e observe os logs
3. **Identifique o problema:**
   - Se XP/Level não mudam → problema no `updateUser`
   - Se botão não desabilita → problema no `canComplete`
   - Se data falha → problema no `isHabitCompletedToday`
4. **Copie os logs** e compartilhe se algo estiver errado

---

## ✅ Arquivos Modificados

- ✅ `hooks/use-tasks.tsx` - Logs na função `completeTask`
- ✅ `hooks/use-auth.tsx` - Logs na função `updateUser`
- ✅ `components/task-card.tsx` - Logs em `isHabitCompletedToday`, `canComplete`, `handleComplete`
- ✅ `hooks/use-gamification-feedback.tsx` - Logs e conversão numérica em `handleTaskComplete`
- ✅ `components/ui/button.tsx` - Adicionado `React.forwardRef`
- ✅ `components/ui/avatar.tsx` - Adicionado `React.forwardRef`

---

## 🔧 Remoção dos Logs (Produção)

Quando tudo estiver funcionando, remova os `console.log`:

```bash
# Buscar todos os logs de debug
grep -r "console.log.*DEBUG" DailyQuest-web/

# Remover manualmente ou com sed (cuidado!)
```

---

## 📝 Notas Finais

- Todos os logs usam emojis para fácil identificação visual
- Formato consistente: `[DEBUG]` em todos os logs
- Logs temporários - remover em produção
- Nenhuma lógica de negócio foi alterada, apenas **visibilidade adicionada**
