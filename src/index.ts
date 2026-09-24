import * as readline from "readline";
import { estaProvisionado, provisionar, carregarConfiguracao } from "./config/provisionamento";
import { autenticar } from "./auth/login";
import { registrarAtividade, sessaoExpirada } from "./auth/sessao";
import { exibirMenu } from "./commands/menu";
import { criarUsuario } from "./commands/usuarios";
import { cadastrarOrganizacao } from "./commands/organizacoes";
import { registrarLote } from "./commands/lotes";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function perguntar(pergunta: string): Promise<string> {
  return new Promise((resolver) => {
    rl.question(pergunta, (resposta) => resolver(resposta));
  });
}

async function loopMenu(papel: string, configuracao: any) {
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

    if (escolha === "1" && papel === "administrador") {
      const novoUsuario = await perguntar("Novo usuário: ");
      const novaSenha = await perguntar("Senha: ");
      const novoPapel = await perguntar("Papel (operador_cadastro / gestor_almoxarifado / auditor): ");
      criarUsuario(configuracao, novoUsuario, novaSenha, novoPapel);
      continue;
    }

    if (escolha === "3" && papel === "operador_cadastro") {
      const cnpj = await perguntar("CNPJ: ");
      const nome = await perguntar("Nome da organização: ");
      cadastrarOrganizacao(cnpj, nome);
      continue;
    }

    if (escolha === "4" && papel === "gestor_almoxarifado") {
      const org = await perguntar("Organização (ID): ");
      const nf = await perguntar("Nota fiscal: ");
      const transportadora = await perguntar("Transportadora: ");
      const dataEntrada = await perguntar("Data de entrada (AAAA-MM-DD): ");
      registrarLote(org, nf, transportadora, dataEntrada);
      continue;
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
    const resultado = autenticar(usuario, senha, configuracao);

    if (resultado.autenticado && resultado.papel) {
      console.log("Login realizado com sucesso.");
      registrarAtividade();
      await loopMenu(resultado.papel, configuracao);
    } else {
      console.log("Usuário ou senha inválidos.");
    }
  }

  rl.close();
}

principal();