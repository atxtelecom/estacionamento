"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import type { StatusMensalista } from "@prisma/client";

export type ActionState = { erro?: string; sucesso?: string };

export async function criarMensalista(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session || session.user.perfil !== "ADMIN") return { erro: "Sem permissão." };

  const nome = (formData.get("nome") as string).trim();
  const cpf = (formData.get("cpf") as string).replace(/\D/g, "");
  const email = (formData.get("email") as string).trim();
  const telefone = (formData.get("telefone") as string).trim();
  const plano = formData.get("plano") as string;
  const valor = parseFloat(formData.get("valor") as string);
  const vencimento = new Date(formData.get("vencimento") as string);
  const placas = (formData.get("placas") as string)
    .split(",")
    .map((p) => p.trim().toUpperCase())
    .filter(Boolean);

  if (!nome || !cpf || !email || !plano || isNaN(valor)) {
    return { erro: "Preencha todos os campos obrigatórios." };
  }
  if (cpf.length !== 11) return { erro: "CPF inválido." };

  const [cpfExiste, emailExiste] = await Promise.all([
    prisma.mensalista.findUnique({ where: { cpf } }),
    prisma.usuario.findUnique({ where: { email } }),
  ]);
  if (cpfExiste) return { erro: "CPF já cadastrado." };
  if (emailExiste) return { erro: "Email já cadastrado." };

  const senhaHash = await bcrypt.hash(cpf.slice(-6), 12); // senha inicial = últimos 6 dígitos do CPF

  await prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: { nome, email, senhaHash, perfil: "MENSALISTA" },
    });
    const mensalista = await tx.mensalista.create({
      data: { nome, cpf, telefone, plano, valor, vencimento, usuarioId: usuario.id },
    });
    for (const placa of placas) {
      await tx.veiculo.upsert({
        where: { placa },
        update: { tipo: "MENSALISTA", mensalistaId: mensalista.id },
        create: { placa, tipo: "MENSALISTA", mensalistaId: mensalista.id },
      });
    }
  });

  revalidatePath("/admin/mensalistas");
  return { sucesso: `Mensalista criado. Senha inicial: ${cpf.slice(-6)}` };
}

export async function renovarPlano(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session || session.user.perfil !== "ADMIN") return { erro: "Sem permissão." };

  const id = formData.get("id") as string;
  const meses = parseInt(formData.get("meses") as string) || 1;

  const mensalista = await prisma.mensalista.findUnique({ where: { id } });
  if (!mensalista) return { erro: "Mensalista não encontrado." };

  const base = mensalista.vencimento > new Date() ? mensalista.vencimento : new Date();
  const novoVencimento = new Date(base);
  novoVencimento.setMonth(novoVencimento.getMonth() + meses);

  await prisma.mensalista.update({
    where: { id },
    data: { vencimento: novoVencimento, status: "ATIVO" },
  });

  revalidatePath("/admin/mensalistas");
  return { sucesso: `Plano renovado até ${novoVencimento.toLocaleDateString("pt-BR")}.` };
}

export async function alterarStatus(id: string, status: StatusMensalista) {
  const session = await auth();
  if (!session || session.user.perfil !== "ADMIN") return { erro: "Sem permissão." };

  await prisma.mensalista.update({ where: { id }, data: { status } });
  revalidatePath("/admin/mensalistas");
  return { sucesso: true };
}

// Chamada durante render (Server Component) — sem revalidatePath
export async function verificarInadimplentes() {
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);

  const { count } = await prisma.mensalista.updateMany({
    where: { status: "ATIVO", vencimento: { lt: ontem } },
    data: { status: "INADIMPLENTE" },
  });

  return count;
}
