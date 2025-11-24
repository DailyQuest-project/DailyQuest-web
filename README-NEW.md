# 🎮 DailyQuest - Frontend

> Aplicação de gerenciamento de hábitos gamificada construída com Next.js, React e TypeScript

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

## ✨ Funcionalidades

### 🔐 Autenticação
- ✅ Login com JWT (Bearer Token)
- ✅ Registro de novos usuários
- ✅ Proteção de rotas privadas
- ✅ Logout com limpeza de sessão

### 📝 Gerenciamento de Tarefas
- ✅ **Hábitos**: Tarefas recorrentes
  - Diário (todos os dias)
  - N vezes por semana (1-7)
  - Dias específicos (Segunda-Domingo)
- ✅ **Afazeres**: Tarefas únicas com deadline
- ✅ Níveis de dificuldade (Fácil, Médio, Difícil)
- ✅ Completar, editar e deletar tarefas

### 🎯 Gamificação
- ✅ Sistema de XP e níveis
- ✅ Moedas virtuais
- ✅ Streak de hábitos (sequência de dias)
- ✅ Modal de Level Up com animações
- ✅ Notificações de progresso
- ✅ Dashboard com estatísticas

### 🎨 Interface
- ✅ Design moderno e responsivo
- ✅ Tema claro/escuro
- ✅ Animações suaves
- ✅ Feedback visual imediato
- ✅ Toast notifications

---

## 🚀 Começando

### Pré-requisitos

```bash
Node.js >= 18.x
pnpm >= 8.x (ou npm/yarn)
```

### Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd DailyQuest-web

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local
```

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_AUTH_URL=http://localhost:8080
```

### Executar em Desenvolvimento

```bash
# Certifique-se de que os backends estão rodando:
# - Auth Service em http://localhost:8080
# - Main API em http://localhost:8000

# Inicie o frontend
pnpm dev
```

Acesse: **http://localhost:3000**

---

## 🏗️ Arquitetura

### Estrutura de Pastas

```
DailyQuest-web/
├── app/                      # Pages (App Router)
│   ├── login/               # Página de login
│   ├── register/            # Página de cadastro
│   ├── dashboard/           # Dashboard principal
│   └── layout.tsx           # Layout global (AuthProvider)
├── components/              # Componentes React
│   ├── ui/                  # Componentes base (shadcn/ui)
│   ├── task-card.tsx        # Card de tarefa (polimórfico)
│   ├── create-task-modal.tsx# Modal de criação
│   ├── level-up-modal.tsx   # Modal de level up
│   ├── xp-bar.tsx           # Barra de XP
│   └── ...
├── hooks/                   # Custom Hooks
│   ├── use-auth.tsx         # Hook de autenticação
│   ├── use-tasks.tsx        # Hook de tarefas (CRUD)
│   ├── use-gamification-feedback.tsx
│   └── use-toast.ts
├── lib/                     # Utilitários
│   ├── api-client.ts        # Cliente HTTP (fetch wrapper)
│   ├── api-service-complete.ts  # Serviços da API
│   ├── api-types-complete.ts    # Tipos TypeScript
│   └── auth.ts              # Funções de autenticação
└── public/                  # Assets estáticos
```

### Fluxo de Dados

```
User Action (UI) 
    ↓
Custom Hook (use-auth, use-tasks)
    ↓
API Service (api-service-complete.ts)
    ↓
API Client (api-client.ts) → Backend API
    ↓
Response → Update State → Render UI
```

---

## 🔌 Integração com Backend

### Endpoints Utilizados

#### Auth Service (localhost:8080)
- `POST /login` - Login com form-data

#### Main API (localhost:8000/api/v1)
- `POST /users/` - Registro
- `GET /users/me` - Dados do usuário atual
- `GET /tasks/` - Listar tarefas
- `POST /tasks/habits/` - Criar hábito
- `POST /tasks/todos/` - Criar afazer
- `PUT /tasks/habits/{id}` - Editar hábito
- `PUT /tasks/todos/{id}` - Editar afazer
- `DELETE /tasks/habits/{id}` - Deletar hábito
- `DELETE /tasks/todos/{id}` - Deletar afazer
- `POST /tasks/{id}/complete` - Completar tarefa

### Autenticação

Todas as requisições à Main API incluem o header:
```
Authorization: Bearer <token>
```

O token é armazenado no `localStorage` e injetado automaticamente pelo `api-client.ts`.

---

## 🧪 Testes

