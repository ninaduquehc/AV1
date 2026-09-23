import * as readline from "readline";
import { estaProvisionado, provisionar } from "./config/provisionamento";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function perguntar(pergunta: string): Promise<string> {
  return new Promise((resolver) => {
    rl.question(pergunta, (resposta) => resolver(resposta));
  });
}

async function principal() {
  if (!estaProvisionado()) {
    console.log("Nenhuma configuração encontrada. Iniciando provisionamento...");
    const senhaAdmin = await perguntar("Defina a senha do administrador: ");
    provisionar(senhaAdmin);
  } else {
    console.log("Sistema configurado. Prosseguindo para login...");
  }
  rl.close();
}

principal();