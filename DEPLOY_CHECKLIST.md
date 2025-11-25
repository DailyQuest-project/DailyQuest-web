# 🚀 Checklist de Deploy - DailyQuest

**Status Geral:** ⚠️ QUASE PRONTO - Alguns ajustes necessários

---

## ✅ BACKEND (DailyQuest-api)

### ✅ O que está PRONTO:

1. **Testes** ✅
   - 115 testes passando (100%)
   - 88% de cobertura de código
   - Testes executam automaticamente com `docker compose up --build`

2. **Docker** ✅
   - Dockerfile configurado
   - docker-compose.yml completo
   - Multi-stage build preparado
   - Health checks configurados

3. **Banco de Dados** ✅
   - PostgreSQL configurado
   - Migrations prontas
   - Sistema de seeding funcionando
   - Seeding desabilitado em modo de teste

4. **Segurança** ✅
   - JWT implementado (HS512)
   - Hashing de senhas (bcrypt)
   - SECRET_KEY configurada
   - CORS configurado

5. **Estrutura** ✅
   - Arquitetura limpa (Router → Repository → Model)
   - Separação de responsabilidades
   - Tratamento de erros

### ⚠️ O que precisa AJUSTAR:

1. **Variáveis de Ambiente** ⚠️
   - [ ] Criar arquivo `.env.example` para documentação
   - [ ] Mudar SECRET_KEY em produção (atual está exposta)
   - [ ] Configurar variáveis para produção

2. **Logging** ⚠️
   - [ ] Substituir `print()` por `logging` para produção
   - [ ] Configurar níveis de log (INFO, WARNING, ERROR)
   - [ ] Adicionar logs estruturados

3. **CORS** ⚠️
   - [ ] Adicionar domínio de produção no `allow_origins`
   - [ ] Remover `allow_origins=["*"]` se existir

4. **Documentação** ⚠️
   - [ ] Melhorar README.md com instruções de deploy
   - [ ] Documentar variáveis de ambiente necessárias

---

## ✅ FRONTEND (DailyQuest-web)

### ✅ O que está PRONTO:

1. **Build** ✅
   - Build de produção funciona (`pnpm build`)
   - Next.js 14 com App Router
   - Standalone output configurado
   - TypeScript ignorando erros de build (temporário)

2. **Docker** ✅
   - Dockerfile básico criado
   - docker-compose.yml configurado
   - Variáveis de ambiente definidas

3. **Componentes** ✅
   - shadcn/ui integrado
   - Componentes UI prontos
   - React Hook Form + Zod

4. **Git** ✅
   - .gitignore corrigido (venv/ ignorado)
   - Estrutura organizada

### ⚠️ O que precisa AJUSTAR:

1. **Dockerfile de Produção** ⚠️
   - [ ] Atual está em modo `development`
   - [ ] Criar multi-stage build para produção
   - [ ] Otimizar imagem (reduzir tamanho)

2. **Variáveis de Ambiente** ⚠️
   - [ ] Criar `.env.example`
   - [ ] Configurar URLs de produção
   - [ ] Adicionar validação de env vars

3. **TypeScript** ⚠️
   - [ ] Corrigir erros de tipo
   - [ ] Remover `ignoreBuildErrors: true`
   - [ ] Adicionar validação estrita

4. **Testes** ❌
   - [ ] Implementar testes unitários
   - [ ] Implementar testes de integração
   - [ ] Corrigir imports do Selenium (selenium-tests/)

5. **Otimização** ⚠️
   - [ ] Configurar cache do Next.js
   - [ ] Otimizar imagens (atualmente desabilitado)
   - [ ] Configurar CDN para assets estáticos

---

## ⚠️ SERVIÇO DE AUTENTICAÇÃO (DailyQuest-auth)

### Status: NÃO VERIFICADO

- [ ] Verificar se está funcionando
- [ ] Validar integração com backend
- [ ] Conferir configuração de produção

---

## 🔒 SEGURANÇA

### ✅ Implementado:
- JWT com HS512
- Bcrypt para senhas
- CORS configurado
- Tokens com expiração

### ⚠️ CRÍTICO para Produção:
1. **SECRET_KEY** ⚠️
   ```bash
   # ATUAL (EXPOSTA):
   SECRET_KEY=7NDRuYThWQw2xrJam1EVO4Y4F2L6mZ6G
   
   # DEVE SER ALTERADA EM PRODUÇÃO!
   ```
   - [ ] Gerar nova SECRET_KEY forte
   - [ ] Usar variável de ambiente segura
   - [ ] Nunca commitar no git

2. **Senhas do Banco** ⚠️
   ```bash
   # ATUAL:
   POSTGRES_PASSWORD=dev123
   
   # Trocar para senha forte em produção!
   ```

3. **HTTPS** ⚠️
   - [ ] Configurar certificado SSL/TLS
   - [ ] Forçar HTTPS em produção
   - [ ] Configurar redirecionamento HTTP → HTTPS

