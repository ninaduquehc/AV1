import { adicionarCredencial, buscarCredencial } from "../auth/credenciais";
import { PAPEIS_CRIAVEIS } from "../auth/papeis";
import { registrarTransacao } from "../persistence/journal";
import { log } from "../utils/logger";

export function criarUsuario(
  usuarioTexto: string,
  senha: string,
  papel: string,
  usuarioLogado: string
): void {
  const usuario = usuarioTexto.trim();

  if (!usuario) {
    log.erro("Nome de usuário não pode ser vazio.");
    return;
  }
  if (senha.length < 8) {
    log.erro("A senha deve ter pelo menos 8 caracteres.");
    return;
  }
  if (!PAPEIS_CRIAVEIS.includes(papel)) {
    log.erro(`Papel inválido. Use: ${PAPEIS_CRIAVEIS.join(", ")}.`);
    return;
  }
  if (buscarCredencial(usuario)) {
    log.erro("Já existe um usuário com esse nome.");
    return;
  }

  registrarTransacao(usuarioLogado, "criar_usuario", { usuario, papel });
  adicionarCredencial(usuario, senha, papel);
  log.sucesso(`Usuário "${usuario}" criado com papel "${papel}".`);
}