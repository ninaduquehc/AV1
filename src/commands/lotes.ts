import * as fs from "fs";
import * as caminho from "path";
import { Lote } from "../models/lote";

const CAMINHO_LOTES = caminho.join(__dirname, "..", "..", "data", "lotes.json");

function carregarLotes(): any[] {
  if (!fs.existsSync(CAMINHO_LOTES)) return [];
  const conteudo = fs.readFileSync(CAMINHO_LOTES, "utf-8");
  return JSON.parse(conteudo);
}

export function registrarLote(org: string, nf: string, transportadora: string, dataEntradaTexto: string): void {
  const dataEntrada = new Date(dataEntradaTexto);
  const lote = new Lote(org, nf, transportadora, dataEntrada);

  if (!lote.validar()) {
    console.log("Data de entrada inválida (futura ou anterior a 90 dias). Registro não realizado.");
    return;
  }

  const lotes = carregarLotes();
  lotes.push(lote);
  fs.writeFileSync(CAMINHO_LOTES, JSON.stringify(lotes));
  console.log(`Lote da organização "${org}" registrado com sucesso.`);
}