"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calcularTarifa } from "@/lib/tarifa";
import { revalidatePath } from "next/cache";
import type { FormaPagamento } from "@prisma/client";

// ─── Registrar Entrada ────────────────────────────────────────────────────────

export async function registrarEntrada(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session || session.user.perfil === "MENSALISTA") {
    return { erro: "Sem permissão." };
  }

  const placa = (formData.get("placa") as string).toUpperCase().trim();
  const tipo = formData.get("tipo") as "ROTATIVO" | "MENSALISTA";
  const vagaId = formData.get("vagaId") as string;

  if (!placa || !tipo || !vagaId) {
    return { erro: "Preencha todos os campos." };
  }

  // Valida formato de placa: Mercosul (ABC1D23) ou antiga (ABC1234)
  const placaValida = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placa);
  if (!placaValida) {
    return { erro: "Placa inválida. Use o formato ABC1D23 (Mercosul) ou ABC1234." };
  }

  // Verifica se a vaga está livre
  const vaga = await prisma.vaga.findUnique({ where: { id: vagaId } });
  if (!vaga || vaga.status !== "LIVRE") {
    return { erro: "Vaga não disponível." };
  }

  // Verifica se já tem ticket aberto para essa placa
  const ticketAberto = await prisma.ticket.findFirst({
    where: { veiculo: { placa }, status: "ABERTO" },
  });
  if (ticketAberto) {
    return { erro: `Placa ${placa} já tem entrada registrada.` };
  }

  // Se mensalista, verifica se a placa é cadastrada e plano ativo
  if (tipo === "MENSALISTA") {
    const veiculo = await prisma.veiculo.findUnique({
      where: { placa },
      include: { mensalista: true },
    });
    if (!veiculo || !veiculo.mensalista) {
      return { erro: `Placa ${placa} não está cadastrada como mensalista.` };
    }
    if (veiculo.mensalista.status !== "ATIVO") {
      return { erro: `Mensalista com plano ${veiculo.mensalista.status.toLowerCase()}. Acesso negado.` };
    }
  }

  // Cria ou encontra o veículo
  const veiculo = await prisma.veiculo.upsert({
    where: { placa },
    update: { tipo },
    create: { placa, tipo },
  });

  // Cria ticket e marca vaga como ocupada
  const ticket = await prisma.ticket.create({
    data: {
      vagaId,
      veiculoId: veiculo.id,
      operadorId: session.user.id,
      status: "ABERTO",
    },
  });

  await prisma.vaga.update({
    where: { id: vagaId },
    data: { status: "OCUPADA" },
  });

  revalidatePath("/operador");
  return { sucesso: true, ticketId: ticket.id, placa, vaga: vaga.numero };
}

// ─── Buscar Ticket por Placa ──────────────────────────────────────────────────

export async function buscarTicketPorPlaca(placa: string) {
  const session = await auth();
  if (!session || session.user.perfil === "MENSALISTA") return null;

  const placaUpper = placa.toUpperCase().trim();

  const ticket = await prisma.ticket.findFirst({
    where: { veiculo: { placa: placaUpper }, status: "ABERTO" },
    include: { veiculo: true, vaga: true },
  });

  if (!ticket) return null;

  // Calcula valor com tarifa ativa
  const tarifa = await prisma.tarifa.findFirst({ where: { ativa: true } });
  if (!tarifa) return { ticket, calculo: null };

  const agora = new Date();
  const calculo = calcularTarifa(tarifa, ticket.entrada, agora);

  return {
    ticket: {
      id: ticket.id,
      placa: ticket.veiculo.placa,
      tipo: ticket.veiculo.tipo,
      vaga: ticket.vaga.numero,
      entrada: ticket.entrada.toISOString(),
    },
    calculo,
  };
}

// ─── Registrar Saída ──────────────────────────────────────────────────────────

export async function registrarSaida(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session || session.user.perfil === "MENSALISTA") {
    return { erro: "Sem permissão." };
  }

  const ticketId = formData.get("ticketId") as string;
  const formaPagamento = formData.get("formaPagamento") as FormaPagamento;

  if (!ticketId || !formaPagamento) {
    return { erro: "Dados inválidos." };
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { veiculo: true, vaga: true },
  });

  if (!ticket || ticket.status !== "ABERTO") {
    return { erro: "Ticket não encontrado ou já fechado." };
  }

  const saida = new Date();
  let valor = 0;

  // Mensalistas não pagam
  if (ticket.veiculo.tipo === "ROTATIVO") {
    const tarifa = await prisma.tarifa.findFirst({ where: { ativa: true } });
    if (tarifa) {
      const calculo = calcularTarifa(tarifa, ticket.entrada, saida);
      valor = calculo.valor;
    }
  }

  // Fecha ticket e libera vaga
  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      saida,
      valor,
      formaPagamento: ticket.veiculo.tipo === "MENSALISTA" ? null : formaPagamento,
      status: "FECHADO",
    },
  });

  await prisma.vaga.update({
    where: { id: ticket.vagaId },
    data: { status: "LIVRE" },
  });

  revalidatePath("/operador");

  return {
    sucesso: true,
    placa: ticket.veiculo.placa,
    vaga: ticket.vaga.numero,
    valor,
    tipo: ticket.veiculo.tipo,
    entrada: ticket.entrada.toISOString(),
    saida: saida.toISOString(),
  };
}
