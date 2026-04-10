"use client";

import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";

interface Vaga {
  id: string;
  numero: number;
  categoria: string;
  status: string;
}

const ICONE_CAT: Record<string, string> = { CARRO: "🚗", MOTO: "🏍️", PCD: "♿" };

const COR_STATUS: Record<string, string> = {
  LIVRE: "bg-green-100 text-green-700 border-green-300",
  OCUPADA: "bg-red-100 text-red-700 border-red-300",
  RESERVADA: "bg-yellow-100 text-yellow-700 border-yellow-300",
  INATIVA: "bg-gray-100 text-gray-300 border-gray-200",
};

export default function MapaVagas({ vagas }: { vagas: Vaga[] }) {
  const router = useRouter();

  // Auto-refresh a cada 30 segundos
  const refresh = useCallback(() => router.refresh(), [router]);

  useEffect(() => {
    const intervalo = setInterval(refresh, 30_000);
    return () => clearInterval(intervalo);
  }, [refresh]);

  const livres = vagas.filter((v) => v.status === "LIVRE").length;
  const ocupadas = vagas.filter((v) => v.status === "OCUPADA").length;

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-700 text-base">Mapa de Vagas</h2>
        <span className="text-xs text-gray-400">atualiza a cada 30s</span>
      </div>

      <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
        {vagas.map((vaga) => (
          <div
            key={vaga.id}
            title={`Vaga ${vaga.numero} (${vaga.categoria}) — ${vaga.status}`}
            aria-label={`Vaga ${vaga.numero}, ${vaga.status}`}
            className={`aspect-square rounded-lg flex flex-col items-center justify-center border text-xs font-bold transition
              ${COR_STATUS[vaga.status] ?? "bg-gray-100 text-gray-400 border-gray-200"}`}
          >
            <span className="text-sm leading-none" aria-hidden="true">
              {ICONE_CAT[vaga.categoria]}
            </span>
            <span className="leading-none mt-0.5">{vaga.numero}</span>
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500" role="list" aria-label="Legenda">
        {[
          { cor: "bg-green-400", label: `Livre (${livres})` },
          { cor: "bg-red-400", label: `Ocupada (${ocupadas})` },
          { cor: "bg-gray-300", label: "Inativa" },
        ].map(({ cor, label }) => (
          <span key={label} className="flex items-center gap-1" role="listitem">
            <span className={`w-3 h-3 rounded ${cor} inline-block`} aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
