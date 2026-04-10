"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { CategoriaVaga } from "@prisma/client";

export async function criarVaga(formData: FormData) {
  const session = await auth();
  if (!session || session.user.perfil !== "ADMIN") return { erro: "Sem permissão." };

  const numero = parseInt(formData.get("numero") as string);
  const categoria = formData.get("categoria") as CategoriaVaga;

  if (isNaN(numero) || numero < 1 || numero > 999) return { erro: "Número inválido." };

  const existe = await prisma.vaga.findUnique({ where: { numero } });
  if (existe) return { erro: `Vaga ${numero} já existe.` };

  await prisma.vaga.create({ data: { numero, categoria } });
  revalidatePath("/admin/vagas");
  return { sucesso: true };
}

export async function toggleVaga(id: string, ativo: boolean) {
  const session = await auth();
  if (!session || session.user.perfil !== "ADMIN") return { erro: "Sem permissão." };

  await prisma.vaga.update({ where: { id }, data: { ativo, status: ativo ? "LIVRE" : "INATIVA" } });
  revalidatePath("/admin/vagas");
  return { sucesso: true };
}
