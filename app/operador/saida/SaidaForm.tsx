"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { buscarTicketPorPlaca, registrarSaida } from "../actions";
import { TicketImpressao, BotaoImprimir } from "@/components/TicketImpressao";

type TicketInfo = {
  ticket: { id: string; placa: string; tipo: string; vaga: number; entrada: string };
  calculo: { valor: number; duracaoFormatada: string; descricao: string } | null;
};

type Comprovante = {
  placa: string; vaga: number; valor: number; tipo: string;
  entrada: string; saida: string; duracao: string;
};

type SaidaState = { erro?: string; sucesso?: boolean } & Partial<Comprovante>;

// Fora do componente — não recriados a cada render
const FORMAS = [
  { value: "DINHEIRO", label: "💵 Dinheiro" },
  { value: "PIX", label: "📱 PIX" },
  { value: "CARTAO_DEBITO", label: "💳 Débito" },
  { value: "CARTAO_CREDITO", label: "💳 Crédito" },
] as const;

function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function formatarValor(valor: number) {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

// Sub-componente isolado para evitar re-render do form de busca
function Comprovante({
  dados,
  onNovaSaida,
}: {
  dados: Comprovante;
  onNovaSaida: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="space-y-4"
    >
      <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-6 text-center space-y-3">
        <div className="text-5xl" aria-hidden="true">🏁</div>
        <h2 className="text-xl font-bold text-green-700">Saída Registrada!</h2>

        <dl className="bg-white rounded-xl p-4 text-left space-y-2 border border-green-200">
          {[
            { label: "Placa", value: <span className="font-black tracking-widest">{dados.placa}</span> },
            { label: "Vaga", value: <span className="font-bold">{dados.vaga}</span> },
            { label: "Entrada", value: `${formatarData(dados.entrada)} ${formatarHora(dados.entrada)}` },
            { label: "Saída", value: formatarHora(dados.saida) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <dt className="text-gray-500 text-sm">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
          <div className="border-t pt-2 mt-2 flex justify-between items-center">
            <dt className="text-gray-700 font-semibold">Total</dt>
            <dd className="text-2xl font-black text-green-600">
              {dados.tipo === "MENSALISTA" ? "Mensalista" : formatarValor(dados.valor)}
            </dd>
          </div>
        </dl>
      </div>

      <TicketImpressao
        tipo="saida"
        placa={dados.placa}
        vaga={dados.vaga}
        entrada={dados.entrada}
        saida={dados.saida}
        duracao={dados.duracao}
        valor={dados.valor}
        tipoVeiculo={dados.tipo}
      />

      <BotaoImprimir />

      <button
        onClick={onNovaSaida}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-lg transition"
      >
        Nova Saída
      </button>
    </div>
  );
}

export default function SaidaForm({ placaInicial = "" }: { placaInicial?: string }) {
  const [placa, setPlaca] = useState(placaInicial);
  const [buscando, setBuscando] = useState(false);
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [formaPagamento, setFormaPagamento] = useState<string>("DINHEIRO");
  const [errosBusca, setErroBusca] = useState("");
  const [comprovante, setComprovante] = useState<Comprovante | null>(null);

  const [saidaState, saidaAction, isSaidaPending] = useActionState<SaidaState, FormData>(
    registrarSaida,
    {}
  );

  // Processa resultado da saída quando state muda
  if (saidaState.sucesso && saidaState.placa && !comprovante) {
    setComprovante({
      placa: saidaState.placa,
      vaga: saidaState.vaga!,
      valor: saidaState.valor!,
      tipo: saidaState.tipo!,
      entrada: saidaState.entrada!,
      saida: saidaState.saida!,
      duracao: (saidaState as { duracao?: string }).duracao ?? "",
    });
    setTicketInfo(null);
    setPlaca("");
  }

  // Busca automática quando vem com placa da URL (toque no veículo do painel)
  useEffect(() => {
    if (placaInicial && !ticketInfo && !comprovante) {
      buscarTicketPorPlaca(placaInicial).then((resultado) => {
        if (resultado) setTicketInfo(resultado as TicketInfo);
        else setErroBusca(`Nenhuma entrada aberta para ${placaInicial}.`);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNovaSaida = useCallback(() => setComprovante(null), []);

  const handlePlacaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaca(e.target.value.toUpperCase());
  }, []);

  async function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    setErroBusca("");
    setTicketInfo(null);
    setBuscando(true);
    const resultado = await buscarTicketPorPlaca(placa);
    setBuscando(false);
    if (!resultado) {
      setErroBusca(`Nenhuma entrada aberta para ${placa}.`);
    } else {
      setTicketInfo(resultado as TicketInfo);
    }
  }

  if (comprovante) {
    return <Comprovante dados={comprovante} onNovaSaida={handleNovaSaida} />;
  }

  return (
    <div className="space-y-4">
      {/* Busca por placa */}
      <form onSubmit={handleBuscar} className="flex gap-2" aria-label="Buscar veículo">
        <label htmlFor="placa-busca" className="sr-only">Placa do veículo</label>
        <input
          id="placa-busca"
          type="text"
          value={placa}
          onChange={handlePlacaChange}
          placeholder="Digite a placa"
          maxLength={8}
          required
          autoCapitalize="characters"
          autoComplete="off"
          className="flex-1 border-2 border-gray-200 focus:border-orange-500 rounded-xl px-4 py-4 text-xl font-bold uppercase tracking-widest outline-none transition font-mono"
        />
        <button
          type="submit"
          disabled={buscando}
          aria-busy={buscando}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 rounded-xl text-base transition disabled:opacity-50 whitespace-nowrap"
        >
          {buscando ? "..." : "🔍 Buscar"}
        </button>
      </form>

      {errosBusca && (
        <p role="alert" aria-live="assertive" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          ⚠️ {errosBusca}
        </p>
      )}

      {/* Ticket encontrado */}
      {ticketInfo && (
        <form action={saidaAction} aria-label="Confirmar saída">
          <input type="hidden" name="ticketId" value={ticketInfo.ticket.id} />
          <input type="hidden" name="formaPagamento" value={formaPagamento} />

          <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
            {/* Cabeçalho do ticket */}
            <div className="bg-orange-50 p-4 border-b border-orange-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-black tracking-widest text-gray-800">
                    {ticketInfo.ticket.placa}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Vaga {ticketInfo.ticket.vaga} ·{" "}
                    {ticketInfo.ticket.tipo === "MENSALISTA" ? "Mensalista" : "Rotativo"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Entrada</p>
                  <time
                    dateTime={ticketInfo.ticket.entrada}
                    className="text-sm font-bold text-gray-700 block"
                  >
                    {formatarData(ticketInfo.ticket.entrada)}
                  </time>
                  <span className="text-sm font-bold text-gray-700">
                    {formatarHora(ticketInfo.ticket.entrada)}
                  </span>
                </div>
              </div>
            </div>

            {/* Valor calculado */}
            {ticketInfo.calculo && ticketInfo.ticket.tipo === "ROTATIVO" && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">{ticketInfo.calculo.descricao}</p>
                    <p className="text-xs text-gray-400">{ticketInfo.calculo.duracaoFormatada}</p>
                  </div>
                  <p className="text-3xl font-black text-green-600" aria-label={`Total: ${formatarValor(ticketInfo.calculo.valor)}`}>
                    {formatarValor(ticketInfo.calculo.valor)}
                  </p>
                </div>
              </div>
            )}

            {ticketInfo.ticket.tipo === "MENSALISTA" && (
              <p className="p-4 border-b border-gray-100 text-center text-lg font-bold text-purple-600">
                ✅ Mensalista — sem cobrança
              </p>
            )}

            {/* Forma de pagamento */}
            {ticketInfo.ticket.tipo === "ROTATIVO" && (
              <fieldset className="p-4 border-b border-gray-100">
                <legend className="text-sm font-semibold text-gray-700 mb-2">
                  Forma de pagamento
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {FORMAS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      aria-pressed={formaPagamento === f.value}
                      onClick={() => setFormaPagamento(f.value)}
                      className={`py-3 rounded-xl font-semibold text-sm border-2 transition
                        ${formaPagamento === f.value
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-orange-300"}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {saidaState.erro && (
              <p role="alert" aria-live="assertive" className="mx-4 mt-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
                ⚠️ {saidaState.erro}
              </p>
            )}

            <div className="p-4">
              <button
                type="submit"
                disabled={isSaidaPending}
                aria-busy={isSaidaPending}
                className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-5 rounded-xl text-xl transition disabled:opacity-50"
              >
                {isSaidaPending ? "Processando..." : "🏁 Confirmar Saída"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
