import { ARQ_PARAMETROS } from "../config/caminhos";
import { Repositorio } from "../persistence/repositorio";
import { registrarTransacao } from "../persistence/journal";
import { log } from "../utils/logger";

export interface ParametrosGlobais {
  aliquotaImposto: number; // percentual
  coeficienteDepreciacao: number; // percentual
}

const repositorio = new Repositorio<ParametrosGlobais>(ARQ_PARAMETROS);

export function obterParametros(): ParametrosGlobais {
  return repositorio.carregar()[0] ?? { aliquotaImposto: 0, coeficienteDepreciacao: 0 };
}

function lerPercentual(texto: string): number | null {
  const limpo = texto.trim().replace(",", ".");
  if (limpo === "") return null;
  const numero = Number(limpo);
  return Number.isFinite(numero) && numero >= 0 && numero <= 100 ? numero : null;
}

export function configurarParametros(
  aliquotaTexto: string,
  coeficienteTexto: string,
  usuarioLogado: string
): void {
  const aliquota = lerPercentual(aliquotaTexto);
  const coeficiente = lerPercentual(coeficienteTexto);

  if (aliquota === null || coeficiente === null) {
    log.erro("Informe valores numéricos entre 0 e 100.");
    return;
  }

  registrarTransacao(usuarioLogado, "configurar_parametros", {
    aliquotaImposto: aliquota,
    coeficienteDepreciacao: coeficiente,
  });

  repositorio.salvar([{ aliquotaImposto: aliquota, coeficienteDepreciacao: coeficiente }]);
  log.sucesso(`Parâmetros atualizados: alíquota ${aliquota}%, depreciação ${coeficiente}%.`);
}