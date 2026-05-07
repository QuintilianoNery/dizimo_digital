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

#### Acesso administrativo

Não há login administrativo padrão fixo neste projeto.

O acesso admin funciona assim:

1. Primeiro acesso: criar a conta em `/admin/setup` (nome, e-mail e senha com mínimo de 8 caracteres).
2. Depois disso: entrar em `/admin/login` com o e-mail e senha cadastrados no setup.

emailLogin	adm@adm.com
senha	adm123456

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

### 2.2) Usar banco local via Docker (recomendado)

Se você não tiver PostgreSQL instalado localmente, pode subir um contêiner com o banco com o comando:

```bash
npm run db:up
# aguarde o banco ficar pronto
npm run db:ready
```

Há um atalho que sobe o container, aguarda e executa geração/migração/seed:

```bash
npm run db:init
```

Comando para acessar o prisma studio
```bash
npx prisma studio
```


Os valores do banco (usuário/senha/db) foram sincronizados com `.env.example` (`postgres:postgres` e `dizimo_digital`).

**Comandos rápidos**

```bash
# Iniciar frontend + API (como antes)
npm run dev

# Parar o container DB
npm run db:down

# Se precisar recriar o DB (leva a migrações/seed)
npm run db:init
```

Adicionais:

```bash
# Reiniciar apenas o container do banco
npm run db:restart

# Reiniciar a aplicação (front + API)
npm run app:restart
```


### 2.1) Autenticar Vercel CLI (primeira vez)

Como a API local usa `vercel dev`, faça login uma vez:

```bash
npx vercel login
```

### 3) Banco de dados

```bash
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
```

### 4) Rodar localmente

Frontend + API serverless (recomendado):

```bash
npm run dev
```

Isso inicia automaticamente:

- API serverless em `http://localhost:3000`
- Frontend Vite em `http://localhost:5173`

Comandos úteis separados:

```bash
npm run dev:api   # sobe apenas API
npm run dev:web   # sobe apenas frontend
```

## Deploy (Vercel)

Com `DATABASE_URL` e `JWT_SECRET` configurados no projeto Vercel:

```bash
vercel deploy 
```

## Observações

- O browser **não acessa banco diretamente**; apenas via API.
- Endpoints de exportação Excel/PDF estão como scaffold (TODO explícito nas telas).
