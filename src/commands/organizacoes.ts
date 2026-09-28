import { Organizacao } from "../models/organizacao";
import { FabricaEntidades } from "../models/fabrica";
import { ARQ_ORGANIZACOES } from "../config/caminhos";
import { Repositorio } from "../persistence/repositorio";
import { registrarTransacao } from "../persistence/journal";
import { log } from "../utils/logger";

const repositorio = new Repositorio<Organizacao>(ARQ_ORGANIZACOES, Organizacao.deJSON);

export function carregarOrganizacoes(): Organizacao[] {
  return repositorio.carregar();
}

export function cadastrarOrganizacao(cnpj: string, nome: string, usuarioLogado: string): void {
  const cnpjNumeros = cnpj.replace(/\D/g, ""); // com ou sem pontuação, é o mesmo CNPJ
  const organizacoes = repositorio.carregar();
  const organizacao = FabricaEntidades.criarOrganizacao(cnpjNumeros, nome.trim(), organizacoes);

  const erros = organizacao.errosDeValidacao();
  if (organizacoes.some((o) => o.cnpj === organizacao.cnpj)) {
    erros.push("Já existe uma organização cadastrada com esse CNPJ.");
  }
  if (erros.length > 0) {
    erros.forEach((e) => log.erro(e));
    return;
  }

  registrarTransacao(usuarioLogado, "cadastrar_organizacao", {
    id: organizacao.id,
    cnpj: cnpjNumeros,
    nome: organizacao.nome,
  });

  organizacoes.push(organizacao);
  repositorio.salvar(organizacoes);
  log.sucesso(`Organização "${organizacao.nome}" cadastrada com ID ${organizacao.id}.`);
}