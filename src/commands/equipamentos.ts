import { Equipamento } from "../models/equipamento";
import { FabricaEntidades } from "../models/fabrica";
import { RegraDeNegocioError } from "../models/erros";
import { ARQ_EQUIPAMENTOS } from "../config/caminhos";
import { Repositorio } from "../persistence/repositorio";
import { registrarTransacao } from "../persistence/journal";
import { carregarLotes } from "./lotes";
import { registrarMovimentacao } from "./movimentacoes";
import { comTratamento } from "../utils/tratamento";
import { log } from "../utils/logger";

const repositorio = new Repositorio<Equipamento>(ARQ_EQUIPAMENTOS, Equipamento.deJSON);

export function carregarEquipamentos(): Equipamento[] {
  return repositorio.carregar();
}

export function cadastrarEquipamento(
  idTexto: string,
  loteTexto: string,
  estadoTexto: string,
  usuarioLogado: string
): void {
  const id = idTexto.trim();
  const loteId = loteTexto.trim().toUpperCase();
  const estado = estadoTexto.trim().toLowerCase();

  const equipamentos = repositorio.carregar();
  const equipamento = FabricaEntidades.criarEquipamento(id, loteId, estado, equipamentos);

  const erros = equipamento.errosDeValidacao();
  if (!carregarLotes().some((l) => l.id === loteId)) {
    erros.push(`Lote "${loteId}" não encontrado.`);
  }
  if (equipamentos.some((e) => e.id === id)) {
    erros.push(`Já existe um equipamento com ID "${id}".`);
  }
  if (erros.length > 0) {
    erros.forEach((e) => log.erro(e));
    return;
  }

  registrarTransacao(usuarioLogado, "cadastrar_equipamento", {
    id,
    loteId,
    estadoFisico: estado,
    codigoBarras: equipamento.codigoBarras,
  });

  equipamentos.push(equipamento);
  repositorio.salvar(equipamentos);
  registrarMovimentacao(id, "cadastro", "-", equipamento.status, usuarioLogado, null);
  log.sucesso(`Equipamento "${id}" cadastrado. Código de barras: ${equipamento.codigoBarras}.`);
}

function transicionarStatus(
  idTexto: string,
  usuarioLogado: string,
  acaoJournal: string,
  tipoMovimentacao: string,
  aplicar: (equipamento: Equipamento) => void,
  mensagemSucesso: (id: string) => string
): void {
  comTratamento(() => {
    const equipamentos = repositorio.carregar();
    const equipamento = equipamentos.find((e) => e.id === idTexto.trim());
    if (!equipamento) throw new RegraDeNegocioError("Equipamento não encontrado.");

    const statusAnterior = equipamento.status;
    aplicar(equipamento); // lança erro se a regra for violada (nada foi gravado ainda)

    registrarTransacao(usuarioLogado, acaoJournal, {
      id: equipamento.id,
      de: statusAnterior,
      para: equipamento.status,
    });

    repositorio.salvar(equipamentos);
    registrarMovimentacao(equipamento.id, tipoMovimentacao, statusAnterior, equipamento.status, usuarioLogado, null);
    log.sucesso(mensagemSucesso(equipamento.id));
  });
}

export function concluirTriagemEquipamento(id: string, usuarioLogado: string): void {
  transicionarStatus(
    id,
    usuarioLogado,
    "concluir_triagem",
    "triagem",
    (e) => e.concluirTriagem(),
    (eid) => `Triagem do equipamento "${eid}" concluída.`
  );
}

export function moverEquipamentoParaDesmonte(id: string, usuarioLogado: string): void {
  transicionarStatus(
    id,
    usuarioLogado,
    "mover_para_desmonte",
    "desmonte",
    (e) => e.moverParaDesmonte(),
    (eid) => `Equipamento "${eid}" movido para desmonte.`
  );
}

export function alterarEstadoFisicoEquipamento(
  idTexto: string,
  novoEstadoTexto: string,
  justificativaTexto: string,
  usuarioLogado: string
): void {
  comTratamento(() => {
    const equipamentos = repositorio.carregar();
    const equipamento = equipamentos.find((e) => e.id === idTexto.trim());
    if (!equipamento) throw new RegraDeNegocioError("Equipamento não encontrado.");

    const novoEstado = novoEstadoTexto.trim().toLowerCase();
    const justificativa = justificativaTexto.trim() === "" ? null : justificativaTexto.trim();
    const estadoAnterior = equipamento.estadoFisico;

    equipamento.alterarEstadoFisico(novoEstado, justificativa);

    registrarTransacao(usuarioLogado, "alterar_estado_fisico", {
      id: equipamento.id,
      de: estadoAnterior,
      para: novoEstado,
      justificativa,
    });

    repositorio.salvar(equipamentos);
    registrarMovimentacao(equipamento.id, "estado_fisico", estadoAnterior, novoEstado, usuarioLogado, justificativa);
    log.sucesso(`Estado físico de "${equipamento.id}" alterado: ${estadoAnterior} → ${novoEstado}.`);
  });
}