import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

export default async function MensalistaPage() {
  const session = await auth();
  if (!session || session.user.perfil !== "MENSALISTA") redirect("/login");

  const mensalista = await prisma.mensalista.findFirst({
    where: { usuarioId: session.user.id },
    include: { veiculos: true },
  });

  if (!mensalista) redirect("/login");

  const hoje = new Date();
  const vencimento = new Date(mensalista.vencimento);
  const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  const vencido = diasRestantes < 0;
  const proximoVencer = diasRestantes >= 0 && diasRestantes <= 5;

  const ultimosTickets = await prisma.ticket.findMany({
    where: {
      veiculo: { mensalistaId: mensalista.id },
      status: "FECHADO",
    },
    orderBy: { saida: "desc" },
    take: 5,
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar nome={session.user.name ?? ""} perfil="MENSALISTA" />

      <main className="flex-1 p-4 max-w-lg mx-auto w-full space-y-4">
        <h1 className="text-xl font-bold text-gray-800">Meu Plano</h1>

        {/* Card do plano */}
        <div className={`rounded-2xl shadow p-5 text-white
          ${vencido ? "bg-red-600" : proximoVencer ? "bg-orange-500" : "bg-green-600"}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80">Plano</p>
              <p className="text-xl font-bold">{mensalista.plano}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Valor</p>
              <p className="text-xl font-bold">
                R$ {Number(mensalista.valor).toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/30">
            <p className="text-sm opacity-80">Vencimento</p>
            <p className="text-lg font-bold">
              {vencimento.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
            <p className="text-sm mt-1 font-medium">
              {vencido
                ? "⚠️ Plano vencido — entre em contato"
                : `✅ ${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""} restante${diasRestantes !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Veículos */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-bold text-gray-700 mb-3">Meus Veículos</h2>
          {mensalista.veiculos.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum veículo cadastrado.</p>
          ) : (
            <div className="space-y-2">
              {mensalista.veiculos.map((v) => (
                <div key={v.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <span className="text-2xl">🚗</span>
                  <div>
                    <p className="font-bold text-gray-800 tracking-widest">{v.placa}</p>
                    {v.descricao && <p className="text-xs text-gray-500">{v.descricao}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimas entradas */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-bold text-gray-700 mb-3">Últimas Entradas</h2>
          {ultimosTickets.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum registro encontrado.</p>
          ) : (
            <div className="space-y-3">
              {ultimosTickets.map((t) => (
                <div key={t.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(t.entrada).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(t.entrada).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      {t.saida && ` → ${new Date(t.saida).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">
                    Mensalista
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
