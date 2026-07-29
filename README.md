# YuniExpress - Marketplace Internacional em Meticais

O seu marketplace internacional favorito em Mocambique. Compre produtos do mundo inteiro pagando em Meticais (MZN).

## Visao Geral

YuniExpress e um marketplace que permite aos clientes comprar produtos internacionais da AliExpress pagando em Meticais, com sincronizacao automatica de catalogo, conversao de precos e pagamentos locais via PayGo (M-Pesa, e-Mola, Mkesh).

## Stack Tecnologico

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes, Prisma 7, PostgreSQL
- **Auth**: NextAuth.js v5 (Google + Credentials)
- **Pagamentos**: PayGo (M-Pesa, e-Mola, Mkesh)
- **Notificacoes**: OneSignal Push Notifications
- **Estado**: Zustand (carrinho + lista de desejos)
- **PWA**: Service Worker, Web Manifest
- **Integracao**: AliExpress Affiliate API

## Funcionalidades

### Para Clientes
- Pesquisa inteligente de produtos com filtros
- Categorias organizadas
- Produtos em destaque
- Carrinho de compras (persistente)
- Lista de desejos
- Login/Registo (email + Google)
- Historico de encomendas
- Rastreamento de encomendas
- Avaliacoes de produtos
- Cupoes e promocoes
- Notificacoes push (PWA)

### Sistema Automatico
- Sincronizacao de produtos a cada 30 minutos
- Conversao automatica de precos USD → MZN
- Margem de lucro configuravel
- Atualizacao de stock
- Tracking de envio

### Painel Administrativo
- Dashboard com estatisticas
- Aprovacao de produtos
- Gestao de precos e margens
- Gestao de encomendas
- Gestao de banners
- Configuracoes gerais

## Instalacao

### Pre-requisitos
- Node.js 20+
- PostgreSQL 15+
- pnpm

### Setup

```bash
# Clonar o repositorio
git clone <repo-url>
cd yuniexpress

# Instalar dependencias
pnpm install

# Copiar ficheiro de ambiente
cp .env.example .env

# Configurar as variaveis de ambiente no .env

# Gerar Prisma Client
npx prisma generate

# Executar migracoes
npx prisma migrate dev

# Iniciar em desenvolvimento
pnpm dev
```

### Variaveis de Ambiente

| Variavel | Descricao |
|----------|-----------|
| `DATABASE_URL` | URL de conexao PostgreSQL |
| `AUTH_SECRET` | Secret para NextAuth |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret |
| `ALIEXPRESS_APP_KEY` | Chave da app AliExpress |
| `ALIEXPRESS_APP_SECRET` | Secret da app AliExpress |
| `ALIEXPRESS_ACCESS_TOKEN` | Token de acesso AliExpress |
| `ALIEXPRESS_TRACKING_ID` | ID de tracking de afiliado |
| `PAYGO_API_KEY` | Chave API PayGo |
| `PAYGO_API_SECRET` | Secret API PayGo |
| `PAYGO_MERCHANT_ID` | ID do comerciante PayGo |
| `NEXT_PUBLIC_ONESIGNAL_APP_ID` | App ID OneSignal |
| `ONESIGNAL_REST_API_KEY` | REST API Key OneSignal |
| `EXCHANGE_RATE_API_KEY` | Chave da API de cambio |
| `DEFAULT_MARGIN_PERCENT` | Margem de lucro padrao (%) |
| `CRON_SECRET` | Secret para proteger endpoints cron |

## Estrutura do Projeto

```
yuniexpress/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── OneSignalSDKWorker.js  # OneSignal service worker
│   └── icons/                 # Icones PWA
├── src/
│   ├── app/
│   │   ├── (shop)/           # Paginas da loja
│   │   │   ├── page.tsx      # Homepage
│   │   │   ├── product/      # Detalhe do produto
│   │   │   ├── cart/         # Carrinho
│   │   │   ├── checkout/     # Checkout
│   │   │   ├── search/       # Pesquisa
│   │   │   ├── wishlist/     # Lista de desejos
│   │   │   └── account/      # Area do cliente
│   │   ├── (admin)/          # Painel admin
│   │   │   └── admin/
│   │   │       ├── page.tsx       # Dashboard
│   │   │       ├── products/      # Gestao produtos
│   │   │       ├── orders/        # Gestao encomendas
│   │   │       ├── banners/       # Gestao banners
│   │   │       └── settings/      # Configuracoes
│   │   ├── (auth)/           # Paginas de auth
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── api/              # API Routes
│   │       ├── auth/         # Auth endpoints
│   │       ├── products/     # Produtos
│   │       ├── cart/         # Carrinho
│   │       ├── orders/       # Encomendas
│   │       ├── payments/     # Pagamentos PayGo
│   │       ├── sync/         # Sincronizacao
│   │       └── admin/        # Admin APIs
│   ├── components/
│   │   ├── ui/              # Componentes base
│   │   ├── layout/          # Header, Footer
│   │   ├── product/         # ProductCard
│   │   └── home/            # Banner, Categories
│   ├── lib/
│   │   ├── db.ts            # Prisma client
│   │   ├── auth.ts          # NextAuth config
│   │   └── services/
│   │       ├── aliexpress.ts # API AliExpress
│   │       ├── pricing.ts    # Conversao de precos
│   │       ├── paygo.ts      # Gateway de pagamento
│   │       └── onesignal.ts  # Push notifications
│   ├── store/
│   │   ├── cart.ts          # Zustand cart store
│   │   └── wishlist.ts      # Zustand wishlist store
│   └── types/
│       └── index.ts         # TypeScript types
├── vercel.json              # Cron jobs config
├── next.config.ts           # Next.js config
└── package.json
```

## Fluxo de Precos

```
Preco USD (AliExpress)
       ↓
Taxa de Cambio (USD → MZN) [automatica]
       ↓
+ Margem de Lucro (configuravel, padrao 25%)
       ↓
Preco Final em Meticais (arredondado)
```

O cliente ve APENAS o preco final em Meticais. A taxa de cambio e margem sao completamente ocultas.

## Sincronizacao Automatica

O cron job executa a cada 30 minutos (configuravel):
1. Atualiza taxa de cambio USD/MZN
2. Sincroniza novos produtos da AliExpress
3. Atualiza precos existentes
4. Recalcula precos em MZN
5. Atualiza stock

Endpoint: `POST /api/sync?secret=CRON_SECRET`

## Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

O `vercel.json` ja configura os cron jobs automaticamente.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN npx prisma generate
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## Criar Administrador

Apos a primeira instalacao, crie um utilizador admin:

```bash
npx prisma studio
```

Altere o `role` do primeiro utilizador para `SUPER_ADMIN`.

Ou via SQL:
```sql
UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'admin@yuniexpress.co.mz';
```

## Evolucao Futura

- [ ] App Android/iOS (React Native)
- [ ] Sistema de Cashback
- [ ] Programa de Afiliados
- [ ] Sistema de Pontos
- [ ] Programa de Vendedores
- [ ] Integracao com transportadoras
- [ ] Chat cliente-suporte
- [ ] IA para recomendar produtos

## Licenca

Propriedade privada. Todos os direitos reservados.
