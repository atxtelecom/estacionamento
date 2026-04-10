"use client";

import { useActionState, useState } from "react";
import { criarMensalista, renovarPlano, alterarStatus } from "./actions";
import type { ActionState } from "./actions";

type StatusMensalista = "ATIVO" | "INADIMPLENTE" | "BLOQUEADO" | "CANCELADO";

interface Veiculo { placa: string; descricao: string | null }
interface Mensalista {
  id: string; nome: string; cpf: string; telefone: string | null;
  plano: string; valor: number; vencimento: string; status: string;
  veiculos: Veiculo[];
}

const STATUS_COR: Record<string, string> = {
  ATIVO: "bg-green-100 text-green-700",
  INADIMPLENTE: "bg-orange-100 text-orange-700",
  BLOQUEADO: "bg-red-100 text-red-700",
  CANCELADO: "bg-gray-100 text-gray-500",
};

const STATUS_LABEL: Record<string, string> = {
  ATIVO: "Ativo", INADIMPLENTE: "Inadimplente", BLOQUEADO: "Bloqueado", CANCELADO: "Cancelado",
};

function NovoMensalistaForm({ onConcluido }: { onConcluido: () => void }) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(criarMensalista, {});

  if (state.sucesso) {
    return (
      <div className="bg-green-50 border border-green-300 rounded-2xl p-4 text-center space-y-3">
        <p className="text-green-700 font-semibold">✅ {state.sucesso}</p>
        <button onClick={onConcluido} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl">
          Fechar
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="bg-white rounded-2xl shadow border-2 border-blue-200 p-4 space-y-3">
      <h2 className="font-bold text-gray-700">Novo Mensalista</h2>

      {state.erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
          ⚠️ {state.erro}
        </div>
      )}

      {[
        { name: "nome", label: "Nome completo", type: "text", required: true },
        { name: "cpf", label: "CPF (só números)", type: "text", required: true, maxLength: 11 },
        { name: "email", label: "Email (login)", type: "email", required: true },
        { name: "telefone", label: "Telefone", type: "tel", required: false },
      ].map((f) => (
        <div key={f.name}>
          <label className="text-xs font-semibold text-gray-600 block mb-1">{f.label}</label>
          <input
            name={f.name} type={f.type} required={f.required} maxLength={f.maxLength}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-base outline-none focus:border-blue-400 transition"
          />
        </div>
      ))}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Plano</label>
          <select name="plano" className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-base outline-none focus:border-blue-400 bg-white transition">
            <option>Mensal Carro</option>
            <option>Mensal Moto</option>
            <option>Mensal PCD</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Valor (R$)</label>
          <input name="valor" type="number" step="0.01" min="0" required defaultValue="180"
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-base outline-none focus:border-blue-400 transition" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">Vencimento</label>
        <input name="vencimento" type="date" required
          defaultValue={new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]}
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-base outline-none focus:border-blue-400 transition" />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">
          Placas <span className="text-gray-400 font-normal">(separadas por vírgula)</span>
        </label>
        <input name="placas" type="text" placeholder="ABC1234, DEF5678"
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-base uppercase outline-none focus:border-blue-400 transition" />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={isPending}
          className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 hover:bg-blue-700">
          {isPending ? "Salvando..." : "Cadastrar"}
        </button>
        <button type="button" onClick={onConcluido}
          className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function RenovarForm({ mensalista, onConcluido }: { mensalista: Mensalista; onConcluido: () => void }) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(renovarPlano, {});

  if (state.sucesso) {
    return (
      <div className="bg-green-50 border border-green-300 rounded-2xl p-4 text-center space-y-3">
        <p className="text-green-700 font-semibold">✅ {state.sucesso}</p>
        <button onClick={onConcluido} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl">Fechar</button>
      </div>
    );
  }

  return (
    <form action={action} className="bg-white rounded-2xl shadow border-2 border-purple-200 p-4 space-y-3">
      <h2 className="font-bold text-gray-700">Renovar Plano — {mensalista.nome}</h2>
      <input type="hidden" name="id" value={mensalista.id} />
      <p className="text-sm text-gray-500">
        Vencimento atual: <strong>{new Date(mensalista.vencimento).toLocaleDateString("pt-BR")}</strong>
      </p>
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">Renovar por</label>
        <select name="meses" className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-base outline-none focus:border-purple-400 bg-white transition">
          <option value="1">1 mês</option>
          <option value="3">3 meses</option>
          <option value="6">6 meses</option>
          <option value="12">12 meses</option>
        </select>
      </div>
      {state.erro && <p className="text-red-600 text-sm">⚠️ {state.erro}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={isPending}
          className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
          {isPending ? "Renovando..." : "Confirmar"}
        </button>
        <button type="button" onClick={onConcluido}
          className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function MensalistasLista({ mensalistas: inicial }: { mensalistas: Mensalista[] }) {
  const [mensalistas, setMensalistas] = useState(inicial);
  const [modo, setModo] = useState<"lista" | "novo" | { renovar: Mensalista }>("lista");
  const [expandido, setExpandido] = useState<string | null>(null);

  async function handleAlterarStatus(id: string, status: StatusMensalista) {
    await alterarStatus(id, status);
    setMensalistas((prev) => prev.map((m) => m.id === id ? { ...m, status } : m));
  }

  const diasRestantes = (vencimento: string) =>
    Math.ceil((new Date(vencimento).getTime() - Date.now()) / 86400000);

  if (modo === "novo") {
    return <NovoMensalistaForm onConcluido={() => { setModo("lista"); window.location.reload(); }} />;
  }
  if (typeof modo === "object" && "renovar" in modo) {
    return <RenovarForm mensalista={modo.renovar} onConcluido={() => { setModo("lista"); window.location.reload(); }} />;
  }

  return (
    <div className="space-y-3">
      {mensalistas.map((m) => {
        const dias = diasRestantes(m.vencimento);
        const aberto = expandido === m.id;

        return (
          <div key={m.id} className={`bg-white rounded-2xl shadow border-2 overflow-hidden transition
            ${m.status === "INADIMPLENTE" ? "border-orange-300" : m.status === "BLOQUEADO" ? "border-red-300" : "border-transparent"}`}>

            {/* Header do card — toque para expandir */}
            <button
              onClick={() => setExpandido(aberto ? null : m.id)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">{m.nome}</p>
                <p className="text-xs text-gray-500">{m.plano} · {m.veiculos.map((v) => v.placa).join(", ") || "Sem placa"}</p>
              </div>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COR[m.status]}`}>
                  {STATUS_LABEL[m.status]}
                </span>
                <span className="text-gray-400 text-sm">{aberto ? "▲" : "▼"}</span>
              </div>
            </button>

            {/* Detalhes expandidos */}
            {aberto && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">CPF</p>
                    <p className="font-medium">{m.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Telefone</p>
                    <p className="font-medium">{m.telefone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Valor</p>
                    <p className="font-bold text-gray-800">R$ {m.valor.toFixed(2).replace(".", ",")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Vencimento</p>
                    <p className={`font-bold ${dias < 0 ? "text-red-600" : dias <= 5 ? "text-orange-500" : "text-gray-800"}`}>
                      {new Date(m.vencimento).toLocaleDateString("pt-BR")}
                      <span className="text-xs font-normal ml-1">
                        {dias < 0 ? `(${Math.abs(dias)}d atrás)` : dias === 0 ? "(hoje)" : `(${dias}d)`}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setModo({ renovar: m })}
                    className="bg-purple-600 text-white font-semibold py-2.5 rounded-xl text-sm transition hover:bg-purple-700"
                  >
                    📅 Renovar
                  </button>

                  {m.status !== "BLOQUEADO" ? (
                    <button
                      onClick={() => handleAlterarStatus(m.id, "BLOQUEADO")}
                      className="border-2 border-red-300 text-red-600 font-semibold py-2.5 rounded-xl text-sm transition hover:bg-red-50"
                    >
                      🚫 Bloquear
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAlterarStatus(m.id, "ATIVO")}
                      className="border-2 border-green-300 text-green-600 font-semibold py-2.5 rounded-xl text-sm transition hover:bg-green-50"
                    >
                      ✅ Reativar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={() => setModo("novo")}
        className="w-full border-2 border-dashed border-gray-300 text-gray-500 font-semibold py-4 rounded-2xl hover:border-blue-400 hover:text-blue-600 transition"
      >
        + Novo Mensalista
      </button>
    </div>
  );
}
