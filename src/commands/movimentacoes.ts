import { Movimentacao } from "../models/movimentacao";
import { ARQ_MOVIMENTACOES } from "../config/caminhos";
import { Repositorio } from "../persistence/repositorio";

const repositorio = new Repositorio<Movimentacao>(ARQ_MOVIMENTACOES);

export function registrarMovimentacao(
  equipamentoId: string,
  tipo: string,
  de: string,
  para: string,
  usuario: string,
  justificativa: string | null
): void {
  const lista = repositorio.carregar();
  lista.push({
    timestamp: new Date().toISOString(),
    equipamentoId,
    tipo,
    de,
    para,
    usuario,
    justificativa,
  });
  repositorio.salvar(lista);
}

export function listarMovimentacoes(equipamentoId?: string): Movimentacao[] {
  const lista = repositorio.carregar();
  return equipamentoId ? lista.filter((m) => m.equipamentoId === equipamentoId) : lista;
}