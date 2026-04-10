import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import EntradaForm from "./EntradaForm";

export default async function EntradaPage() {
  const session = await auth();
  if (!session || session.user.perfil === "MENSALISTA") redirect("/login");

  const vagasLivres = await prisma.vaga.findMany({
    where: { status: "LIVRE", ativo: true },
    orderBy: { numero: "asc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar nome={session.user.name ?? ""} perfil={session.user.perfil} />
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Registrar Entrada</h1>
        <EntradaForm vagasLivres={vagasLivres.map((v) => ({ id: v.id, numero: v.numero, categoria: v.categoria }))} />
      </main>
    </div>
  );
}
