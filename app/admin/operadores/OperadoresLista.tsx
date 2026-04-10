"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { criarOperador, toggleOperador, redefinirSenha } from "./actions";
import type { OperadorState } from "./actions";

interface Operador {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  criadoEm: string;
}

function NovoOperadorForm({ onConcluido }: { onConcluido: () => void }) {
  const [state, action, isPending] = useActionState<OperadorState, FormData>(criarOperador, {});

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
      <h2 className="font-bold text-gray-700">Novo Operador</h2>

      {state.erro && (
        <p role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
          ⚠️ {state.erro}
        </p>
      )}

      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">Nome completo</label>
        <input name="nome" type="text" required
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-base outline-none focus:border-blue-400 transition" />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">Email</label>
        <input name="email" type="email" required
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-base outline-none focus:border-blue-400 transition" />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">Senha (mín. 6 caracteres)</label>
        <input name="senha" type="password" required minLength={6}
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-base outline-none focus:border-blue-400 transition" />
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

function RedefinirSenhaForm({ operador, onConcluido }: { operador: Operador; onConcluido: () => void }) {
  const [state, action, isPending] = useActionState<OperadorState, FormData>(redefinirSenha, {});

  if (state.sucesso) {
    return (
      <div className="bg-green-50 border border-green-300 rounded-2xl p-4 text-center space-y-3">
        <p className="text-green-700 font-semibold">✅ {state.sucesso}</p>
        <button onClick={onConcluido} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl">Fechar</button>
      </div>
    );
  }

  return (
    <form action={action} className="bg-white rounded-2xl shadow border-2 border-yellow-200 p-4 space-y-3">
      <h2 className="font-bold text-gray-700">Redefinir Senha — {operador.nome}</h2>
      <input type="hidden" name="id" value={operador.id} />

      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">Nova senha (mín. 6 caracteres)</label>
        <input name="senha" type="password" required minLength={6}
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-base outline-none focus:border-yellow-400 transition" />
      </div>

      {state.erro && <p className="text-red-600 text-sm">⚠️ {state.erro}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={isPending}
          className="flex-1 bg-yellow-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
          {isPending ? "Salvando..." : "Redefinir"}
        </button>
        <button type="button" onClick={onConcluido}
          className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function OperadoresLista({ operadores: inicial }: { operadores: Operador[] }) {
  const router = useRouter();
  const [modo, setModo] = useState<"lista" | "novo" | { senha: Operador }>("lista");
  const [operadores, setOperadores] = useState(inicial);
  const [expandido, setExpandido] = useState<string | null>(null);

  async function handleToggle(id: string, ativo: boolean) {
    const res = await toggleOperador(id, !ativo);
    if (res.erro) { alert(res.erro); return; }
    setOperadores((prev) => prev.map((o) => o.id === id ? { ...o, ativo: !ativo } : o));
  }

  const concluido = () => { setModo("lista"); router.refresh(); };

  if (modo === "novo") return <NovoOperadorForm onConcluido={concluido} />;
  if (typeof modo === "object" && "senha" in modo) {
    return <RedefinirSenhaForm operador={modo.senha} onConcluido={concluido} />;
  }

  const ativos = operadores.filter((o) => o.ativo).length;
  const inativos = operadores.filter((o) => !o.ativo).length;

  return (
    <div className="space-y-3">
      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-green-600">{ativos}</p>
          <p className="text-xs text-gray-500">Ativos</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-gray-400">{inativos}</p>
          <p className="text-xs text-gray-500">Inativos</p>
        </div>
      </div>

      {/* Lista */}
      {operadores.map((o) => {
        const aberto = expandido === o.id;
        return (
          <div key={o.id} className={`bg-white rounded-2xl shadow border-2 overflow-hidden transition
            ${!o.ativo ? "border-gray-200 opacity-60" : "border-transparent"}`}>

            <button
              onClick={() => setExpandido(aberto ? null : o.id)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">{o.nome}</p>
                <p className="text-xs text-gray-500 truncate">{o.email}</p>
              </div>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${o.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {o.ativo ? "Ativo" : "Inativo"}
                </span>
                <span className="text-gray-400 text-sm">{aberto ? "▲" : "▼"}</span>
              </div>
            </button>

            {aberto && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400">
                  Criado em {new Date(o.criadoEm).toLocaleDateString("pt-BR")}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setModo({ senha: o })}
                    className="border-2 border-yellow-300 text-yellow-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-yellow-50 transition"
                  >
                    🔑 Senha
                  </button>

                  {o.ativo ? (
                    <button
                      onClick={() => handleToggle(o.id, o.ativo)}
                      className="border-2 border-red-300 text-red-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-red-50 transition"
                    >
                      🚫 Desativar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggle(o.id, o.ativo)}
                      className="border-2 border-green-300 text-green-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-green-50 transition"
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
        + Novo Operador
      </button>
    </div>
  );
}
