import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import VagasAdmin from "./VagasAdmin";

export default async function VagasAdminPage() {
  const session = await auth();
  if (!session || session.user.perfil !== "ADMIN") redirect("/login");

  const vagas = await prisma.vaga.findMany({ orderBy: { numero: "asc" } });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar nome={session.user.name ?? ""} perfil="ADMIN" />
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4">
        <h1 className="text-xl font-bold text-gray-800">Gestão de Vagas</h1>
        <VagasAdmin vagas={vagas.map((v) => ({
          id: v.id, numero: v.numero, categoria: v.categoria, status: v.status, ativo: v.ativo,
        }))} />
      </main>
    </div>
  );
}
