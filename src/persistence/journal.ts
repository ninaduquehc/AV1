import * as fs from "fs";
import * as caminho from "path";

const CAMINHO_JOURNAL = caminho.join(__dirname, "..", "..", "data", "journal.log");

export function registrarTransacao(usuario: string, acao: string, detalhes: any): void {
  const registro = {
    timestamp: new Date().toISOString(),
    usuario: usuario,
    acao: acao,
    detalhes: detalhes,
  };

  fs.appendFileSync(CAMINHO_JOURNAL, JSON.stringify(registro) + "\n");
}

export function lerJournal(): any[] {
  if (!fs.existsSync(CAMINHO_JOURNAL)) return [];

  const conteudo = fs.readFileSync(CAMINHO_JOURNAL, "utf-8");
  const linhas = conteudo.split("\n").filter((linha) => linha.trim() !== "");

  return linhas.map((linha) => JSON.parse(linha));
}