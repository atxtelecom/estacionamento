import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import RelatoriosDashboard from "./RelatoriosDashboard";

async function buscarDados(inicio: Date, fim: Date) {
  // Query única para tickets fechados no período — usa o índice [status, entrada]
  const tickets = await prisma.ticket.findMany({
    where: {
      status: "FECHADO",
      entrada: { gte: inicio, lte: fim },
    },
    select: {
      entrada: true,
      saida: true,
      valor: true,
      formaPagamento: true,
      veiculo: { select: { tipo: true } },
    },
    orderBy: { entrada: "asc" },
  });

  // Faturamento total (só rotativos pagam)
  const faturamentoTotal = tickets
    .filter((t) => t.veiculo.tipo === "ROTATIVO")
    .reduce((acc, t) => acc + Number(t.valor ?? 0), 0);

  // Ticket médio
  const rotativos = tickets.filter((t) => t.veiculo.tipo === "ROTATIVO" && Number(t.valor) > 0);
  const ticketMedio = rotativos.length > 0 ? faturamentoTotal / rotativos.length : 0;

  // Agrupamento por dia — eficiente em memória (já filtrado pelo índice)
  const porDia: Record<string, { entradas: number; faturamento: number }> = {};
  for (const t of tickets) {
    const dia = t.entrada.toISOString().split("T")[0];
    if (!porDia[dia]) porDia[dia] = { entradas: 0, faturamento: 0 };
    porDia[dia].entradas++;
    if (t.veiculo.tipo === "ROTATIVO") {
      porDia[dia].faturamento += Number(t.valor ?? 0);
    }
  }

  // Por forma de pagamento
  const porPagamento: Record<string, number> = {};
  for (const t of rotativos) {
    const forma = t.formaPagamento ?? "OUTROS";
    porPagamento[forma] = (porPagamento[forma] ?? 0) + Number(t.valor ?? 0);
  }

  // Mensalistas inadimplentes
  const inadimplentes = await prisma.mensalista.count({ where: { status: "INADIMPLENTE" } });

  return {
    totalEntradas: tickets.length,
    faturamentoTotal,
    ticketMedio,
    porDia: Object.entries(porDia)
      .map(([data, v]) => ({ data, ...v }))
      .sort((a, b) => a.data.localeCompare(b.data)),
    porPagamento,
    inadimplentes,
  };
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ inicio?: string; fim?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.perfil !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const hoje = new Date();
  const inicioDefault = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const inicio = params.inicio ? new Date(params.inicio) : inicioDefault;
  const fim = params.fim ? new Date(params.fim + "T23:59:59") : new Date(hoje.setHours(23, 59, 59));

  const dados = await buscarDados(inicio, fim);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar nome={session.user.name ?? ""} perfil="ADMIN" />
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4">
        <h1 className="text-xl font-bold text-gray-800">Relatórios</h1>
        <RelatoriosDashboard
          dados={dados}
          inicioISO={inicio.toISOString().split("T")[0]}
          fimISO={fim.toISOString().split("T")[0]}
        />
      </main>
    </div>
  );
}
