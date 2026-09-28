import { Acao } from "../auth/permissoes";
import { exibirMenu, obterItemMenu } from "../commands/menu";
import { criarUsuario } from "../commands/usuarios";
import { cadastrarOrganizacao } from "../commands/organizacoes";
import { cadastrarContrato } from "../commands/contratos";
import { registrarLote } from "../commands/lotes";
import {
  cadastrarEquipamento,
  concluirTriagemEquipamento,
  moverEquipamentoParaDesmonte,
  alterarEstadoFisicoEquipamento,
} from "../commands/equipamentos";
import { exibirHistorico } from "../commands/historico";
import { configurarParametros, obterParametros } from "../commands/parametros";
import { rastrearEquipamento, gerarRelatorio } from "../commands/relatorios";
import { log } from "../utils/logger";
import { perguntarNaSessao, SessaoExpiradaError } from "./entrada";

async function executarAcao(acao: Acao, usuarioLogado: string): Promise<void> {
  switch (acao) {
    case "gerenciar_usuarios": {
      const usuario = await perguntarNaSessao("Novo usuário: ");
      const senha = await perguntarNaSessao("Senha (mín. 8 caracteres): ");
      const papel = await perguntarNaSessao("Papel (operador_cadastro / gestor_almoxarifado / auditor): ");
      criarUsuario(usuario, senha, papel, usuarioLogado);
      break;
    }
    case "configurar_parametros": {
      const atuais = obterParametros();
      log.info(`Atuais: alíquota ${atuais.aliquotaImposto}%, depreciação ${atuais.coeficienteDepreciacao}%`);
      const aliquota = await perguntarNaSessao("Alíquota de imposto (%): ");
      const coeficiente = await perguntarNaSessao("Coeficiente de depreciação (%): ");
      configurarParametros(aliquota, coeficiente, usuarioLogado);
      break;
    }
    case "cadastrar_organizacao": {
      const cnpj = await perguntarNaSessao("CNPJ: ");
      const nome = await perguntarNaSessao("Nome da organização: ");
      cadastrarOrganizacao(cnpj, nome, usuarioLogado);
      break;
    }
    case "cadastrar_contrato": {
      const org = await perguntarNaSessao("Organização (ID): ");
      const descricao = await perguntarNaSessao("Descrição do contrato: ");
      const inicio = await perguntarNaSessao("Início da vigência (AAAA-MM-DD): ");
      const fim = await perguntarNaSessao("Fim da vigência (AAAA-MM-DD): ");
      cadastrarContrato(org, descricao, inicio, fim, usuarioLogado);
      break;
    }
    case "registrar_lote": {
      const org = await perguntarNaSessao("Organização (ID): ");
      const nf = await perguntarNaSessao("Nota fiscal: ");
      const transportadora = await perguntarNaSessao("Transportadora: ");
      const dataEntrada = await perguntarNaSessao("Data de entrada (AAAA-MM-DD): ");
      registrarLote(org, nf, transportadora, dataEntrada, usuarioLogado);
      break;
    }
    case "cadastrar_equipamento": {
      const id = await perguntarNaSessao("ID do equipamento: ");
      const loteId = await perguntarNaSessao("ID do lote: ");
      const estado = await perguntarNaSessao("Estado físico (novo/bom/regular/ruim/sucata): ");
      cadastrarEquipamento(id, loteId, estado, usuarioLogado);
      break;
    }
    case "concluir_triagem": {
      const id = await perguntarNaSessao("ID do equipamento: ");
      concluirTriagemEquipamento(id, usuarioLogado);
      break;
    }
    case "mover_desmonte": {
      const id = await perguntarNaSessao("ID do equipamento: ");
      moverEquipamentoParaDesmonte(id, usuarioLogado);
      break;
    }
    case "alterar_estado": {
      const id = await perguntarNaSessao("ID do equipamento: ");
      const novoEstado = await perguntarNaSessao("Novo estado físico (novo/bom/regular/ruim/sucata): ");
      const justificativa = await perguntarNaSessao("Justificativa (obrigatória se cair 2+ categorias): ");
      alterarEstadoFisicoEquipamento(id, novoEstado, justificativa, usuarioLogado);
      break;
    }
    case "consultar_historico":
      exibirHistorico();
      break;
    case "rastrear_equipamento": {
      const id = await perguntarNaSessao("ID do equipamento: ");
      rastrearEquipamento(id);
      break;
    }
    case "gerar_relatorio":
      gerarRelatorio();
      break;
  }
}

// Roda até a pessoa escolher "0" e então devolve o controle ao modo comando.
export async function loopMenu(papel: string, usuarioLogado: string): Promise<void> {
  while (true) {
    exibirMenu(papel);
    const escolha = await perguntarNaSessao("Escolha uma opção: ");

    if (escolha.trim() === "0") break;

    const item = obterItemMenu(papel, escolha);
    if (!item) {
      log.aviso(`Opção "${escolha}" indisponível para o seu perfil.`);
      continue;
    }

    try {
      await executarAcao(item.acao, usuarioLogado);
    } catch (erro) {
      if (erro instanceof SessaoExpiradaError) throw erro;
      log.erro((erro as Error).message);
    }
  }
}