import * as fs from "fs";
import * as caminho from "path";
import { Organizacao } from "../models/organizacao";
import { criptografar, descriptografar, escreverAtomico } from "../persistence/armazenamento";

const CAMINHO_ORGANIZACOES = caminho.join(__dirname, "..", "..", "data", "organizacoes.enc");

function carregarOrganizacoes(): Organizacao[] {
  if (!fs.existsSync(CAMINHO_ORGANIZACOES)) return [];
  const conteudoCriptografado = fs.readFileSync(CAMINHO_ORGANIZACOES, "utf-8");
  const conteudo = descriptografar(conteudoCriptografado);
  return JSON.parse(conteudo);
}

export function cadastrarOrganizacao(cnpj: string, nome: string): void {
  const organizacao = new Organizacao(cnpj, nome);

  if (!organizacao.validar()) {
    console.log("CNPJ inválido. Cadastro não realizado.");
    return;
  }

  const organizacoes = carregarOrganizacoes();

  const jaExiste = organizacoes.some((o: any) => o.cnpj === organizacao.cnpj);
  if (jaExiste) {
    console.log("Já existe uma organização cadastrada com esse CNPJ.");
    return;
  }

  organizacoes.push(organizacao);
  const conteudoCriptografado = criptografar(JSON.stringify(organizacoes));
  escreverAtomico(CAMINHO_ORGANIZACOES, conteudoCriptografado);
  console.log(`Organização "${nome}" cadastrada com sucesso.`);
}