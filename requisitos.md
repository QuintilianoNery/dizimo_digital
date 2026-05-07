# Dízimo Digital

## 1. Objetivo

O Dízimo Digital é uma ferramenta para registrar dízimos, doações e ofertas das CEBs, consolidando de forma centralizada os totais repassados e doados para a paróquia e para as áreas administrativas.

## 2. Visão geral do sistema

- Área Administrativa
- Área Paroquial
- Área CEBs

## 3. Login e autenticação

### 3.1 Área Administrativa

- Tela exclusiva de login, separada das demais áreas.
- No primeiro acesso, o sistema solicita a criação da senha do administrador.
- Depois do primeiro acesso, o login passa a ser normal com login e senha.

### 3.2 Área Paroquial

- O usuário seleciona a paróquia por nome ou pelo código da paróquia.
- Existe campo de senha.
- Existe a opção lembrar dados de login, salvando apenas o identificador da paróquia e nunca a senha.

### 3.3 Área CEBs

- O usuário seleciona a paróquia por nome ou código.
- Em seguida seleciona a comunidade/CEB vinculada à paróquia.
- Existe campo de senha.
- Existe a opção lembrar dados de login, salvando apenas o identificador da paróquia e da CEB.

### 3.4 Rotas de login separadas

- Uma URL exclusiva para a Área Administrativa.
- Uma URL exclusiva para a Área Paroquial e CEBs.
- Ao atualizar a página, o usuário não vai ser deslogado; somente ao clicar em sair o logout deve acontecer.

## 4. Banco de dados recomendado

### 4.1 Recomendação inicial

- Banco recomendado: PostgreSQL, hospedado inicialmente em Vercel Postgres.
- Motivos: modelagem relacional adequada para vínculos 1:N, integração simples com o fluxo de deploy na Vercel, boa base para relatórios, filtros e dashboards, e facilidade para evoluir o projeto sem trocar o banco depois.
- Como o front será em React + Vite + TypeScript, o acesso ao banco deve acontecer por uma camada de API ou funções serverless. O navegador não deve acessar o banco diretamente.
- Alternativa viável, caso você queira autenticação e armazenamento integrados desde o início: Supabase Postgres.

### 4.2 Estratégia de chaves

- Cada tabela principal usa `id` como chave primária.
- Sugestão prática: `id` do tipo UUID ou ULID.
- Se for necessário expor um identificador não sequencial para integrações externas, usar um `public_id` ou `hash_publico` separado.
- Senhas devem usar bcrypt ou Argon2.
- Não usar bcrypt para chaves primárias.

## 5. Resumo de PK e FK por cadastro

| Cadastro | Chave primária | Chaves estrangeiras |
| --- | --- | --- |
| Administrador do sistema | `id` | nenhuma |
| Paróquia | `id` | `administrador_criou_id` -> `administrador.id` (opcional, para auditoria) |
| Configuração da paróquia | `id` | `paroquia_id` -> `paroquia.id` |
| CEB | `id` | `paroquia_id` -> `paroquia.id` |
| Pastorais e movimentos | `id` | nenhuma |
| Conselheiro comunitário | `id` | `ceb_id` -> `ceb.id`; `pastoral_movimento_id` -> `pastoral_movimento.id` (opcional) |
| Dizimista | `id` | `ceb_id` -> `ceb.id` |
| Doação | `id` | `ceb_id` -> `ceb.id`; `dizimista_id` -> `dizimista.id` (opcional) |
| Alerta de alteração de percentual | `id` | `paroquia_id` -> `paroquia.id`; `ceb_id` -> `ceb.id`; `configuracao_paroquia_id` -> `configuracao_paroquia.id` |

## 6. Cadastros e campos

### 6.1 Administrador do sistema

- `id` (PK)
- `nome`
- `email_login`
- `senha_hash`
- `status`
- `created_at`
- `updated_at`

### 6.2 Paróquia

- `id` (PK)
- `administrador_criou_id` (FK opcional)
- `codigo_paroquia` (único)
- `logo_url` ou `logo_path` (upload da logo da paróquia)
- `nome`
- `email`
- `telefone`
- `endereco`
- `fundacao`
- `cnpj`
- `pároco`
- `email_login_secretaria`
- `senha_hash`
- `status`
- `created_at`
- `updated_at`

Observação: o `email_login_secretaria` representa a conta principal admin da paróquia.
Observação: a logo da paróquia deve aparecer no canto superior esquerdo do menu lateral da área paroquial e também acima do formulário de login, antes dos campos de login e senha, quando a paróquia for selecionada ou quando as configurações de acesso forem salvas.

### 6.3 Configuração da paróquia

- `id` (PK)
- `paroquia_id` (FK)
- `percentual_repasse_dizimo_cebs`
- `percentual_repasse_oferta_cebs`
- `percentual_repasse_curia_diocesana`
- `percentual_repasse_diocese`
- `vigente_desde`
- `vigente_ate` (opcional)
- `ativa`
- `alterado_por_id` (opcional)
- `created_at`
- `updated_at`

Regra importante: quando a paróquia alterar percentuais, o sistema deve criar uma nova versão da configuração para preservar o histórico dos meses anteriores.

### 6.4 CEB

