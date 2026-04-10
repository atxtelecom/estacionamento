"use client";

import { useActionState, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { salvarTarifa, ativarTarifa } from "./actions";

interface Tarifa {
  id: string; nome: string; modalidade: string;
  valor1h: number; valorHoraExtra: number; valorDiaria: number;
  horasAteDiaria: number; ativa: boolean;
}

type TarifaState = { erro?: string; sucesso?: boolean };

// Fora do componente
const MODALIDADES = [
  { value: "MISTA", label: "Mista", desc: "1ª hora diferenciada + horas extras" },
  { value: "POR_HORA", label: "Por Hora", desc: "Valor fixo por hora" },
  { value: "DIARIA_FIXA", label: "Diária Fixa", desc: "Valor fixo após X horas" },
] as const;

const CAMPOS_NUMERICOS = [
  { name: "valor1h", label: "1ª hora (R$)" },
  { name: "valorHoraExtra", label: "Hora extra (R$)" },
  { name: "valorDiaria", label: "Diária (R$)" },
  { name: "horasAteDiaria", label: "Horas p/ diária" },
] as const;

function FormularioTarifa({
  tarifa,
  onCancelar,
  onSalvo,
}: {
  tarifa: Tarifa | null;
  onCancelar: () => void;
  onSalvo: () => void;
}) {
  const [state, action, isPending] = useActionState<TarifaState, FormData>(salvarTarifa, {});

  if (state.sucesso) {
    onSalvo();
    return null;
  }

  const defaults = tarifa ?? {
    id: "", nome: "", modalidade: "MISTA",
    valor1h: 8, valorHoraExtra: 4, valorDiaria: 35, horasAteDiaria: 12, ativa: false,
  };

  return (
    <form
      action={action}
      className="bg-white rounded-2xl shadow p-4 space-y-3 border-2 border-blue-200"
      aria-label={tarifa ? "Editar tarifa" : "Nova tarifa"}
    >
      <h2 className="font-bold text-gray-700">{tarifa ? "Editar Tarifa" : "Nova Tarifa"}</h2>
      {tarifa && <input type="hidden" name="id" value={tarifa.id} />}

      <div>
        <label htmlFor="nome-tarifa" className="text-sm font-semibold text-gray-600 block mb-1">
          Nome
        </label>
        <input
          id="nome-tarifa"
          name="nome"
          required
          defaultValue={defaults.nome}
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-base outline-none focus:border-blue-400 transition"
        />
      </div>

      <div>
        <label htmlFor="modalidade-tarifa" className="text-sm font-semibold text-gray-600 block mb-1">
          Modalidade
        </label>
        <select
          id="modalidade-tarifa"
          name="modalidade"
          defaultValue={defaults.modalidade}
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-base outline-none focus:border-blue-400 bg-white transition"
        >
          {MODALIDADES.map((m) => (
            <option key={m.value} value={m.value}>{m.label} — {m.desc}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CAMPOS_NUMERICOS.map((f) => (
          <div key={f.name}>
            <label htmlFor={f.name} className="text-xs font-semibold text-gray-600 block mb-1">
              {f.label}
            </label>
            <input
              id={f.name}
              name={f.name}
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={defaults[f.name as keyof typeof defaults] as number}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-base outline-none focus:border-blue-400 transition"
            />
          </div>
        ))}
      </div>

      {state.erro && (
        <p role="alert" aria-live="assertive" className="text-red-600 text-sm">
          ⚠️ {state.erro}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 hover:bg-blue-700"
        >
          {isPending ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl transition hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function TarifaForm({ tarifas: inicial }: { tarifas: Tarifa[] }) {
  const router = useRouter();
  const [tarifas, setTarifas] = useState(inicial);
  const [editando, setEditando] = useState<Tarifa | null>(null);
  const [nova, setNova] = useState(false);
  const [ativando, setAtivando] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");

  const handleSalvo = useCallback(() => {
    setEditando(null);
    setNova(false);
    router.refresh(); // revalida Server Component sem reload completo
  }, [router]);

  const handleCancelar = useCallback(() => {
    setEditando(null);
    setNova(false);
  }, []);

  const handleNovaTarifa = useCallback(() => {
    setNova(true);
    setEditando(null);
  }, []);

  const handleAtivar = useCallback(async (id: string) => {
    setAtivando(id);
    await ativarTarifa(id);
    setTarifas((prev) => prev.map((t) => ({ ...t, ativa: t.id === id })));
    setAtivando(null);
    setMensagem("Tarifa ativada!");
    router.refresh();
  }, [router]);

  const mostrarForm = nova || editando !== null;

  return (
    <div className="space-y-4">
      {mensagem && (
        <p role="status" aria-live="polite" className="bg-green-50 border border-green-300 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          ✅ {mensagem}
        </p>
      )}

      {tarifas.map((t) => (
        <article
          key={t.id}
          className={`bg-white rounded-2xl shadow p-4 border-2 transition ${t.ativa ? "border-green-400" : "border-transparent"}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-800">{t.nome}</h3>
                {t.ativa && (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    ATIVA
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {MODALIDADES.find((m) => m.value === t.modalidade)?.label}
              </p>
            </div>
            <button
              onClick={() => { setEditando(t); setNova(false); }}
              className="text-blue-600 text-sm font-medium hover:underline"
              aria-label={`Editar tarifa ${t.nome}`}
            >
              Editar
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 text-center" role="list" aria-label="Valores">
            {[
              { label: "1ª hora", valor: t.valor1h },
              { label: "Hora extra", valor: t.valorHoraExtra },
              { label: "Diária", valor: t.valorDiaria },
            ].map(({ label, valor }) => (
              <div key={label} role="listitem" className="bg-gray-50 rounded-xl p-2">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-bold text-gray-800">R$ {valor.toFixed(2)}</p>
              </div>
            ))}
          </div>

          {!t.ativa && (
            <button
              onClick={() => handleAtivar(t.id)}
              disabled={ativando === t.id}
              aria-busy={ativando === t.id}
              className="mt-3 w-full border-2 border-green-500 text-green-600 font-semibold py-2.5 rounded-xl hover:bg-green-50 transition text-sm disabled:opacity-50"
            >
              {ativando === t.id ? "Ativando..." : "Ativar esta tarifa"}
            </button>
          )}
        </article>
      ))}

      {mostrarForm ? (
        <FormularioTarifa
          tarifa={editando}
          onCancelar={handleCancelar}
          onSalvo={handleSalvo}
        />
      ) : (
        <button
          onClick={handleNovaTarifa}
          className="w-full border-2 border-dashed border-gray-300 text-gray-500 font-semibold py-4 rounded-2xl hover:border-blue-400 hover:text-blue-600 transition"
        >
          + Nova Tarifa
        </button>
      )}
    </div>
  );
}
