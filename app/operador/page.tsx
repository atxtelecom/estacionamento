import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import MapaVagas from "./MapaVagas";
import TicketsAbertos from "./TicketsAbertos";
import Link from "next/link";

export default async function OperadorPage() {
  const session = await auth();
  if (!session || session.user.perfil === "MENSALISTA") redirect("/login");

  const [vagas, tickets] = await Promise.all([
    prisma.vaga.findMany({
      where: { ativo: true },
      orderBy: { numero: "asc" },
    }),
    prisma.ticket.findMany({
      where: { status: "ABERTO" },
      include: {
        veiculo: true,
        vaga: true,
      },
      orderBy: { entrada: "asc" },
    }),
  ]);

  const livres = vagas.filter((v) => v.status === "LIVRE").length;
  const ocupadas = vagas.filter((v) => v.status === "OCUPADA").length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar nome={session.user.name ?? ""} perfil={session.user.perfil} />

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4">

        {/* Resumo rápido */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-500 text-white rounded-2xl p-4 text-center shadow">
            <p className="text-4xl font-black">{livres}</p>
            <p className="text-sm font-medium mt-1 opacity-90">Livres</p>
          </div>
          <div className="bg-red-500 text-white rounded-2xl p-4 text-center shadow">
            <p className="text-4xl font-black">{ocupadas}</p>
            <p className="text-sm font-medium mt-1 opacity-90">Ocupadas</p>
          </div>
          <div className="bg-blue-600 text-white rounded-2xl p-4 text-center shadow">
            <p className="text-4xl font-black">{vagas.length}</p>
            <p className="text-sm font-medium mt-1 opacity-90">Total</p>
          </div>
        </div>

        {/* Botões de ação — grandes para maquininha */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/operador/entrada"
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-2xl p-6 text-center shadow transition"
          >
            <div className="text-4xl mb-2">🚗</div>
            <p className="text-lg font-bold">Registrar</p>
            <p className="text-lg font-bold">Entrada</p>
          </Link>
          <Link
            href="/operador/saida"
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-2xl p-6 text-center shadow transition"
          >
            <div className="text-4xl mb-2">🏁</div>
            <p className="text-lg font-bold">Registrar</p>
            <p className="text-lg font-bold">Saída</p>
          </Link>
        </div>

        {/* Veículos estacionados agora */}
        <TicketsAbertos
          tickets={tickets.map((t) => ({
            id: t.id,
            placa: t.veiculo.placa,
            tipo: t.veiculo.tipo,
            vaga: t.vaga.numero,
            categoria: t.vaga.categoria,
            entrada: t.entrada.toISOString(),
          }))}
        />

        {/* Mapa de vagas com auto-refresh */}
        <MapaVagas
          vagas={vagas.map((v) => ({
            id: v.id,
            numero: v.numero,
            categoria: v.categoria,
            status: v.status,
          }))}
        />
      </main>
    </div>
  );
}
