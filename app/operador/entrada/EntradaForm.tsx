"use client";

import { useActionState, useCallback, useState } from "react";
import { registrarEntrada } from "../actions";
import { TicketImpressao, BotaoImprimir } from "@/components/TicketImpressao";

interface Vaga { id: string; numero: number; categoria: string }

type EntradaState = {
  erro?: string;
  sucesso?: boolean;
  placa?: string;
  vaga?: number;
  entrada?: string;
};

const ICONE_CAT: Record<string, string> = { CARRO: "🚗", MOTO: "🏍️", PCD: "♿" };

// Fora do componente — não recriado a cada render
const TIPOS = [
  { value: "ROTATIVO", label: "🚗 Rotativo" },
  { value: "MENSALISTA", label: "📅 Mensalista" },
] as const;

export default function EntradaForm({ vagasLivres }: { vagasLivres: Vaga[] }) {
  const [tipo, setTipo] = useState<"ROTATIVO" | "MENSALISTA">("ROTATIVO");

  const [state, action, isPending] = useActionState<EntradaState, FormData>(
    registrarEntrada,
    {}
  );

  const handleNovaEntrada = useCallback(() => {
    // useActionState não reseta automaticamente — forçamos via key no form
    window.location.reload();
  }, []);

  const handleTipoRotativo = useCallback(() => setTipo("ROTATIVO"), []);
  const handleTipoMensalista = useCallback(() => setTipo("MENSALISTA"), []);

  if (state.sucesso) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-green-50 border-2 border-green-400 rounded-2xl p-6 text-center space-y-4"
      >
        <div className="text-5xl" aria-hidden="true">✅</div>
        <h2 className="text-xl font-bold text-green-700">Entrada Registrada!</h2>
        <div className="bg-white rounded-xl p-4 space-y-1">
          <p className="text-3xl font-black tracking-widest text-gray-800">{state.placa}</p>
          <p className="text-gray-500">
            Vaga <span className="font-bold text-gray-700">{state.vaga}</span>
          </p>
          <p className="text-sm text-gray-400">
            <time dateTime={new Date().toISOString()}>
              {new Date().toLocaleTimeString("pt-BR")}
            </time>
          </p>
        </div>
        <TicketImpressao
          tipo="entrada"
          placa={state.placa!}
          vaga={state.vaga!}
          entrada={state.entrada ?? new Date().toISOString()}
        />

        <BotaoImprimir />

        <button
          onClick={handleNovaEntrada}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg transition"
        >
          Nova Entrada
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {/* Placa */}
      <div>
        <label htmlFor="placa" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Placa do Veículo
        </label>
        <input
          id="placa"
          name="placa"
          type="text"
          required
          maxLength={8}
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="ABC1D23 ou ABC1234"
          className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-4 text-xl font-bold uppercase tracking-widest outline-none transition font-mono"
        />
      </div>

      {/* Tipo */}
      <fieldset>
        <legend className="text-sm font-semibold text-gray-700 mb-2">Tipo</legend>
        <input type="hidden" name="tipo" value={tipo} />
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleTipoRotativo}
            aria-pressed={tipo === "ROTATIVO"}
            className={`py-4 rounded-xl font-bold text-base border-2 transition
              ${tipo === "ROTATIVO"
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"}`}
          >
            {TIPOS[0].label}
          </button>
          <button
            type="button"
            onClick={handleTipoMensalista}
            aria-pressed={tipo === "MENSALISTA"}
            className={`py-4 rounded-xl font-bold text-base border-2 transition
              ${tipo === "MENSALISTA"
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"}`}
          >
            {TIPOS[1].label}
          </button>
        </div>
      </fieldset>

      {/* Seleção de vaga */}
      <div>
        <label htmlFor="vagaId" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Vaga{" "}
          <span className="text-gray-400 font-normal">({vagasLivres.length} livres)</span>
        </label>
        {vagasLivres.length === 0 ? (
          <p role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-600 font-medium">
            Sem vagas disponíveis
          </p>
        ) : (
          <select
            id="vagaId"
            name="vagaId"
            required
            className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-4 text-base outline-none transition bg-white"
          >
            <option value="">Selecione a vaga</option>
            {vagasLivres.map((v) => (
              <option key={v.id} value={v.id}>
                {ICONE_CAT[v.categoria]} Vaga {v.numero} — {v.categoria}
              </option>
            ))}
          </select>
        )}
      </div>

      {state.erro && (
        <p role="alert" aria-live="assertive" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          ⚠️ {state.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || vagasLivres.length === 0}
        className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-5 rounded-xl text-xl transition disabled:opacity-50 mt-2"
      >
        {isPending ? "Registrando..." : "✅ Registrar Entrada"}
      </button>
    </form>
  );
}
