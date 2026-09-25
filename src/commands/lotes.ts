import * as fs from "fs";
import * as caminho from "path";
import { Lote } from "../models/lote";
import { criptografar, descriptografar, escreverAtomico } from "../persistence/armazenamento";
import { registrarTransacao } from "../persistence/journal";

const CAMINHO_LOTES = caminho.join(__dirname, "..", "..", "data", "lotes.enc");

function carregarLotes(): any[] {
  if (!fs.existsSync(CAMINHO_LOTES)) return [];
  const conteudoCriptografado = fs.readFileSync(CAMINHO_LOTES, "utf-8");
  const conteudo = descriptografar(conteudoCriptografado);
  return JSON.parse(conteudo);
}

export function registrarLote(org: string, nf: string, transportadora: string, dataEntradaTexto: string, usuarioLogado: string): void {
  const dataEntrada = new Date(dataEntradaTexto);
  const lote = new Lote(org, nf, transportadora, dataEntrada);

  if (!lote.validar()) {
    console.log("Data de entrada inválida (futura ou anterior a 90 dias). Registro não realizado.");
    return;
  }

  registrarTransacao(usuarioLogado, "registrar_lote", { org, nf, transportadora, dataEntradaTexto });

  const lotes = carregarLotes();
  lotes.push(lote);
  const conteudoCriptografado = criptografar(JSON.stringify(lotes));
  escreverAtomico(CAMINHO_LOTES, conteudoCriptografado);
  console.log(`Lote da organização "${org}" registrado com sucesso.`);
}