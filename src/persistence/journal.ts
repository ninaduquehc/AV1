import * as fs from "fs";
import * as caminho from "path";
import * as crypto from "crypto";
import { ARQ_JOURNAL } from "../config/caminhos";
import { criptografar, descriptografar } from "./armazenamento";

export interface RegistroJournal {
  timestamp: string;
  usuario: string;
  acao: string;
  detalhes: any;
  hashAnterior: string;
  hash: string;
}

const HASH_INICIAL = "0".repeat(64);

function calcularHash(r: Omit<RegistroJournal, "hash">): string {
  const base = r.hashAnterior + r.timestamp + r.usuario + r.acao + JSON.stringify(r.detalhes);
  return crypto.createHash("sha256").update(base).digest("hex");
}

function lerLinhas(): string[] {
  if (!fs.existsSync(ARQ_JOURNAL)) return [];
  return fs.readFileSync(ARQ_JOURNAL, "utf-8").split("\n").filter((l) => l.trim() !== "");
}

function ultimoHash(): string {
  const linhas = lerLinhas();
  if (linhas.length === 0) return HASH_INICIAL;
  const ultimo: RegistroJournal = JSON.parse(descriptografar(linhas[linhas.length - 1]));
  return ultimo.hash;
}

export function registrarTransacao(usuario: string, acao: string, detalhes: any): void {
  const parcial = {
    timestamp: new Date().toISOString(),
    usuario,
    acao,
    detalhes,
    hashAnterior: ultimoHash(),
  };
  const registro: RegistroJournal = { ...parcial, hash: calcularHash(parcial) };

  fs.mkdirSync(caminho.dirname(ARQ_JOURNAL), { recursive: true });
  fs.appendFileSync(ARQ_JOURNAL, criptografar(JSON.stringify(registro)) + "\n");
}

export function lerJournal(): RegistroJournal[] {
  return lerLinhas().map((linha) => JSON.parse(descriptografar(linha)));
}

// Retorna o índice do primeiro registro inválido, ou -1 se a cadeia está íntegra.
export function verificarIntegridadeJournal(): number {
  let esperado = HASH_INICIAL;
  const registros = lerJournal();

  for (let i = 0; i < registros.length; i++) {
    const { hash, ...resto } = registros[i];
    if (resto.hashAnterior !== esperado || calcularHash(resto) !== hash) return i;
    esperado = hash;
  }
  return -1;
}