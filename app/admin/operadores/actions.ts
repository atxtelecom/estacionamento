"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export type OperadorState = { erro?: string; sucesso?: string };

export async function criarOperador(
  _prev: OperadorState,
  formData: FormData
): Promise<OperadorState> {
  const session = await auth();
  if (!session || session.user.perfil !== "ADMIN") return { erro: "Sem permissão." };

  const nome = (formData.get("nome") as string).trim();
  const email = (formData.get("email") as string).trim().toLowerCase();
  const senha = formData.get("senha") as string;

  if (!nome || !email || !senha) return { erro: "Preencha todos os campos." };
  if (senha.length < 6) return { erro: "Senha deve ter ao menos 6 caracteres." };

  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) return { erro: "Email já cadastrado." };

  const senhaHash = await bcrypt.hash(senha, 12);

  await prisma.usuario.create({
    data: { nome, email, senhaHash, perfil: "OPERADOR" },
  });

  revalidatePath("/admin/operadores");
  return { sucesso: `Operador ${nome} criado com sucesso.` };
}

export async function toggleOperador(id: string, ativo: boolean) {
  const session = await auth();
  if (!session || session.user.perfil !== "ADMIN") return { erro: "Sem permissão." };

  // Não permite desativar a si mesmo
  if (id === session.user.id) return { erro: "Você não pode desativar sua própria conta." };

  await prisma.usuario.update({ where: { id }, data: { ativo } });
  revalidatePath("/admin/operadores");
  return { sucesso: true };
}

export async function redefinirSenha(
  _prev: OperadorState,
  formData: FormData
): Promise<OperadorState> {
  const session = await auth();
  if (!session || session.user.perfil !== "ADMIN") return { erro: "Sem permissão." };

  const id = formData.get("id") as string;
  const senha = formData.get("senha") as string;

  if (!senha || senha.length < 6) return { erro: "Senha deve ter ao menos 6 caracteres." };

  const senhaHash = await bcrypt.hash(senha, 12);
  await prisma.usuario.update({ where: { id }, data: { senhaHash } });

  revalidatePath("/admin/operadores");
  return { sucesso: "Senha redefinida com sucesso." };
}
