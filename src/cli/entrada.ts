import * as readline from "readline";
import * as fs from "fs";
import * as caminho from "path";
import { DIR_DATA } from "../config/caminhos";
import { registrarAtividade, sessaoExpirada } from "../auth/sessao";

const ARQ_HISTORICO = caminho.join(DIR_DATA, "historico_cli.txt");
const LIMITE_HISTORICO = 200;

export class SessaoExpiradaError extends Error {}

// Do mais antigo para o mais recente.
let historico: string[] = carregarHistorico();

function carregarHistorico(): string[] {
  try {
    return fs
      .readFileSync(ARQ_HISTORICO, "utf-8")
      .split("\n")
      .filter((linha) => linha.trim() !== "");
  } catch {
    return [];
  }
}

function salvarNoHistorico(linha: string): void {
  const limpa = linha.trim();
  if (!limpa) return;

  historico = historico.filter((l) => l !== limpa);
  historico.push(limpa);
  historico = historico.slice(-LIMITE_HISTORICO);

  try {
    fs.mkdirSync(DIR_DATA, { recursive: true });
    fs.writeFileSync(ARQ_HISTORICO, historico.join("\n") + "\n");
  } catch {
    // Histórico é conveniência: falha ao gravar não deve derrubar o programa.
  }
}

// O completador só é conhecido depois do login (depende do papel).
let completador: (linha: string) => [string[], string] = (linha) => [[], linha];

export function definirCompletador(fn: (linha: string) => [string[], string]): void {
  completador = fn;
}

export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  history: [...historico].reverse(), // readline espera o mais recente primeiro
  historySize: LIMITE_HISTORICO,
  removeHistoryDuplicates: true,
  completer: (linha: string) => completador(linha),
});

rl.on("SIGINT", () => {
  console.log("\nEncerrando.");
  process.exit(0);
});

// Respostas a perguntas (senhas, dados de formulário) não podem ficar no histórico.
function removerDoHistoricoEmMemoria(linha: string): void {
  const h = (rl as any).history;
  if (Array.isArray(h) && h[0] === linha) h.shift();
}

export function perguntar(pergunta: string): Promise<string> {
  return new Promise((resolver) => {
    rl.question(pergunta, (resposta) => {
      removerDoHistoricoEmMemoria(resposta);
      resolver(resposta);
    });
  });
}

// Confere a expiração DEPOIS de a pessoa responder, cobrindo o tempo parado no prompt.
export async function perguntarNaSessao(pergunta: string): Promise<string> {
  const resposta = await perguntar(pergunta);
  if (sessaoExpirada()) throw new SessaoExpiradaError();
  registrarAtividade();
  return resposta;
}

// Lê uma linha de comando: é a única entrada que vai para o histórico persistente.
export async function lerComando(prompt: string): Promise<string> {
  const linha = await new Promise<string>((resolver) => rl.question(prompt, resolver));
  if (sessaoExpirada()) throw new SessaoExpiradaError();
  registrarAtividade();
  salvarNoHistorico(linha);
  return linha;
}