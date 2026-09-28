import { ContratoColeta } from "../models/contrato";
import { FabricaEntidades } from "../models/fabrica";
import { ARQ_CONTRATOS } from "../config/caminhos";
import { Repositorio } from "../persistence/repositorio";
import { registrarTransacao } from "../persistence/journal";
import { carregarOrganizacoes } from "./organizacoes";
import { parseData } from "../utils/datas";
import { log } from "../utils/logger";

const repositorio = new Repositorio<ContratoColeta>(ARQ_CONTRATOS, ContratoColeta.deJSON);

export function carregarContratos(): ContratoColeta[] {
  return repositorio.carregar();
}

export function cadastrarContrato(
  orgTexto: string,
  descricao: string,
  inicioTexto: string,
  fimTexto: string,
  usuarioLogado: string
): void {
  const orgId = orgTexto.trim().toUpperCase();
  const inicio = parseData(inicioTexto);
  const fim = parseData(fimTexto);

  if (!inicio || !fim) {
    log.erro("Datas inválidas. Use o formato AAAA-MM-DD.");
    return;
  }

  const contratos = repositorio.carregar();
  const contrato = FabricaEntidades.criarContrato(orgId, descricao.trim(), inicio, fim, contratos);

  const erros = contrato.errosDeValidacao();
  if (!carregarOrganizacoes().some((o) => o.id === orgId)) {
    erros.push(`Organização "${orgId}" não encontrada.`);
  }
  if (erros.length > 0) {
    erros.forEach((e) => log.erro(e));
    return;
  }

  registrarTransacao(usuarioLogado, "cadastrar_contrato", {
    id: contrato.id,
    orgId,
    descricao: contrato.descricao,
    vigenciaInicio: inicioTexto.trim(),
    vigenciaFim: fimTexto.trim(),
  });

  contratos.push(contrato);
  repositorio.salvar(contratos);
  log.sucesso(`Contrato ${contrato.id} cadastrado para a organização ${orgId}.`);
}