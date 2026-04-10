-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('ADMIN', 'OPERADOR', 'MENSALISTA');

-- CreateEnum
CREATE TYPE "CategoriaVaga" AS ENUM ('CARRO', 'MOTO', 'PCD');

-- CreateEnum
CREATE TYPE "StatusVaga" AS ENUM ('LIVRE', 'OCUPADA', 'RESERVADA', 'INATIVA');

-- CreateEnum
CREATE TYPE "TipoVeiculo" AS ENUM ('ROTATIVO', 'MENSALISTA');

-- CreateEnum
CREATE TYPE "ModalidadeTarifa" AS ENUM ('MISTA', 'POR_HORA', 'DIARIA_FIXA');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('DINHEIRO', 'PIX', 'CARTAO_DEBITO', 'CARTAO_CREDITO');

-- CreateEnum
CREATE TYPE "StatusTicket" AS ENUM ('ABERTO', 'FECHADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "StatusMensalista" AS ENUM ('ATIVO', 'INADIMPLENTE', 'BLOQUEADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vagas" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "categoria" "CategoriaVaga" NOT NULL DEFAULT 'CARRO',
    "status" "StatusVaga" NOT NULL DEFAULT 'LIVRE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "vagas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculos" (
    "id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "tipo" "TipoVeiculo" NOT NULL DEFAULT 'ROTATIVO',
    "descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mensalistaId" TEXT,

    CONSTRAINT "veiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensalistas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT,
    "plano" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "status" "StatusMensalista" NOT NULL DEFAULT 'ATIVO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "mensalistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarifas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "modalidade" "ModalidadeTarifa" NOT NULL,
    "valor1h" DECIMAL(10,2) NOT NULL,
    "valorHoraExtra" DECIMAL(10,2) NOT NULL,
    "valorDiaria" DECIMAL(10,2) NOT NULL,
    "horasAteDiaria" INTEGER NOT NULL DEFAULT 12,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarifas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "entrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saida" TIMESTAMP(3),
    "valor" DECIMAL(10,2),
    "formaPagamento" "FormaPagamento",
    "status" "StatusTicket" NOT NULL DEFAULT 'ABERTO',
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "vagaId" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "operadorId" TEXT NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vagas_numero_key" ON "vagas"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_placa_key" ON "veiculos"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "mensalistas_cpf_key" ON "mensalistas"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "mensalistas_usuarioId_key" ON "mensalistas"("usuarioId");

-- AddForeignKey
ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_mensalistaId_fkey" FOREIGN KEY ("mensalistaId") REFERENCES "mensalistas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensalistas" ADD CONSTRAINT "mensalistas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "vagas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
