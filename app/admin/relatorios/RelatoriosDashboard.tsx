"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DadosDia { data: string; entradas: number; faturamento: number }
interface Dados {
  totalEntradas: number;
  faturamentoTotal: number;
  ticketMedio: number;
  porDia: DadosDia[];
  porPagamento: Record<string, number>;
  inadimplentes: number;
}

const FORMA_LABEL: Record<string, string> = {
  DINHEIRO: "💵 Dinheiro",
  PIX: "📱 PIX",
  CARTAO_DEBITO: "💳 Débito",
  CARTAO_CREDITO: "💳 Crédito",
};

function fmt(valor: number) {
  return `R$ ${valor.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export default function RelatoriosDashboard({
  dados, inicioISO, fimISO,
}: { dados: Dados; inicioISO: string; fimISO: string }) {
  const router = useRouter();
  const [inicio, setInicio] = useState(inicioISO);
  const [fim, setFim] = useState(fimISO);

  const maxFaturamento = Math.max(...dados.porDia.map((d) => d.faturamento), 1);

  function aplicarFiltro() {
    router.push(`/admin/relatorios?inicio=${inicio}&fim=${fim}`);
  }

  function exportarCSV() {
    const header = "Data,Entradas,Faturamento (R$)\n";
    const linhas = dados.porDia
      .map((d) => `${d.data},${d.entradas},${d.faturamento.toFixed(2)}`)
      .join("\n");
    const blob = new Blob([header + linhas], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${inicio}-a-${fim}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Filtro de período */}
      <div className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h2 className="font-bold text-gray-700 text-sm">Período</h2>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500 block mb-1">De</label>
            <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Até</label>
            <input type="date" value={fim} onChange={(e) => setFim(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={aplicarFiltro}
            className="bg-blue-600 text-white font-bold py-3 rounded-xl text-sm transition hover:bg-blue-700">
            Filtrar
          </button>
          <button onClick={exportarCSV}
            className="border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm transition hover:bg-gray-50">
            ⬇️ Exportar CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-600 text-white rounded-2xl shadow p-4">
          <p className="text-3xl font-black">{dados.totalEntradas}</p>
          <p className="text-sm opacity-80 mt-1">Entradas no período</p>
        </div>
        <div className="bg-green-600 text-white rounded-2xl shadow p-4">
          <p className="text-2xl font-black">{fmt(dados.faturamentoTotal)}</p>
          <p className="text-sm opacity-80 mt-1">Faturamento total</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-2xl font-black text-gray-800">{fmt(dados.ticketMedio)}</p>
          <p className="text-sm text-gray-500 mt-1">Ticket médio</p>
        </div>
        <div className={`rounded-2xl shadow p-4 ${dados.inadimplentes > 0 ? "bg-orange-50 border-2 border-orange-300" : "bg-white"}`}>
          <p className={`text-2xl font-black ${dados.inadimplentes > 0 ? "text-orange-500" : "text-gray-800"}`}>
            {dados.inadimplentes}
          </p>
          <p className="text-sm text-gray-500 mt-1">Inadimplentes</p>
        </div>
      </div>

      {/* Gráfico de barras por dia */}
      {dados.porDia.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-bold text-gray-700 mb-3 text-sm">Faturamento por dia</h2>
          <div className="space-y-2">
            {dados.porDia.map((d) => (
              <div key={d.data} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-20 flex-shrink-0">
                  {new Date(d.data + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-blue-500 h-6 rounded-full flex items-center pl-2 transition-all duration-500"
                    style={{ width: `${Math.max((d.faturamento / maxFaturamento) * 100, d.faturamento > 0 ? 8 : 0)}%` }}
                  >
                    {d.faturamento > 0 && (
                      <span className="text-white text-xs font-bold whitespace-nowrap">
                        {fmt(d.faturamento)}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-6 text-right flex-shrink-0">{d.entradas}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-right mt-1">← faturamento · entradas →</p>
        </div>
      )}

      {/* Por forma de pagamento */}
      {Object.keys(dados.porPagamento).length > 0 && (
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-bold text-gray-700 mb-3 text-sm">Por forma de pagamento</h2>
          <div className="space-y-2">
            {Object.entries(dados.porPagamento)
              .sort(([, a], [, b]) => b - a)
              .map(([forma, valor]) => (
                <div key={forma} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-sm text-gray-600">{FORMA_LABEL[forma] ?? forma}</span>
                  <span className="font-bold text-gray-800">{fmt(valor)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {dados.porDia.length === 0 && (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
          <p className="text-4xl mb-2">📊</p>
          <p>Nenhum dado no período selecionado.</p>
        </div>
      )}
    </div>
  );
}
