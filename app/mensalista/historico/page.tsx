import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

export default async function HistoricoPage() {
  const session = await auth();
  if (!session || session.user.perfil !== "MENSALISTA") redirect("/login");

  const mensalista = await prisma.mensalista.findFirst({
    where: { usuarioId: session.user.id },
    include: { veiculos: true },
  });

  if (!mensalista) redirect("/login");

  const tickets = await prisma.ticket.findMany({
    where: {
      veiculo: { mensalistaId: mensalista.id },
    },
    include: { vaga: true, veiculo: true },
    orderBy: { entrada: "desc" },
    take: 50,
  });

  const totalEntradas = tickets.length;
  const mesAtual = new Date().getMonth();
  const entradasMes = tickets.filter(
    (t) => new Date(t.entrada).getMonth() === mesAtual
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar nome={session.user.name ?? ""} perfil="MENSALISTA" />

      <main className="flex-1 p-4 max-w-lg mx-auto w-full space-y-4">
        <h1 className="text-xl font-bold text-gray-800">Histórico de Acessos</h1>

        {/* Resumo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-3xl font-black text-green-600">{entradasMes}</p>
            <p className="text-sm text-gray-500 mt-1">Entradas este mês</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-3xl font-black text-blue-600">{totalEntradas}</p>
            <p className="text-sm text-gray-500 mt-1">Total de entradas</p>
          </div>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-700">Últimas 50 entradas</h2>
          </div>

          {tickets.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">🅿️</p>
              <p className="text-sm">Nenhum acesso registrado ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {tickets.map((t) => {
                const duracaoMs = t.saida
                  ? new Date(t.saida).getTime() - new Date(t.entrada).getTime()
                  : null;
                const duracaoMin = duracaoMs ? Math.floor(duracaoMs / 60000) : null;
                const duracaoTexto = duracaoMin
                  ? duracaoMin < 60
                    ? `${duracaoMin}min`
                    : `${Math.floor(duracaoMin / 60)}h${duracaoMin % 60 > 0 ? ` ${duracaoMin % 60}min` : ""}`
                  : null;

                return (
                  <div key={t.id} className="px-4 py-3 flex items-center gap-3">
                    {/* Status */}
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status === "ABERTO" ? "bg-green-400" : "bg-gray-300"}`}
                      aria-label={t.status === "ABERTO" ? "Em andamento" : "Encerrado"}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800 text-sm font-mono tracking-wider">
                          {t.veiculo.placa}
                        </p>
                        <span className="text-xs text-gray-400">· Vaga {t.vaga.numero}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(t.entrada).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}{" "}
                        às{" "}
                        {new Date(t.entrada).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Duração / Status */}
                    <div className="text-right flex-shrink-0">
                      {t.status === "ABERTO" ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          Dentro
                        </span>
                      ) : duracaoTexto ? (
                        <span className="text-xs text-gray-500">{duracaoTexto}</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
