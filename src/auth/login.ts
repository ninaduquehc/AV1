import { gerarHash } from "./senha";

export function autenticar(
  usuario: string,
  senha: string,
  configuracao: any
): boolean {

  const hashDigitado = gerarHash(senha);

  const usuarioCorreto = usuario === configuracao.admin.usuario;
  const senhaCorreta = hashDigitado === configuracao.admin.hashSenha;

  return usuarioCorreto && senhaCorreta;
}