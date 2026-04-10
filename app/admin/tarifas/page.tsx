import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import TarifaForm from "./TarifaForm";

export default async function TarifasPage() {
  const session = await auth();
  if (!session || session.user.perfil !== "ADMIN") redirect("/login");

  const tarifas = await prisma.tarifa.findMany({ orderBy: { criadoEm: "asc" } });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar nome={session.user.name ?? ""} perfil="ADMIN" />
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4">
        <h1 className="text-xl font-bold text-gray-800">Gestão de Tarifas</h1>
        <TarifaForm tarifas={tarifas.map((t) => ({
          id: t.id, nome: t.nome, modalidade: t.modalidade,
          valor1h: Number(t.valor1h), valorHoraExtra: Number(t.valorHoraExtra),
          valorDiaria: Number(t.valorDiaria), horasAteDiaria: t.horasAteDiaria, ativa: t.ativa,
        }))} />
      </main>
    </div>
  );
}
