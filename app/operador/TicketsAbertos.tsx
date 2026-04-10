"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface Ticket {
  id: string;
  placa: string;
  tipo: string;
  vaga: number;
  categoria: string;
  entrada: string;
}

const ICONE_CAT: Record<string, string> = { CARRO: "🚗", MOTO: "🏍️", PCD: "♿" };

function calcularTempo(entrada: string): string {
  const ms = Date.now() - new Date(entrada).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function corTempo(entrada: string): string {
  const horas = (Date.now() - new Date(entrada).getTime()) / 3600000;
  if (horas >= 8) return "text-red-600 font-bold";
  if (horas >= 4) return "text-orange-500 font-semibold";
  return "text-gray-600";
}

export default function TicketsAbertos({ tickets }: { tickets: Ticket[] }) {
  const router = useRouter();

  const irParaSaida = useCallback((placa: string) => {
    router.push(`/operador/saida?placa=${placa}`);
  }, [router]);

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-4 text-center text-gray-400">
        <p className="text-2xl mb-1">🅿️</p>
        <p className="text-sm">Nenhum veículo estacionado no momento</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="font-bold text-gray-700">Veículos Estacionados</h2>
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
          {tickets.length}
        </span>
      </div>

      <div className="divide-y divide-gray-50">
        {tickets.map((t) => (
          <button
            key={t.id}
            onClick={() => irParaSaida(t.placa)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 active:bg-orange-100 transition text-left"
            aria-label={`Registrar saída da placa ${t.placa}, vaga ${t.vaga}`}
          >
            {/* Ícone categoria */}
            <span className="text-2xl flex-shrink-0" aria-hidden="true">
              {ICONE_CAT[t.categoria]}
            </span>

            {/* Placa + vaga */}
            <div className="flex-1 min-w-0">
              <p className="font-black tracking-widest text-gray-800 text-base font-mono">
                {t.placa}
              </p>
              <p className="text-xs text-gray-500">
                Vaga {t.vaga}
                {t.tipo === "MENSALISTA" && (
                  <span className="ml-1.5 bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-medium">
                    Mensalista
                  </span>
                )}
              </p>
            </div>

            {/* Tempo */}
            <div className="text-right flex-shrink-0">
              <p className={`text-sm ${corTempo(t.entrada)}`}>
                {calcularTempo(t.entrada)}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(t.entrada).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Seta indicando que é clicável */}
            <span className="text-orange-400 text-lg flex-shrink-0" aria-hidden="true">›</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center py-2 border-t border-gray-50">
        Toque em um veículo para registrar a saída
      </p>
    </div>
  );
}