Para guia completo de testes, veja: [TESTING_GUIDE.md](./TESTING_GUIDE.md)

### Cenários Principais

1. ✅ Criar conta e fazer login
2. ✅ Criar hábito com diferentes frequências
3. ✅ Criar afazer com deadline
4. ✅ Completar tarefa e ganhar XP
5. ✅ Level up automático
6. ✅ Streak de hábitos
7. ✅ Filtrar por tipo de tarefa
8. ✅ Editar e deletar tarefas

### Comandos

```bash
# Rodar testes (se configurado)
pnpm test

# Type checking
pnpm tsc --noEmit

# Linting
pnpm lint
```

---

## 📦 Build e Deploy

### Build de Produção

```bash
# Build otimizado
pnpm build

# Testar build localmente
pnpm start
```

### Docker

```bash
# Build da imagem
docker build -t dailyquest-web .

# Rodar container
docker run -p 3000:3000 dailyquest-web
```

### Variáveis para Produção

```env
NEXT_PUBLIC_API_URL=https://api.seudominio.com/api/v1
NEXT_PUBLIC_AUTH_URL=https://auth.seudominio.com
```

---

## 🎨 Design System

### Cores (Tailwind)

```css
--primary: Azul/Roxo principal
--secondary: Cor secundária
--accent: Cor de destaque
--destructive: Vermelho para ações destrutivas
--muted: Cinza para texto secundário
```

### Componentes Base

Usando **shadcn/ui**:
- Button, Card, Input, Badge, Dialog, Toast
- Tabs, DropdownMenu, AlertDialog
- Progress, Avatar, Label

---

## 📝 Validações

### Frontend (antes de enviar ao backend)

- ✅ Título obrigatório
- ✅ Email válido
- ✅ Senha mínima de 6 caracteres
- ✅ Meta semanal entre 1-7
- ✅ Dias específicos: mínimo 1 selecionado
- ✅ Deadline não pode ser no passado
- ✅ Dificuldade e frequência são Enums validados

---

## 🐛 Troubleshooting

### Problema: Frontend não conecta ao backend

**Solução**:
```bash
# Verificar se backends estão rodando
curl http://localhost:8080/docs
curl http://localhost:8000/docs
```

### Problema: Token não salvando

**Solução**:
- Não use modo anônimo/privado
- Verifique se localStorage está habilitado
- Limpe cache: `localStorage.clear()`

### Problema: XP não atualiza

**Solução**:
- Verifique se o endpoint `/tasks/{id}/complete` retorna `user` no response
- Abra DevTools Console para ver erros

Para mais soluções, veja: [QUICK_COMMANDS.md](./QUICK_COMMANDS.md)

---

## 📚 Documentação Adicional

- [FRONTEND_IMPLEMENTATION.md](./FRONTEND_IMPLEMENTATION.md) - Detalhes da implementação
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Guia de testes completo
- [QUICK_COMMANDS.md](./QUICK_COMMANDS.md) - Comandos úteis
- [API_IMPLEMENTATION_GUIDE.md](./API_IMPLEMENTATION_GUIDE.md) - Documentação da API

---

## 🛠️ Stack Completa

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5.x
- **Styling**: TailwindCSS 4
- **Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **HTTP Client**: Fetch API (wrapper customizado)

### Backend (Separado)
- **Auth Service**: FastAPI (Python)
- **Main API**: FastAPI (Python)
- **Database**: PostgreSQL
- **Authentication**: JWT (Bearer Token)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é licenciado sob a MIT License.

---

## 👥 Autores

- **Marcos** - Desenvolvimento Frontend

---

## 🎯 Roadmap

### ✅ Implementado
- [x] Sistema de autenticação completo
- [x] CRUD de hábitos e afazeres
- [x] Sistema de gamificação (XP, levels, streak)
- [x] Dashboard responsivo
- [x] Validações de formulário
- [x] Feedback visual (toasts, modal de level up)
- [x] Tema claro/escuro

### 🚧 Em Progresso
- [ ] Sistema de Tags
- [ ] Página de Conquistas
- [ ] Gráficos de progresso (Dashboard Stats)

### 📅 Planejado
- [ ] Sistema de recompensas (loja de moedas)
- [ ] Social features (amigos, leaderboard)
- [ ] Notificações push
- [ ] App mobile (React Native)
- [ ] Integração com calendário

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Abra uma [Issue no GitHub](./issues)
2. Consulte a documentação
3. Entre em contato via email

---

**Feito com ❤️ e ☕ por Marcos**
