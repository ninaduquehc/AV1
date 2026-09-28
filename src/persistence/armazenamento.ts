import * as fs from "fs";
import * as caminho from "path";
import * as crypto from "crypto";
import { ARQ_CONFIG } from "../config/caminhos";

let chaveEmCache: Buffer | null = null;

function obterChave(): Buffer {
  if (chaveEmCache) return chaveEmCache;
  const configuracao = JSON.parse(fs.readFileSync(ARQ_CONFIG, "utf-8"));
  chaveEmCache = Buffer.from(configuracao.chaveAes, "hex");
  return chaveEmCache;
}

// Formato: iv:tag:conteudo (tudo em hexadecimal)
export function criptografar(dado: string): string {
  const iv = crypto.randomBytes(12);
  const cifra = crypto.createCipheriv("aes-256-gcm", obterChave(), iv);
  const cifrado = Buffer.concat([cifra.update(dado, "utf-8"), cifra.final()]);
  const tag = cifra.getAuthTag();
  return [iv, tag, cifrado].map((b) => b.toString("hex")).join(":");
}

export function descriptografar(dadoCriptografado: string): string {
  const partes = dadoCriptografado.trim().split(":");
  if (partes.length !== 3) throw new Error("Formato criptografado inválido.");

  const [iv, tag, cifrado] = partes.map((p) => Buffer.from(p, "hex"));
  const decifra = crypto.createDecipheriv("aes-256-gcm", obterChave(), iv);
  decifra.setAuthTag(tag);
  // final() lança erro se o conteúdo foi alterado
  return Buffer.concat([decifra.update(cifrado), decifra.final()]).toString("utf-8");
}

export function escreverAtomico(caminhoArquivo: string, conteudo: string): void {
  fs.mkdirSync(caminho.dirname(caminhoArquivo), { recursive: true });
  const caminhoTemp = caminhoArquivo + ".tmp";
  fs.writeFileSync(caminhoTemp, conteudo, { mode: 0o600 });
  fs.renameSync(caminhoTemp, caminhoArquivo);
}