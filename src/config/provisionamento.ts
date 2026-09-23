import * as fs from "fs";
import * as caminho from "path";
import * as crypto from "crypto";
import { gerarHash } from "../auth/senha";

const CAMINHO_CONFIG = caminho.join(__dirname, "..", "..", "data", "config.enc");

export function estaProvisionado(): boolean {
  return fs.existsSync(CAMINHO_CONFIG);
}

export function provisionar(senhaAdmin: string): void {
  const chaveAes = crypto.randomBytes(32).toString("hex");
  const hashSenha = gerarHash(senhaAdmin);

  const configuracao = {
    chaveAes: chaveAes,
    admin: {
      usuario: "admin",
      hashSenha: hashSenha,
    },
  };

  fs.writeFileSync(CAMINHO_CONFIG, JSON.stringify(configuracao));
  console.log("Provisionamento concluído. Administrador criado com sucesso.");
}