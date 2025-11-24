# 🚀 DailyQuest - Comandos Rápidos

## Setup Inicial

```bash
# Clone o repositório (se ainda não fez)
git clone <repo-url>

# Instalar dependências do frontend
cd DailyQuest-web
pnpm install

# Configurar variáveis de ambiente (opcional)
cp .env.example .env.local
```

## Iniciar Aplicação Completa

### Opção 1: Com Docker Compose (Recomendado)

```bash
# No diretório DailyQuest-web
docker compose up -d

# Logs
docker compose logs -f

# Parar
docker compose down
```

### Opção 2: Serviços Separados

```bash
# Terminal 1 - Auth Service
cd DailyQuest-auth
docker compose up

# Terminal 2 - Main API
cd DailyQuest-api
docker compose up

# Terminal 3 - Frontend (dev mode)
cd DailyQuest-web
pnpm dev
```

## Desenvolvimento

```bash
# Modo desenvolvimento (hot reload)
pnpm dev

# Build para produção
pnpm build

# Rodar build de produção
pnpm start

# Linting
pnpm lint

# Type checking
pnpm tsc --noEmit
```

## Testes

```bash
# Rodar testes (se configurado)
pnpm test

# Testes em watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## Docker

```bash
# Build da imagem
docker build -t dailyquest-web .

# Rodar container
docker run -p 3000:3000 dailyquest-web

# Ver logs
docker logs -f <container-id>

# Limpar containers e volumes
docker compose down -v
```

## Banco de Dados (API Backend)

```bash
# Acessar PostgreSQL (se usando Docker)
docker exec -it dailyquest-api-db psql -U postgres -d dailyquest

# Rodar migrations (no container da API)
docker exec -it dailyquest-api python -m alembic upgrade head

# Seed data (popular com dados iniciais)
docker exec -it dailyquest-api python -m src.seed
```

## Utilitários

```bash
# Limpar node_modules e reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Limpar cache do Next.js
rm -rf .next

# Ver variáveis de ambiente
pnpm env

# Adicionar nova dependência
pnpm add <package>
pnpm add -D <package>  # devDependency
```

## Troubleshooting

### Frontend não conecta ao backend

```bash
# Verificar se APIs estão rodando
curl http://localhost:8080/docs  # Auth Service
curl http://localhost:8000/docs  # Main API

# Verificar portas em uso
lsof -i :3000  # Frontend
lsof -i :8000  # Main API
lsof -i :8080  # Auth Service
```

### Erro de CORS

```bash
# No backend, verifique configuração CORS
# Em DailyQuest-api/src/main.py deve ter:
# app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"])
```

### Token não salvando

```bash
# Limpar localStorage no navegador
# DevTools (F12) → Console:
localStorage.clear()
```

### Reinstalar dependências

```bash
# Frontend
cd DailyQuest-web
rm -rf node_modules pnpm-lock.yaml .next
pnpm install

# Backend (Python)
cd DailyQuest-api
docker compose down -v
docker compose up --build
```

## Atalhos de Desenvolvimento

```bash
# Alias úteis (adicione ao ~/.bashrc ou ~/.zshrc)
alias dq-auth="cd DailyQuest-auth && docker compose up"
alias dq-api="cd DailyQuest-api && docker compose up"
alias dq-web="cd DailyQuest-web && pnpm dev"
alias dq-all="docker compose up -d"
alias dq-logs="docker compose logs -f"
alias dq-down="docker compose down"
```

## VS Code

### Extensões Recomendadas
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Settings.json
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Git Workflow

```bash
# Branch para feature
git checkout -b feature/nova-feature

# Commit changes
git add .
git commit -m "feat: adiciona nova feature"

# Push
git push origin feature/nova-feature

# Merge to main
git checkout main
git merge feature/nova-feature
git push origin main
```

## Produção

```bash
# Build otimizado
pnpm build

# Rodar em produção
pnpm start

# Com PM2 (process manager)
pnpm install -g pm2
pm2 start "pnpm start" --name dailyquest-web
pm2 logs dailyquest-web
pm2 restart dailyquest-web
pm2 stop dailyquest-web
```

## Backup e Restore

```bash
# Backup do banco (PostgreSQL)
docker exec dailyquest-api-db pg_dump -U postgres dailyquest > backup.sql

# Restore
docker exec -i dailyquest-api-db psql -U postgres dailyquest < backup.sql
```

## Monitoramento

```bash
# Ver uso de recursos (Docker)
docker stats

# Logs em tempo real
docker compose logs -f --tail=100

# Health check
curl http://localhost:3000/api/health
curl http://localhost:8000/health
```

## Variáveis de Ambiente

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_AUTH_URL=http://localhost:8080

# Backend API (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/dailyquest
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000
```

---

## 🔗 URLs Úteis

- Frontend: http://localhost:3000
- Main API Docs: http://localhost:8000/docs
- Auth Service Docs: http://localhost:8080/docs
- PostgreSQL: localhost:5432

---

## 📚 Documentação

- [Frontend Implementation](./FRONTEND_IMPLEMENTATION.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [API Implementation Guide](./API_IMPLEMENTATION_GUIDE.md)
- [Auth Integration](./AUTH_INTEGRATION.md)

---

**Tip**: Adicione este arquivo aos seus favoritos para acesso rápido! 🌟
