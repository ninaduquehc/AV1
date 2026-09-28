import * as readline from "readline";
import { sessaoExpirada, registrarAtividade } from "../auth/sessao";

export class SessaoExpiradaError extends Error {
  constructor() {
    super("Sessão expirada por inatividade.");
  }
}

export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: (line: string) => completadorAtual(line),
});

let completadorAtual: (line: string) => [string[], string] = () => [[], ""];

export function definirCompletador(fn: (line: string) => [string[], string]): void {
  completadorAtual = fn;
}

export function perguntar(promptTexto: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(promptTexto, (resposta) => {
      resolve(resposta);
    });
  });
}

export async function lerComando(promptTexto: string): Promise<string> {
  if (sessaoExpirada()) {
    throw new SessaoExpiradaError();
  }
  const resposta = await perguntar(promptTexto);
  registrarAtividade();
  return resposta;
}