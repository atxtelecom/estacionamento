import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import MensalistasLista from "./MensalistasLista";
import { verificarInadimplentes } from "./actions";

export default async function MensalistasPage() {
  const session = await auth();
  if (!session || session.user.perfil !== "ADMIN") redirect("/login");

  // Atualiza inadimplentes automaticamente ao abrir a página
  await verificarInadimplentes();

  const mensalistas = await prisma.mensalista.findMany({
    orderBy: { nome: "asc" },
    include: { veiculos: true },
  });

  const ativos = mensalistas.filter((m) => m.status === "ATIVO").length;
  const inadimplentes = mensalistas.filter((m) => m.status === "INADIMPLENTE").length;
  const bloqueados = mensalistas.filter((m) => m.status === "BLOQUEADO").length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar nome={session.user.name ?? ""} perfil="ADMIN" />
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4">
        <h1 className="text-xl font-bold text-gray-800">Mensalistas</h1>

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-green-600">{ativos}</p>
            <p className="text-xs text-gray-500">Ativos</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-orange-500">{inadimplentes}</p>
            <p className="text-xs text-gray-500">Inadimplentes</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-red-600">{bloqueados}</p>
            <p className="text-xs text-gray-500">Bloqueados</p>
          </div>
        </div>

        <MensalistasLista
          mensalistas={mensalistas.map((m) => ({
            id: m.id,
            nome: m.nome,
            cpf: m.cpf,
            telefone: m.telefone,
            plano: m.plano,
            valor: Number(m.valor),
            vencimento: m.vencimento.toISOString(),
            status: m.status,
            veiculos: m.veiculos.map((v) => ({ placa: v.placa, descricao: v.descricao })),
          }))}
        />
      </main>
    </div>
  );
}
