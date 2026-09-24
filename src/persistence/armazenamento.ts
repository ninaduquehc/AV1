import * as fs from "fs";
import * as crypto from "crypto";
import { carregarConfiguracao } from "../config/provisionamento";

function obterChave(): Buffer {
  const configuracao = carregarConfiguracao();
  return Buffer.from(configuracao.chaveAes, "hex");
}

export function criptografar(dado: string): string {
  const chave = obterChave();
  const iv = crypto.randomBytes(16);
  const cifra = crypto.createCipheriv("aes-256-cbc", chave, iv);

  let criptografado = cifra.update(dado, "utf-8", "hex");
  criptografado += cifra.final("hex");

  return iv.toString("hex") + ":" + criptografado;
}

export function descriptografar(dadoCriptografado: string): string {
  const chave = obterChave();
  const [ivHex, textoCifrado] = dadoCriptografado.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decifra = crypto.createDecipheriv("aes-256-cbc", chave, iv);

  let descriptografado = decifra.update(textoCifrado, "hex", "utf-8");
  descriptografado += decifra.final("utf-8");

  return descriptografado;
}

export function escreverAtomico(caminhoArquivo: string, conteudo: string): void {
  const caminhoTemp = caminhoArquivo + ".tmp";
  fs.writeFileSync(caminhoTemp, conteudo);
  fs.renameSync(caminhoTemp, caminhoArquivo);
}