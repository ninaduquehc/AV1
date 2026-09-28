import * as fs from "fs";
import { ARQ_JOURNAL } from "../config/caminhos";

const TAMANHO_MAXIMO_JOURNAL_BYTES = 10 * 1024 * 1024; // 10MB
const RETENCAO_DIAS = 180;

export interface EntradaJournal {
  id: string;
  timestamp: string;
  usuario: string;
  acao: string;
  detalhes: Record<string, any>;
}

function verificarEAtuarRotacao(): void {
  if (!fs.existsSync(ARQ_JOURNAL)) return;

  const stats = fs.statSync(ARQ_JOURNAL);
  if (stats.size >= TAMANHO_MAXIMO_JOURNAL_BYTES) {
    const arquivoRotacionado = `${ARQ_JOURNAL}.${Date.now()}.bak`;
    fs.renameSync(ARQ_JOURNAL, arquivoRotacionado);
  }
}

export function registrarTransacao(usuario: string, acao: string, detalhes: Record<string, any>): void {
  verificarEAtuarRotacao();

  const entrada: EntradaJournal = {
    id: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    usuario,
    acao,
    detalhes,
  };

  const linha = JSON.stringify(entrada) + "\n";
  fs.appendFileSync(ARQ_JOURNAL, linha, "utf-8");
}

export function lerJournal(): EntradaJournal[] {
  if (!fs.existsSync(ARQ_JOURNAL)) return [];

  const conteudo = fs.readFileSync(ARQ_JOURNAL, "utf-8");
  const linhas = conteudo.split("\n").filter((l) => l.trim().length > 0);
  const limiteRetencao = new Date();
  limiteRetencao.setDate(limiteRetencao.getDate() - RETENCAO_DIAS);

  return linhas
    .map((l) => JSON.parse(l) as EntradaJournal)
    .filter((e) => new Date(e.timestamp) >= limiteRetencao);
}