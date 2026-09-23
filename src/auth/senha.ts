import * as crypto from "crypto";

export function gerarHash(senha: string): string {
  return crypto.createHash("sha256").update(senha).digest("hex");
}

//lógica de hash isolada, pra reutilizar no login depois