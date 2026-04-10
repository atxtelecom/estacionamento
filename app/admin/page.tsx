import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.perfil !== "ADMIN") redirect("/login");

  const [totalVagas, vagasLivres, mensalistasAtivos, ticketsHoje] = await Promise.all([
    prisma.vaga.count({ where: { ativo: true } }),
    prisma.vaga.count({ where: { status: "LIVRE", ativo: true } }),
    prisma.mensalista.count({ where: { status: "ATIVO" } }),
    prisma.ticket.count({
      where: {
        criadoEm: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

  const modulos = [
    { href: "/admin/vagas", label: "Vagas", icon: "🅿️", desc: "Gerenciar vagas", cor: "bg-blue-600" },
    { href: "/admin/tarifas", label: "Tarifas", icon: "💰", desc: "Configurar preços", cor: "bg-green-600" },
    { href: "/admin/mensalistas", label: "Mensalistas", icon: "👥", desc: "Clientes mensais", cor: "bg-purple-600" },
    { href: "/admin/operadores", label: "Operadores", icon: "👤", desc: "Equipe operacional", cor: "bg-cyan-600" },
    { href: "/admin/relatorios", label: "Relatórios", icon: "📊", desc: "Faturamento e uso", cor: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar nome={session.user.name ?? ""} perfil="ADMIN" />

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-3xl font-black text-green-600">{vagasLivres}</p>
            <p className="text-sm text-gray-500 mt-1">Vagas livres</p>
            <p className="text-xs text-gray-400">de {totalVagas} no total</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-3xl font-black text-blue-600">{ticketsHoje}</p>
            <p className="text-sm text-gray-500 mt-1">Tickets hoje</p>
            <p className="text-xs text-gray-400">entradas registradas</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-3xl font-black text-purple-600">{mensalistasAtivos}</p>
            <p className="text-sm text-gray-500 mt-1">Mensalistas</p>
            <p className="text-xs text-gray-400">ativos</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-3xl font-black text-orange-500">
              {Math.round(((totalVagas - vagasLivres) / (totalVagas || 1)) * 100)}%
            </p>
            <p className="text-sm text-gray-500 mt-1">Ocupação</p>
            <p className="text-xs text-gray-400">atual</p>
          </div>
        </div>

        {/* Módulos */}
        <h2 className="text-base font-bold text-gray-700 pt-2">Módulos</h2>
        <div className="grid grid-cols-2 gap-3">
          {modulos.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`${m.cor} text-white rounded-2xl p-5 shadow transition active:opacity-80`}
            >
              <div className="text-3xl mb-2">{m.icon}</div>
              <p className="font-bold text-base">{m.label}</p>
              <p className="text-xs opacity-80 mt-0.5">{m.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
