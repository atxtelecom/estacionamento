import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import OperadoresLista from "./OperadoresLista";

export default async function OperadoresPage() {
  const session = await auth();
  if (!session || session.user.perfil !== "ADMIN") redirect("/login");

  const operadores = await prisma.usuario.findMany({
    where: { perfil: "OPERADOR" },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, email: true, ativo: true, criadoEm: true },
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar nome={session.user.name ?? ""} perfil="ADMIN" />
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4">
        <h1 className="text-xl font-bold text-gray-800">Operadores</h1>
        <OperadoresLista
          operadores={operadores.map((o) => ({
            id: o.id,
            nome: o.nome,
            email: o.email,
            ativo: o.ativo,
            criadoEm: o.criadoEm.toISOString(),
          }))}
        />
      </main>
    </div>
  );
}
