import * as readline from "readline";
import { estaProvisionado, provisionar, carregarConfiguracao } from "./config/provisionamento";
import { autenticar } from "./auth/login";
import { registrarAtividade, sessaoExpirada } from "./auth/sessao";
import { exibirMenu } from "./commands/menu";
import { criarUsuario } from "./commands/usuarios";
import { cadastrarOrganizacao } from "./commands/organizacoes";
import { registrarLote } from "./commands/lotes";
import { cadastrarEquipamento, concluirTriagemEquipamento, moverEquipamentoParaDesmonte } from "./commands/equipamentos";
import { exibirHistorico } from "./commands/historico";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function perguntar(pergunta: string): Promise<string> {
  return new Promise((resolver) => {
    rl.question(pergunta, (resposta) => resolver(resposta));
  });
}

async function loopMenu(papel: string, usuarioLogado: string, configuracao: any) {
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
      cadastrarOrganizacao(cnpj, nome, usuarioLogado);
      continue;
    }

    if (escolha === "4" && papel === "gestor_almoxarifado") {
      const org = await perguntar("Organização (ID): ");
      const nf = await perguntar("Nota fiscal: ");
      const transportadora = await perguntar("Transportadora: ");
      const dataEntrada = await perguntar("Data de entrada (AAAA-MM-DD): ");
      registrarLote(org, nf, transportadora, dataEntrada, usuarioLogado);
      continue;
    }

    if (escolha === "5" && (papel === "administrador" || papel === "auditor")) {
      exibirHistorico();
      continue;
    } 

    if (escolha === "6" && papel === "gestor_almoxarifado") {
      const id = await perguntar("ID do equipamento: ");
      const loteId = await perguntar("ID do lote: ");
      const estadoFisico = await perguntar("Estado físico (novo/bom/regular/ruim/sucata): ");
      cadastrarEquipamento(id, loteId, estadoFisico, usuarioLogado);
      continue;
    }

    if (escolha === "7" && papel === "gestor_almoxarifado") {
      const id = await perguntar("ID do equipamento: ");
      concluirTriagemEquipamento(id, usuarioLogado);
      continue;
    }

    if (escolha === "8" && papel === "gestor_almoxarifado") {
      const id = await perguntar("ID do equipamento: ");
      moverEquipamentoParaDesmonte(id, usuarioLogado);
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
      await loopMenu(resultado.papel, usuario, configuracao);
    } else {
      console.log("Usuário ou senha inválidos.");
    }
  }

  rl.close();
}

principal();