- `id` (PK)
- `paroquia_id` (FK)
- `codigo_ceb` (único)
- `nome`
- `email_login`
- `senha_hash`
- `telefone`
- `status`
- `created_at`
- `updated_at`

Observação: uma paróquia pode ter várias CEBs, mas cada CEB pertence a apenas uma paróquia.

### 6.5 Pastorais e movimentos

- `id` (PK)
- `nome`
- `tipo` (pastoral ou movimento)
- `status`
- `created_at`
- `updated_at`

Observação: esta lista pode vir pré-cadastrada, mas permanece editável por CRUD.

### 6.6 Conselheiro comunitário

- `id` (PK)
- `ceb_id` (FK)
- `pastoral_movimento_id` (FK opcional)
- `nome`
- `telefone`
- `email`
- `cargo`
- `status`
- `created_at`
- `updated_at`

Observação: o campo `cargo` pode ser uma lista fixa ou uma tabela auxiliar, caso o projeto precise de maior controle no futuro.

### 6.7 Dizimista

- `id` (PK)
- `ceb_id` (FK)
- `nome`
- `telefone`
- `email` (opcional)
- `endereco`
- `data_nascimento`
- `status`
- `created_at`
- `updated_at`

Observação: se o mesmo dizimista doar em mais de uma CEB, cada vínculo pode gerar um registro próprio ou um vínculo separado, conforme a regra final do cadastro.

### 6.8 Doação

- `id` (PK)
- `ceb_id` (FK)
- `dizimista_id` (FK opcional)
- `valor`
- `competencia_mes`
- `competencia_ano`
- `tipo_doacao` (dízimo, oferta ou doação)
- `forma_pagamento` (dinheiro, pix ou transferência bancária)
- `observacoes` (opcional)
- `data_lancamento`
- `created_at`
- `updated_at`

Observação: o mês e o ano devem vir preenchidos automaticamente com o período atual, mas podem ser alterados manualmente.

### 6.9 Alerta de alteração de percentual

- `id` (PK)
- `paroquia_id` (FK)
- `ceb_id` (FK)
- `configuracao_paroquia_id` (FK)
- `percentual_anterior`
- `percentual_novo`
- `mensagem`
- `lido_em` (opcional)
- `created_at`
- `updated_at`

Observação: esse registro serve para notificar as CEBs quando a paróquia alterar percentuais de repasse.

## 7. Funcionalidades por área

### 7.1 Área Administrativa

- Criar a senha inicial do administrador no primeiro acesso.
- Manter acesso exclusivo para cadastro inicial e gestão administrativa.
- CRUD de paróquias.
- Reset de senha de paróquia com confirmação do administrador.
- Acesso a relatórios e dashboards administrativos.

### 7.2 Área Paroquial

- Configurar percentuais de repasse.
- Criar alerta para CEBs quando houver mudança de percentual.
- CRUD de CEBs.
- Reset de senha de CEBs com confirmação do administrador paroquial.
- Dashboard com total de dízimo arrecadado, doações, ofertas, repasses, percentual de repasse, repasse por mês e por ano.
- Relatórios com exportação em Excel ou PDF.
- Filtros por mês, trimestre, semestre e ano.
- Cadastro e manutenção de pastorais e movimentos.

### 7.3 Área CEBs

- Cadastro de conselheiros comunitários.
- Cadastro de dizimistas.
- Cadastro de doações.
- Dashboard com total de dízimo arrecadado, doações, ofertas, repasses e percentual aplicado pela paróquia.
- Exportação dos dados em Excel ou PDF.
- Filtros por mês, trimestre, semestre e ano.

## 8. Regras gerais

- O sistema deve ser responsivo e funcionar bem em computador e mobile.
- A interface deve ser intuitiva e simples.
- As senhas devem ser criptografadas com bcrypt ou Argon2.
- Os dados sensíveis dos dizimistas devem ficar preparados para criptografia futura.
- O sistema não deve recalcular valores antigos quando a configuração percentual mudar; somente o período vigente deve ser afetado.
- Cada cadastro deve ter um identificador único.
- O sistema deve manter separação clara entre os acessos administrativo, paroquial e CEBs.

## 9. Boas práticas de desenvolvimento

- Usar TypeScript com tipagem forte e contratos explícitos.
- Separar responsabilidades entre apresentação, regras de negócio e acesso a dados.
- Evitar regras de negócio dentro de componentes visuais.
- Usar serviços para orquestração de fluxo e repositórios para persistência.
- Manter componentes pequenos, coesos e reutilizáveis.
- Garantir validação de entrada e tratamento consistente de erros.
- Preferir consultas indexadas, paginação e carregamento sob demanda em listas grandes.
- Aplicar otimizações apenas onde houver ganho real, sem complexidade desnecessária.
- Criar testes para fluxos críticos: login, cadastro, reset de senha, configuração de percentuais e relatórios.
- Manter nomenclatura consistente, pastas organizadas e código fácil de ler e manter.

## 10. Pontos para confirmar

- Se você quiser seguir literalmente com "hash id", eu posso ajustar a modelagem para um identificador público separado do `id` técnico.
- Se um conselheiro puder ter mais de uma pastoral ou movimento, vale criar uma tabela de vínculo N:N.
- Se você quiser registrar doações avulsas sem vínculo com dizimista, o campo `dizimista_id` deve continuar opcional.
