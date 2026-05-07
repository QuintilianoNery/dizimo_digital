# Dízimo Digital

Sistema para gestão de dízimo, ofertas e doações em três áreas separadas: **Administrativa**, **Paroquial** e **CEBs**.

## Rotas principais

- **Admin**: `/admin/login` (login exclusivo)
- **Paroquial + CEB**: `/login` (login compartilhado com fluxos distintos)

## Funcionalidades implementadas

### Área Administrativa
- Primeiro acesso com criação de senha do administrador (`/admin/setup`)
- Login por e-mail e senha
- CRUD de paróquias
- Reset de senha de paróquia
- Dashboard administrativo (scaffold)

### Área Paroquial
- Login por identificador da paróquia (código/e-mail) e senha
- Configuração de percentuais com versionamento (`configuracao_paroquia`)
- Geração de alertas para CEBs quando percentual é alterado
- CRUD de CEBs
- Reset de senha de CEB
- CRUD de pastorais/movimentos
- Dashboard com resumo e scaffold de relatórios/exportação

### Área CEB
- Login por paróquia + CEB + senha
- Alertas de alteração de percentual ao acessar dashboard
- CRUD de conselheiros comunitários
- CRUD de dizimistas
- CRUD de doações (com competência mês/ano padrão no período atual e edição manual)
- Dashboard com resumo e scaffold de exportação

## Autenticação e sessão

- Sessão em cookie HTTP-only (`dizimo_session`)
- Persistência após refresh (logout apenas explícito)
- Senhas com `bcryptjs`
- “Lembrar login” salva apenas identificadores (nunca senha):
  - Paroquial: identificador da paróquia
  - CEB: identificador da paróquia + CEB

## Stack

- Frontend: React + Vite + TypeScript + React Router
- API: Vercel Serverless Functions (`/api/*`)
- Banco: PostgreSQL + Prisma
- Validação: Zod

## Configuração local

### 1) Variáveis de ambiente

Crie `.env` com base em `.env.example`:

```bash
cp .env.example .env
```

### 2) Instalar dependências

```bash
npm install
```

### 3) Banco de dados

```bash
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
```

### 4) Rodar localmente

Frontend apenas:

```bash
npm run dev
```

Frontend + API serverless (recomendado para testar auth/API):

```bash
vercel dev
```

## Deploy (Vercel)

Com `DATABASE_URL` e `JWT_SECRET` configurados no projeto Vercel:

```bash
vercel deploy
```

## Observações

- O browser **não acessa banco diretamente**; apenas via API.
- Endpoints de exportação Excel/PDF estão como scaffold (TODO explícito nas telas).
