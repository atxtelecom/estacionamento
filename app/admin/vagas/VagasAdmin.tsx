"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarVaga, toggleVaga } from "./actions";

interface Vaga { id: string; numero: number; categoria: string; status: string; ativo: boolean; }

const ICONE: Record<string, string> = { CARRO: "🚗", MOTO: "🏍️", PCD: "♿" };
const COR_STATUS: Record<string, string> = {
  LIVRE: "bg-green-100 text-green-700 border-green-300",
  OCUPADA: "bg-red-100 text-red-700 border-red-300",
  INATIVA: "bg-gray-100 text-gray-400 border-gray-200",
  RESERVADA: "bg-yellow-100 text-yellow-700 border-yellow-300",
};

export default function VagasAdmin({ vagas: inicial }: { vagas: Vaga[] }) {
  const router = useRouter();
  const [vagas, setVagas] = useState(inicial);
  const [novaCategoria, setNovaCategoria] = useState("CARRO");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const ativas = vagas.filter((v) => v.ativo).length;
  const livres = vagas.filter((v) => v.status === "LIVRE").length;

  async function handleCriar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(""); setSucesso(""); setCarregando(true);
    const fd = new FormData(e.currentTarget);
    const res = await criarVaga(fd);
    setCarregando(false);
    if (res.erro) { setErro(res.erro); return; }
    setSucesso("Vaga criada!");
    router.refresh();
  }

  async function handleToggle(id: string, ativo: boolean) {
    const res = await toggleVaga(id, !ativo);
    if (res.erro) { setErro(res.erro); return; }
    setVagas((prev) => prev.map((v) =>
      v.id === id ? { ...v, ativo: !ativo, status: !ativo ? "LIVRE" : "INATIVA" } : v
    ));
  }

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl shadow p-3 text-center">
          <p className="text-2xl font-black text-gray-800">{vagas.length}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-3 text-center">
          <p className="text-2xl font-black text-blue-600">{ativas}</p>
          <p className="text-xs text-gray-500">Ativas</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-3 text-center">
          <p className="text-2xl font-black text-green-600">{livres}</p>
          <p className="text-xs text-gray-500">Livres</p>
        </div>
      </div>

      {(erro || sucesso) && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${erro ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
          {erro || sucesso}
        </div>
      )}

      {/* Nova vaga */}
      <form onSubmit={handleCriar} className="bg-white rounded-2xl shadow p-4 flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-600 block mb-1">Número</label>
          <input name="numero" type="number" min="1" max="999" required placeholder="Ex: 51"
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-base outline-none focus:border-blue-400 transition" />
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-600 block mb-1">Categoria</label>
          <select name="categoria" value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-base outline-none focus:border-blue-400 bg-white transition">
            <option value="CARRO">🚗 Carro</option>
            <option value="MOTO">🏍️ Moto</option>
            <option value="PCD">♿ PCD</option>
          </select>
        </div>
        <button type="submit" disabled={carregando}
          className="bg-blue-600 text-white font-bold px-4 py-3 rounded-xl whitespace-nowrap transition disabled:opacity-50 hover:bg-blue-700">
          + Criar
        </button>
      </form>

      {/* Mapa de vagas */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="font-bold text-gray-700 mb-3 text-sm">Vagas ({vagas.length})</h2>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {vagas.map((vaga) => (
            <button
              key={vaga.id}
              onClick={() => handleToggle(vaga.id, vaga.ativo)}
              title={`Vaga ${vaga.numero} — ${vaga.status} — clique para ${vaga.ativo ? "desativar" : "ativar"}`}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center border-2 text-xs font-bold transition active:scale-95
                ${COR_STATUS[vaga.status] ?? "bg-gray-100"} ${!vaga.ativo ? "opacity-50" : ""}`}
            >
              <span className="text-base leading-none">{ICONE[vaga.categoria]}</span>
              <span>{vaga.numero}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">Toque em uma vaga para ativar/desativar</p>
      </div>
    </div>
  );
}
