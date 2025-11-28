# DailyQuest Frontend

Frontend Next.js 14 com React 19, TypeScript e TailwindCSS.

## Tecnologias

- Next.js 14, React 19, TypeScript
- TailwindCSS 4, Radix UI, shadcn/ui
- React Hook Form + Zod

## Usuários de Teste

| Usuário | Email | Senha |
|---------|-------|-------|
| `testuser` | test@example.com | `testpass123` |
| `demo` | demo@dailyquest.com | `demo123` |

## Quick Start

```bash
# Com Docker (recomendado)
docker compose up --build

# Sem Docker
pnpm install
cp .env.local.example .env.local
pnpm dev
```

Acesse: http://localhost:3000

## Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_AUTH_URL=http://localhost:8001
NODE_ENV=development
```

## Scripts

```bash
pnpm dev       # Desenvolvimento
pnpm build     # Build produção
pnpm start     # Servidor produção
pnpm lint      # Linter
```

## Estrutura

```
app/           # App Router Next.js
components/    # Componentes React (shadcn/ui)
lib/           # Serviços API, utils, tipos
hooks/         # Custom hooks
public/        # Arquivos estáticos
```

## API Services

```typescript
import { taskService, authService } from '@/lib/api-service';

await authService.login({ username, password });
await taskService.getTasks();
await taskService.completeTask(taskId);
```

## Docker

```bash
docker compose up -d        # Subir
docker compose logs -f      # Logs
docker compose down         # Parar
```
