import { Acao, temPermissao } from "../auth/permissoes";
import { criarUsuario } from "../commands/usuarios";
import { configurarParametros, obterParametros } from "../commands/parametros";
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
import { rastrearEquipamento, gerarRelatorio } from "../commands/relatorios";
import { log } from "../utils/logger";
import { perguntarNaSessao } from "./entrada";
import { loopMenu } from "./guiado";
import { tokenizar, analisarArgumentos, ArgsComando } from "./parser";

export interface ContextoComando {
  usuario: string;
  papel: string;
}

export interface DefinicaoComando {
  nome: string[]; // ex.: ["lote", "criar"]
  uso: string;
  descricao: string;
  acao: Acao | null; // null = qualquer usuário autenticado
  posicionais: string[];
  flagsObrigatorias: string[];
  flagsOpcionais: string[];
  executar: (args: ArgsComando, ctx: ContextoComando) => void | Promise<void>;
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

const COMANDOS: DefinicaoComando[] = [
  {
    nome: ["usuario", "criar"],
    uso: "usuario criar <usuario> --papel <papel>",
    descricao: "Cria um usuário (a senha é pedida em seguida)",
    acao: "gerenciar_usuarios",
    posicionais: ["usuario"],
    flagsObrigatorias: ["papel"],
    flagsOpcionais: [],
    executar: async (a, ctx) => {
      const senha = await perguntarNaSessao("Senha (mín. 8 caracteres): ");
      criarUsuario(a.posicionais[0], senha, a.flags.papel, ctx.usuario);
    },
  },
  {
    nome: ["parametros", "ver"],
    uso: "parametros ver",
    descricao: "Mostra alíquota e depreciação atuais",
    acao: "configurar_parametros",
    posicionais: [],
    flagsObrigatorias: [],
    flagsOpcionais: [],
    executar: () => {
      const p = obterParametros();
      log.info(`Alíquota de imposto: ${p.aliquotaImposto}% | Depreciação: ${p.coeficienteDepreciacao}%`);
    },
  },
  {
    nome: ["parametros", "definir"],
    uso: "parametros definir --aliquota <%> --depreciacao <%>",
    descricao: "Define alíquota de imposto e coeficiente de depreciação",
    acao: "configurar_parametros",
    posicionais: [],
    flagsObrigatorias: ["aliquota", "depreciacao"],
    flagsOpcionais: [],
    executar: (a, ctx) => configurarParametros(a.flags.aliquota, a.flags.depreciacao, ctx.usuario),
  },
  {
    nome: ["organizacao", "criar"],
    uso: 'organizacao criar --cnpj <cnpj> --nome "<nome>"',
    descricao: "Cadastra uma organização cliente",
    acao: "cadastrar_organizacao",
    posicionais: [],
    flagsObrigatorias: ["cnpj", "nome"],
    flagsOpcionais: [],
    executar: (a, ctx) => cadastrarOrganizacao(a.flags.cnpj, a.flags.nome, ctx.usuario),
  },
  {
    nome: ["contrato", "criar"],
    uso: 'contrato criar --org <id> --desc "<texto>" --inicio <AAAA-MM-DD> --fim <AAAA-MM-DD>',
    descricao: "Cadastra um contrato de coleta",
    acao: "cadastrar_contrato",
    posicionais: [],
    flagsObrigatorias: ["org", "desc", "inicio", "fim"],
    flagsOpcionais: [],
    executar: (a, ctx) =>
      cadastrarContrato(a.flags.org, a.flags.desc, a.flags.inicio, a.flags.fim, ctx.usuario),
  },
  {
    nome: ["lote", "criar"],
    uso: "lote criar --org <id> --nf <numero> --transp <nome> [--data <AAAA-MM-DD>]",
    descricao: "Registra um lote (data padrão: hoje)",
    acao: "registrar_lote",
    posicionais: [],
    flagsObrigatorias: ["org", "nf", "transp"],
    flagsOpcionais: ["data"],
    executar: (a, ctx) =>
      registrarLote(a.flags.org, a.flags.nf, a.flags.transp, a.flags.data ?? hoje(), ctx.usuario),
  },
  {
    nome: ["equipamento", "criar"],
    uso: "equipamento criar <id> --lote <id> --estado <novo|bom|regular|ruim|sucata>",
    descricao: "Cadastra um equipamento (gera o código de barras)",
    acao: "cadastrar_equipamento",
    posicionais: ["id"],
    flagsObrigatorias: ["lote", "estado"],
    flagsOpcionais: [],
    executar: (a, ctx) => cadastrarEquipamento(a.posicionais[0], a.flags.lote, a.flags.estado, ctx.usuario),
  },
  {
    nome: ["equipamento", "triagem"],
    uso: "equipamento triagem <id>",
    descricao: "Conclui a triagem do equipamento",
    acao: "concluir_triagem",
    posicionais: ["id"],
    flagsObrigatorias: [],
    flagsOpcionais: [],
    executar: (a, ctx) => concluirTriagemEquipamento(a.posicionais[0], ctx.usuario),
  },
  {
    nome: ["equipamento", "desmonte"],
    uso: "equipamento desmonte <id>",
    descricao: "Move o equipamento para desmonte (exige triagem completa)",
    acao: "mover_desmonte",
    posicionais: ["id"],
    flagsObrigatorias: [],
    flagsOpcionais: [],
    executar: (a, ctx) => moverEquipamentoParaDesmonte(a.posicionais[0], ctx.usuario),
  },
  {
    nome: ["equipamento", "estado"],
    uso: 'equipamento estado <id> --para <estado> [--just "<texto>"]',
    descricao: "Altera o estado físico (justificativa se cair 2+ categorias)",
    acao: "alterar_estado",
    posicionais: ["id"],
    flagsObrigatorias: ["para"],
    flagsOpcionais: ["just"],
    executar: (a, ctx) =>
      alterarEstadoFisicoEquipamento(a.posicionais[0], a.flags.para, a.flags.just ?? "", ctx.usuario),
  },
  {
    nome: ["equipamento", "rastrear"],
    uso: "equipamento rastrear <id>",
    descricao: "Mostra a rastreabilidade e as movimentações",
    acao: "rastrear_equipamento",
    posicionais: ["id"],
    flagsObrigatorias: [],
    flagsOpcionais: [],
    executar: (a) => rastrearEquipamento(a.posicionais[0]),
  },
  {
    nome: ["historico"],
    uso: "historico",
    descricao: "Consulta o journal de transações",
    acao: "consultar_historico",
    posicionais: [],
    flagsObrigatorias: [],
    flagsOpcionais: [],
    executar: () => exibirHistorico(),
  },
  {
    nome: ["relatorio"],
    uso: "relatorio",
    descricao: "Relatório resumo do sistema",
    acao: "gerar_relatorio",
    posicionais: [],
    flagsObrigatorias: [],
    flagsOpcionais: [],
    executar: () => gerarRelatorio(),
  },
  {
    nome: ["menu"],
    uso: "menu",
    descricao: "Abre o menu guiado (opção 0 volta ao modo comando)",
    acao: null,
    posicionais: [],
    flagsObrigatorias: [],
    flagsOpcionais: [],
    executar: (_a, ctx) => loopMenu(ctx.papel, ctx.usuario),
  },
  {
    nome: ["ajuda"],
    uso: "ajuda",
    descricao: "Lista os comandos disponíveis para o seu perfil",
    acao: null,
    posicionais: [],
    flagsObrigatorias: [],
    flagsOpcionais: [],
    executar: (_a, ctx) => exibirAjuda(ctx.papel),
  },
  {
    nome: ["sair"],
    uso: "sair",
    descricao: "Encerra a sessão",
    acao: null,
    posicionais: [],
    flagsObrigatorias: [],
    flagsOpcionais: [],
    executar: () => {}, // tratado no loop principal
  },
];

// Só devolve comandos que o papel pode executar (o resto nem aparece na ajuda).
export function comandosDisponiveis(papel: string): DefinicaoComando[] {
  return COMANDOS.filter((c) => c.acao === null || temPermissao(papel, c.acao));
}

function exibirAjuda(papel: string): void {
  console.log("\n--- Comandos disponíveis ---");
  comandosDisponiveis(papel).forEach((c) => {
    console.log(`  ${c.uso}`);
    console.log(`      ${c.descricao}`);
  });
  console.log('\nDica: use Tab para completar e aspas duplas para valores com espaço.');
}

function validarArgumentos(def: DefinicaoComando, args: ArgsComando): string | null {
  if (args.posicionais.length !== def.posicionais.length) {
    return `Esperado(s) ${def.posicionais.length} argumento(s) posicional(is), recebido(s) ${args.posicionais.length}.`;
  }

  const permitidas = [...def.flagsObrigatorias, ...def.flagsOpcionais];
  for (const flag of Object.keys(args.flags)) {
    if (!permitidas.includes(flag)) return `Flag desconhecida: --${flag}.`;
  }
  for (const flag of def.flagsObrigatorias) {
    if (args.flags[flag] === undefined) return `Flag obrigatória ausente: --${flag}.`;
  }
  return null;
}

export async function executarLinha(linha: string, ctx: ContextoComando): Promise<void> {
  const tokens = tokenizar(linha);
  if (tokens.length === 0) return;

  const disponiveis = comandosDisponiveis(ctx.papel);
  const def = disponiveis
    .filter((c) => c.nome.every((parte, i) => tokens[i] === parte))
    .sort((a, b) => b.nome.length - a.nome.length)[0];

  if (!def) {
    const doRecurso = disponiveis.filter((c) => c.nome[0] === tokens[0]);
    if (doRecurso.length === 0) {
      log.erro(`Comando "${tokens[0]}" desconhecido. Digite "ajuda".`);
    } else {
      log.erro(`Subcomando inválido para "${tokens[0]}". Opções:`);
      doRecurso.forEach((c) => console.log(`  ${c.uso}`));
    }
    return;
  }

  const args = analisarArgumentos(tokens.slice(def.nome.length));
  const problema = validarArgumentos(def, args);
  if (problema) {
    log.erro(problema);
    console.log(`  Uso: ${def.uso}`);
    return;
  }

  await def.executar(args, ctx);
}