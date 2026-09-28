import { Lote } from "../models/lote";
import { FabricaEntidades } from "../models/fabrica";
import { ARQ_LOTES } from "../config/caminhos";
import { Repositorio } from "../persistence/repositorio";
import { registrarTransacao } from "../persistence/journal";
import { carregarOrganizacoes } from "./organizacoes";
import { parseData } from "../utils/datas";
import { log } from "../utils/logger";

const repositorio = new Repositorio<Lote>(ARQ_LOTES, Lote.deJSON);

export function carregarLotes(): Lote[] {
  return repositorio.carregar();
}

export function registrarLote(
  orgTexto: string,
  nf: string,
  transportadora: string,
  dataEntradaTexto: string,
  usuarioLogado: string
): void {
  const orgId = orgTexto.trim().toUpperCase();
  const dataEntrada = parseData(dataEntradaTexto);

  if (!dataEntrada) {
    log.erro("Data inválida. Use o formato AAAA-MM-DD.");
    return;
  }

  const lotes = repositorio.carregar();
  const lote = FabricaEntidades.criarLote(orgId, nf.trim(), transportadora.trim(), dataEntrada, lotes);

  const erros = lote.errosDeValidacao();
  if (!carregarOrganizacoes().some((o) => o.id === orgId)) {
    erros.push(`Organização "${orgId}" não encontrada.`);
  }
  if (lotes.some((l) => l.org === orgId && l.nf === lote.nf)) {
    erros.push("Já existe um lote com essa nota fiscal para a organização.");
  }
  if (erros.length > 0) {
    erros.forEach((e) => log.erro(e));
    return;
  }

  registrarTransacao(usuarioLogado, "registrar_lote", {
    id: lote.id,
    org: orgId,
    nf: lote.nf,
    transportadora: lote.transportadora,
    dataEntrada: dataEntradaTexto.trim(),
  });

  lotes.push(lote);
  repositorio.salvar(lotes);
  log.sucesso(`Lote ${lote.id} da organização ${orgId} registrado.`);
}