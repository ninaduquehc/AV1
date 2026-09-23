import * as readline from "readline";
import { estaProvisionado, provisionar, carregarConfiguracao } from "./config/provisionamento";
import { autenticar } from "./auth/login";
import { registrarAtividade, sessaoExpirada } from "./auth/sessao";
import { exibirMenu } from "./commands/menu";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function perguntar(pergunta: string): Promise<string> {
  return new Promise((resolver) => {
    rl.question(pergunta, (resposta) => resolver(resposta));
  });
}

async function loopMenu(papel: string) {
  while (true) {
    if (sessaoExpirada()) {
      console.log("Sessão expirada por inatividade. Faça login novamente.");
      break;
    }

    exibirMenu(papel);
    const escolha = await perguntar("Escolha uma opção: ");
    registrarAtividade();

    if (escolha === "0") {
      console.log("Encerrando sessão.");
      break;
    }

    console.log(`Opção "${escolha}" ainda não implementada.`);
  }
}

async function principal() {
  if (!estaProvisionado()) {
    console.log("Nenhuma configuração encontrada. Iniciando provisionamento...");
    const senhaAdmin = await perguntar("Defina a senha do administrador: ");
    provisionar(senhaAdmin);
  } else {
    console.log("Sistema configurado. Prosseguindo para login...");
    const configuracao = carregarConfiguracao();
    const usuario = await perguntar("Usuário: ");
    const senha = await perguntar("Senha: ");
    const autenticado = autenticar(usuario, senha, configuracao);

    if (autenticado) {
      console.log("Login realizado com sucesso.");
      registrarAtividade();
      await loopMenu(configuracao.admin.papel);
    } else {
      console.log("Usuário ou senha inválidos.");
    }
  }

  rl.close();
}

principal();