4. **Rate Limiting** ❌
   - [ ] Implementar limite de requisições
   - [ ] Proteger endpoints de login
   - [ ] Prevenir brute force

---

## 🗄️ BANCO DE DADOS

### ✅ Pronto:
- PostgreSQL 14
- Migrations SQL
- Sistema de seed

### ⚠️ Para Produção:
- [ ] Configurar backup automático
- [ ] Implementar estratégia de restore
- [ ] Configurar replicação (opcional)
- [ ] Tuning de performance
- [ ] Configurar pool de conexões

---

## 📊 MONITORAMENTO

### ❌ Faltando:
- [ ] Logging estruturado (backend)
- [ ] Métricas de performance
- [ ] Health checks na aplicação
- [ ] Alertas de erro
- [ ] APM (Application Performance Monitoring)
- [ ] Sentry ou similar para erros

---

## 🚀 DEPLOYMENT OPTIONS

### Opção 1: VPS (DigitalOcean, Linode, AWS EC2)
```bash
# Recomendado para controle total
1. Provisionar servidor (2GB RAM mínimo)
2. Instalar Docker + Docker Compose
3. Configurar Nginx como reverse proxy
4. Configurar SSL com Let's Encrypt
5. Deploy via docker-compose
```

### Opção 2: Vercel (Frontend) + Railway/Render (Backend)
```bash
# Frontend na Vercel
- Deploy automático do Next.js
- CDN global incluído
- Domínio customizado fácil

# Backend no Railway/Render
- Deploy via Docker
- Banco PostgreSQL incluído
- SSL automático
```

### Opção 3: AWS (Produção Escalável)
```bash
- Frontend: Amplify ou S3 + CloudFront
- Backend: ECS ou Elastic Beanstalk
- Banco: RDS PostgreSQL
- Load Balancer + Auto Scaling
```

---

## 📝 PASSOS IMEDIATOS PARA DEPLOY

### 1️⃣ URGENTE (Antes de qualquer deploy):

```bash
# 1. Gerar nova SECRET_KEY
cd DailyQuest-api
python -c "import secrets; print(secrets.token_urlsafe(32))"

# 2. Criar .env.production no backend
cat > .env.production << EOF
SECRET_KEY=<SUA_NOVA_KEY_AQUI>
JWT_ALGORITHM=HS512
DATABASE_URL=postgresql://usuario:senha_forte@db:5432/dailyquest_db
AUTH_SERVICE_URL=http://auth:8080
NODE_ENV=production
EOF

# 3. Criar .env.production no frontend
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://api.seudominio.com/api/v1
NEXT_PUBLIC_AUTH_URL=https://auth.seudominio.com
NODE_ENV=production
EOF
```

### 2️⃣ IMPORTANTE (Deploy seguro):

```bash
# 1. Atualizar CORS no backend
# Editar src/main.py e adicionar seu domínio
allow_origins=[
    "https://seudominio.com",
    "https://www.seudominio.com",
]

# 2. Criar Dockerfile de produção para frontend
# Ver exemplo abaixo

# 3. Configurar docker-compose de produção
# Separar dev e prod
```

### 3️⃣ RECOMENDADO (Melhorias):

```bash
# 1. Implementar logging
# Substituir prints por logging no backend

# 2. Adicionar health checks
# /health endpoint no backend

# 3. Configurar CI/CD
# GitHub Actions para testes automáticos
```

---

## 📦 EXEMPLO: Dockerfile de Produção (Frontend)

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

---

## ✅ CHECKLIST FINAL DE DEPLOY

### Antes de ir para produção:

- [ ] SECRET_KEY alterada
- [ ] Senhas do banco alteradas
- [ ] URLs de produção configuradas
- [ ] CORS com domínio de produção
- [ ] HTTPS configurado
- [ ] Backup do banco configurado
- [ ] Logging implementado
- [ ] Health checks funcionando
- [ ] Testes passando (backend)
- [ ] Build de produção funcionando (frontend)
- [ ] Dockerfile de produção otimizado
- [ ] Documentação atualizada
- [ ] Monitoramento configurado
- [ ] Rate limiting implementado
- [ ] Variáveis de ambiente documentadas

---

## 🎯 CONCLUSÃO

**O projeto está 80% pronto para deploy!**

### Prioridades:

1. **🔴 CRÍTICO (fazer AGORA):**
   - Trocar SECRET_KEY
   - Trocar senhas do banco
   - Configurar CORS para domínio de produção

2. **🟡 IMPORTANTE (fazer antes do deploy):**
   - Criar Dockerfile de produção do frontend
   - Implementar logging no backend
   - Adicionar .env.example

3. **🟢 RECOMENDADO (pode fazer depois):**
   - Implementar testes no frontend
   - Adicionar monitoramento
   - Configurar CI/CD

---

## 📞 Próximos Passos

1. Escolher plataforma de deploy
2. Aplicar correções críticas (SECRET_KEY, senhas)
3. Testar build de produção local
4. Deploy em ambiente de staging
5. Testes finais
6. Deploy em produção 🚀

**Quer que eu ajude com algum desses passos?**
