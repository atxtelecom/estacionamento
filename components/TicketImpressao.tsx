"use client";

import { useCallback } from "react";

interface TicketEntradaProps {
  tipo: "entrada";
  placa: string;
  vaga: number;
  entrada: string;
}

interface TicketSaidaProps {
  tipo: "saida";
  placa: string;
  vaga: number;
  entrada: string;
  saida: string;
  duracao: string;
  valor: number;
  tipoVeiculo: string;
  formaPagamento?: string;
}

type TicketProps = TicketEntradaProps | TicketSaidaProps;

const FORMA_LABEL: Record<string, string> = {
  DINHEIRO: "Dinheiro",
  PIX: "PIX",
  CARTAO_DEBITO: "Cartao Debito",
  CARTAO_CREDITO: "Cartao Credito",
};

function linha(char = "-", tamanho = 32) {
  return char.repeat(tamanho);
}

function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TicketImpressao(props: TicketProps) {
  const nomeEstacionamento = process.env.NEXT_PUBLIC_NOME_ESTACIONAMENTO ?? "ESTACIONAMENTO";

  return (
    <div
      id="ticket-print"
      style={{
        display: "none",
        fontFamily: "monospace",
        fontSize: "11pt",
        width: "72mm",
        lineHeight: 1.4,
      }}
    >
      {/* Cabeçalho */}
      <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "13pt" }}>
        {nomeEstacionamento}
      </p>
      <p style={{ textAlign: "center", fontSize: "9pt" }}>
        {props.tipo === "entrada" ? "*** ENTRADA ***" : "*** COMPROVANTE DE SAIDA ***"}
      </p>
      <p style={{ textAlign: "center" }}>{linha()}</p>

      {/* Dados */}
      <p>
        <strong>PLACA:</strong> {props.placa}
      </p>
      <p>
        <strong>VAGA: </strong> {props.vaga}
      </p>
      <p style={{ textAlign: "center" }}>{linha()}</p>

      {props.tipo === "entrada" ? (
        <>
          <p>
            <strong>ENTRADA:</strong> {formatarDataHora(props.entrada)}
          </p>
          <p style={{ textAlign: "center" }}>{linha()}</p>
          <p style={{ textAlign: "center", fontSize: "9pt" }}>
            Guarde este ticket.
          </p>
          <p style={{ textAlign: "center", fontSize: "9pt" }}>
            Apresente na saida.
          </p>
        </>
      ) : (
        <>
          <p>
            <strong>ENTRADA:</strong> {formatarDataHora(props.entrada)}
          </p>
          <p>
            <strong>SAIDA:  </strong> {formatarHora(props.saida)}
          </p>
          <p>
            <strong>TEMPO:  </strong> {props.duracao}
          </p>
          <p style={{ textAlign: "center" }}>{linha()}</p>

          {props.tipoVeiculo === "MENSALISTA" ? (
            <p style={{ textAlign: "center", fontWeight: "bold" }}>
              MENSALISTA - SEM COBRANCA
            </p>
          ) : (
            <>
              <p>
                <strong>PAGAMENTO:</strong>{" "}
                {FORMA_LABEL[props.formaPagamento ?? ""] ?? props.formaPagamento}
              </p>
              <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "14pt" }}>
                TOTAL: R$ {props.valor.toFixed(2).replace(".", ",")}
              </p>
            </>
          )}

          <p style={{ textAlign: "center" }}>{linha()}</p>
          <p style={{ textAlign: "center", fontSize: "9pt" }}>
            Obrigado pela preferencia!
          </p>
        </>
      )}

      {/* Rodapé */}
      <p style={{ textAlign: "center" }}>{linha()}</p>
      <p style={{ textAlign: "center", fontSize: "8pt" }}>
        {new Date().toLocaleString("pt-BR")}
      </p>
      <p style={{ marginTop: "8mm" }} />
    </div>
  );
}

// Botão que aciona a impressão
export function BotaoImprimir({
  children = "🖨️ Imprimir",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const handlePrint = useCallback(() => {
    // Torna o ticket visível antes de imprimir
    const ticket = document.getElementById("ticket-print");
    if (ticket) ticket.style.display = "block";

    window.print();

    // Oculta novamente após impressão
    setTimeout(() => {
      if (ticket) ticket.style.display = "none";
    }, 500);
  }, []);

  return (
    <button
      onClick={handlePrint}
      className={
        className ??
        "w-full border-2 border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
      }
    >
      {children}
    </button>
  );
}
