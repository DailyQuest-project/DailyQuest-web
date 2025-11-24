# Dockerfile para DailyQuest Frontend (Next.js)
# Versão simplificada para desenvolvimento
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat

# Definir diretório de trabalho
WORKDIR /app

# Habilitar corepack e instalar pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Copiar arquivos de dependências
COPY package.json ./

# Instalar dependências (sem lock file por enquanto)
RUN pnpm install

# Copiar o resto da aplicação
COPY . .

# Variáveis de ambiente
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

# Expor porta
EXPOSE 3000

# Comando para iniciar em modo desenvolvimento
CMD ["pnpm", "dev"]
