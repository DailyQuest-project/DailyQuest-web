# DailyQuest Frontend

Frontend do aplicativo DailyQuest construído com Next.js 14, React 19, TypeScript e TailwindCSS.

## 🚀 Tecnologias

- **Next.js 14** - Framework React
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **TailwindCSS 4** - Estilização
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

## 📋 Pré-requisitos

- Node.js 18+
- pnpm (recomendado) ou npm
- Docker e Docker Compose (para desenvolvimento com containers)

## 🔧 Instalação

### Desenvolvimento Local (sem Docker)

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local

# Editar .env.local com suas configurações
nano .env.local

# Rodar em modo desenvolvimento
pnpm dev
```

Acesse: http://localhost:3000

### Desenvolvimento com Docker

```bash
# Na raiz do workspace (/home/marcos/Documentos)
./dailyquest.sh start

# Ou usando docker-compose diretamente
docker-compose up -d
```

## 🌐 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# URL da API Backend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# URL do serviço de autenticação (se aplicável)
NEXT_PUBLIC_AUTH_URL=http://localhost:8001

# Ambiente
NODE_ENV=development
```

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Iniciar servidor de produção
pnpm start

# Linter
pnpm lint
```

## 🏗️ Estrutura do Projeto

```
DailyQuest-web/
├── app/                    # App Router do Next.js
│   ├── page.tsx           # Página principal
│   ├── layout.tsx         # Layout root
│   ├── globals.css        # Estilos globais
│   ├── login/             # Página de login
│   └── register/          # Página de registro
├── components/            # Componentes React
│   ├── ui/               # Componentes UI base (shadcn/ui)
│   ├── create-habit-modal.tsx
│   ├── habit-filters.tsx
│   ├── user-profile-modal.tsx
│   ├── xp-bar.tsx
│   └── ...
├── lib/                   # Utilitários e configurações
│   ├── api-client.ts     # Cliente HTTP
│   ├── api-service.ts    # Serviços da API
│   ├── api-types.ts      # Tipos TypeScript
│   └── utils.ts          # Funções utilitárias
├── hooks/                 # React Hooks customizados
│   ├── use-mobile.ts
│   └── use-toast.ts
├── public/               # Arquivos estáticos
└── styles/              # Estilos adicionais
```

## 🔌 Integração com Backend

O frontend se comunica com o backend através de uma camada de serviços:

```typescript
import { taskService, authService } from '@/lib/api-service';

// Exemplo: Login
const { data, error } = await authService.login({
  username: 'usuario',
  password: 'senha'
});

// Exemplo: Buscar tarefas
const { data: tasks } = await taskService.getTasks();

// Exemplo: Completar tarefa
const { data: completion } = await taskService.completeTask(taskId);
```

### Endpoints Disponíveis

- `authService.login()` - Login de usuário
- `authService.register()` - Registro de usuário
- `authService.getCurrentUser()` - Dados do usuário atual
- `taskService.getTasks()` - Listar tarefas
- `taskService.createTask()` - Criar tarefa
- `taskService.completeTask()` - Completar tarefa
- `dashboardService.getStats()` - Estatísticas do dashboard
- `achievementService.getAchievements()` - Conquistas

## 🐳 Docker

### Dockerfile

O projeto inclui um Dockerfile otimizado com build em múltiplos estágios para produção.

### Docker Compose

```bash
# Iniciar frontend isolado
docker-compose up -d

# Logs
docker-compose logs -f frontend

# Parar
docker-compose down
```

### Stack Completo

Para rodar o projeto completo (Frontend + Backend + Database):

```bash
cd /home/marcos/Documentos
./dailyquest.sh start
```

## 🎨 Componentes

O projeto usa componentes do **shadcn/ui** e **Radix UI**:

- Buttons, Cards, Dialogs
- Forms (com react-hook-form + zod)
- Tabs, Tooltips, Dropdowns
- Badges, Avatars, Progress
- E muito mais...

Todos os componentes estão em `components/ui/` e podem ser customizados via TailwindCSS.

## 🔐 Autenticação

O sistema de autenticação usa tokens JWT:

```typescript
import { setAuthToken, getAuthToken } from '@/lib/api-client';

// Após login bem-sucedido
const { data } = await authService.login(credentials);
if (data?.access_token) {
  setAuthToken(data.access_token);
}

// Requisições autenticadas são feitas automaticamente
const { data: user } = await authService.getCurrentUser();
```

## 🧪 Testes

```bash
# Em desenvolvimento
pnpm test

# Coverage
pnpm test:coverage
```

## 🚢 Deploy

### Build de Produção

```bash
pnpm build
pnpm start
```

### Docker Production

```bash
docker build -t dailyquest-web .
docker run -p 3000:3000 dailyquest-web
```

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📝 Notas de Desenvolvimento

### Hot Reload

O desenvolvimento local e Docker suportam hot reload automático.

### Linting e Formatação

```bash
# Rodar linter
pnpm lint

# Fix automático
pnpm lint --fix
```

### TypeScript

O projeto usa TypeScript com `strict: true`. Tipos são definidos em:
- `lib/api-types.ts` - Tipos da API
- Componentes possuem tipagem inline

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Faça suas alterações
3. Teste localmente
4. Commit com mensagens descritivas
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

## 🆘 Suporte

Para problemas ou dúvidas:
- Verifique os logs: `./dailyquest.sh logs frontend`
- Status dos serviços: `./dailyquest.sh status`
- Rebuild: `./dailyquest.sh rebuild frontend`
