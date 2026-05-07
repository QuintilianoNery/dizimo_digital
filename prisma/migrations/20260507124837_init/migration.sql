-- CreateTable
CREATE TABLE "administrador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email_login" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administrador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paroquia" (
    "id" TEXT NOT NULL,
    "administrador_criou_id" TEXT,
    "codigo_paroquia" TEXT NOT NULL,
    "logo_url" TEXT,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "endereco" TEXT,
    "fundacao" TEXT,
    "cnpj" TEXT,
    "paroco" TEXT,
    "email_login_secretaria" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paroquia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_paroquia" (
    "id" TEXT NOT NULL,
    "paroquia_id" TEXT NOT NULL,
    "percentual_repasse_dizimo_cebs" DOUBLE PRECISION NOT NULL,
    "percentual_repasse_oferta_cebs" DOUBLE PRECISION NOT NULL,
    "percentual_repasse_curia_diocesana" DOUBLE PRECISION NOT NULL,
    "percentual_repasse_diocese" DOUBLE PRECISION NOT NULL,
    "vigente_desde" TIMESTAMP(3) NOT NULL,
    "vigente_ate" TIMESTAMP(3),
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "alterado_por_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_paroquia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ceb" (
    "id" TEXT NOT NULL,
    "paroquia_id" TEXT NOT NULL,
    "codigo_ceb" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email_login" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "telefone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ceb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pastoral_movimento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pastoral_movimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conselheiro_comunitario" (
    "id" TEXT NOT NULL,
    "ceb_id" TEXT NOT NULL,
    "pastoral_movimento_id" TEXT,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "cargo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conselheiro_comunitario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dizimista" (
    "id" TEXT NOT NULL,
    "ceb_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "data_nascimento" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dizimista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doacao" (
    "id" TEXT NOT NULL,
    "ceb_id" TEXT NOT NULL,
    "dizimista_id" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "competencia_mes" INTEGER NOT NULL,
    "competencia_ano" INTEGER NOT NULL,
    "tipo_doacao" TEXT NOT NULL,
    "forma_pagamento" TEXT NOT NULL,
    "observacoes" TEXT,
    "data_lancamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerta_alteracao_percentual" (
    "id" TEXT NOT NULL,
    "paroquia_id" TEXT NOT NULL,
    "ceb_id" TEXT NOT NULL,
    "configuracao_paroquia_id" TEXT NOT NULL,
    "percentual_anterior" DOUBLE PRECISION NOT NULL,
    "percentual_novo" DOUBLE PRECISION NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lido_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerta_alteracao_percentual_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "administrador_email_login_key" ON "administrador"("email_login");

-- CreateIndex
CREATE UNIQUE INDEX "paroquia_codigo_paroquia_key" ON "paroquia"("codigo_paroquia");

-- CreateIndex
CREATE UNIQUE INDEX "ceb_codigo_ceb_key" ON "ceb"("codigo_ceb");

-- AddForeignKey
ALTER TABLE "paroquia" ADD CONSTRAINT "paroquia_administrador_criou_id_fkey" FOREIGN KEY ("administrador_criou_id") REFERENCES "administrador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracao_paroquia" ADD CONSTRAINT "configuracao_paroquia_paroquia_id_fkey" FOREIGN KEY ("paroquia_id") REFERENCES "paroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ceb" ADD CONSTRAINT "ceb_paroquia_id_fkey" FOREIGN KEY ("paroquia_id") REFERENCES "paroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conselheiro_comunitario" ADD CONSTRAINT "conselheiro_comunitario_ceb_id_fkey" FOREIGN KEY ("ceb_id") REFERENCES "ceb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conselheiro_comunitario" ADD CONSTRAINT "conselheiro_comunitario_pastoral_movimento_id_fkey" FOREIGN KEY ("pastoral_movimento_id") REFERENCES "pastoral_movimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dizimista" ADD CONSTRAINT "dizimista_ceb_id_fkey" FOREIGN KEY ("ceb_id") REFERENCES "ceb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doacao" ADD CONSTRAINT "doacao_ceb_id_fkey" FOREIGN KEY ("ceb_id") REFERENCES "ceb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doacao" ADD CONSTRAINT "doacao_dizimista_id_fkey" FOREIGN KEY ("dizimista_id") REFERENCES "dizimista"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta_alteracao_percentual" ADD CONSTRAINT "alerta_alteracao_percentual_paroquia_id_fkey" FOREIGN KEY ("paroquia_id") REFERENCES "paroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta_alteracao_percentual" ADD CONSTRAINT "alerta_alteracao_percentual_ceb_id_fkey" FOREIGN KEY ("ceb_id") REFERENCES "ceb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta_alteracao_percentual" ADD CONSTRAINT "alerta_alteracao_percentual_configuracao_paroquia_id_fkey" FOREIGN KEY ("configuracao_paroquia_id") REFERENCES "configuracao_paroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
