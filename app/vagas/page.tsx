import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 30;

const ICONE: Record<string, string> = { CARRO: "🚗", MOTO: "🏍️", PCD: "♿" };
const LABEL: Record<string, string> = { CARRO: "Carros", MOTO: "Motos", PCD: "PCD" };

export default async function VagasPublicasPage() {
  const vagas = await prisma.vaga.findMany({
    where: { ativo: true },
    orderBy: { numero: "asc" },
  });

  const total = vagas.length;
  const livres = vagas.filter((v) => v.status === "LIVRE").length;
  const ocupacao = total > 0 ? Math.round(((total - livres) / total) * 100) : 0;

  const categorias = ["CARRO", "MOTO", "PCD"] as const;
  const porCategoria = categorias.map((cat) => ({
    cat,
    livres: vagas.filter((v) => v.categoria === cat && v.status === "LIVRE").length,
    total: vagas.filter((v) => v.categoria === cat).length,
  }));

  const corOcupacao =
    ocupacao >= 90 ? "text-red-600" : ocupacao >= 60 ? "text-orange-500" : "text-green-600";

  return (
    <main className="min-h-screen bg-blue-700 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Header */}
        <div className="text-center text-white mb-2">
          <h1 className="text-2xl font-bold">🅿️ Vagas Disponíveis</h1>
          <p className="text-blue-200 text-sm mt-1">Atualizado a cada 30 segundos</p>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
          <p className={`text-8xl font-black leading-none ${corOcupacao}`}>{livres}</p>
          <p className="text-gray-500 mt-2 text-lg">vagas livres</p>
          <p className="text-gray-400 text-sm">de {total} no total</p>

          {/* Barra de ocupação */}
          <div className="mt-4 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                ocupacao >= 90 ? "bg-red-500" : ocupacao >= 60 ? "bg-orange-400" : "bg-green-500"
              }`}
              style={{ width: `${ocupacao}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{ocupacao}% ocupado</p>
        </div>

        {/* Por categoria */}
        <div className="grid grid-cols-3 gap-3">
          {porCategoria.map(({ cat, livres: l, total: t }) => (
            <div key={cat} className="bg-white rounded-2xl shadow p-3 text-center">
              <p className="text-2xl">{ICONE[cat]}</p>
              <p className="text-2xl font-black text-gray-800 mt-1">{l}</p>
              <p className="text-xs text-gray-500">{LABEL[cat]}</p>
              <p className="text-xs text-gray-400">/{t}</p>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <Link href="/login" className="text-blue-200 text-sm hover:text-white transition">
            Acesso restrito →
          </Link>
        </div>
      </div>
    </main>
  );
}
