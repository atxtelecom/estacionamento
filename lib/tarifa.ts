import type { Tarifa } from "@prisma/client";

export interface ResultadoCalculo {
  valor: number;
  duracaoMinutos: number;
  duracaoFormatada: string;
  descricao: string;
}

export function calcularTarifa(tarifa: Tarifa, entrada: Date, saida: Date): ResultadoCalculo {
  const duracaoMs = saida.getTime() - entrada.getTime();
  const duracaoMinutos = Math.ceil(duracaoMs / 60000); // arredonda para cima
  const duracaoHoras = duracaoMinutos / 60;

  const valor1h = Number(tarifa.valor1h);
  const valorHoraExtra = Number(tarifa.valorHoraExtra);
  const valorDiaria = Number(tarifa.valorDiaria);
  const horasAteDiaria = tarifa.horasAteDiaria;

  let valor = 0;
  let descricao = "";

  // Mínimo de cobrança: 1 minuto = cobra a 1ª hora
  if (duracaoMinutos < 1) {
    return {
      valor: 0,
      duracaoMinutos: 0,
      duracaoFormatada: "0 min",
      descricao: "Sem cobrança",
    };
  }

  switch (tarifa.modalidade) {
    case "MISTA": {
      if (duracaoHoras >= horasAteDiaria) {
        // Cobra diária
        valor = valorDiaria;
        descricao = `Diária (${horasAteDiaria}h+)`;
      } else if (duracaoHoras <= 1) {
        // Dentro da 1ª hora
        valor = valor1h;
        descricao = "1ª hora";
      } else {
        // 1ª hora + horas extras (arredonda para cima)
        const horasExtras = Math.ceil(duracaoHoras - 1);
        valor = valor1h + horasExtras * valorHoraExtra;
        descricao = `1ª hora + ${horasExtras}h extra${horasExtras > 1 ? "s" : ""}`;
      }
      break;
    }

    case "POR_HORA": {
      if (duracaoHoras >= horasAteDiaria) {
        valor = valorDiaria;
        descricao = `Diária (${horasAteDiaria}h+)`;
      } else {
        const horas = Math.ceil(duracaoHoras);
        valor = horas * valor1h;
        descricao = `${horas}h × R$${valor1h.toFixed(2)}`;
      }
      break;
    }

    case "DIARIA_FIXA": {
      if (duracaoHoras >= horasAteDiaria) {
        valor = valorDiaria;
        descricao = `Diária fixa`;
      } else {
        const horas = Math.ceil(duracaoHoras);
        valor = horas * valor1h;
        descricao = `${horas}h × R$${valor1h.toFixed(2)}`;
      }
      break;
    }
  }

  return {
    valor: Math.round(valor * 100) / 100,
    duracaoMinutos,
    duracaoFormatada: formatarDuracao(duracaoMinutos),
    descricao,
  };
}

function formatarDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}
