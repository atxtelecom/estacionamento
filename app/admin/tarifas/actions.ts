"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ModalidadeTarifa } from "@prisma/client";

export async function salvarTarifa(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session || session.user.perfil !== "ADMIN") return { erro: "Sem permissão." };

  const id = formData.get("id") as string | null;
  const nome = formData.get("nome") as string;
  const modalidade = formData.get("modalidade") as ModalidadeTarifa;
  const valor1h = parseFloat(formData.get("valor1h") as string);
  const valorHoraExtra = parseFloat(formData.get("valorHoraExtra") as string);
  const valorDiaria = parseFloat(formData.get("valorDiaria") as string);
  const horasAteDiaria = parseInt(formData.get("horasAteDiaria") as string);

  if (!nome || !modalidade || isNaN(valor1h) || isNaN(valorHoraExtra) || isNaN(valorDiaria)) {
    return { erro: "Preencha todos os campos." };
  }

  if (id) {
    await prisma.tarifa.update({
      where: { id },
      data: { nome, modalidade, valor1h, valorHoraExtra, valorDiaria, horasAteDiaria },
    });
  } else {
    await prisma.tarifa.create({
      data: { nome, modalidade, valor1h, valorHoraExtra, valorDiaria, horasAteDiaria },
    });
  }

  revalidatePath("/admin/tarifas");
  return { sucesso: true };
}

export async function ativarTarifa(id: string) {
  const session = await auth();
  if (!session || session.user.perfil !== "ADMIN") return { erro: "Sem permissão." };

  // Transação garante que nunca haja duas tarifas ativas ao mesmo tempo
  await prisma.$transaction([
    prisma.tarifa.updateMany({ data: { ativa: false } }),
    prisma.tarifa.update({ where: { id }, data: { ativa: true } }),
  ]);

  revalidatePath("/admin/tarifas");
  return { sucesso: true };
}
