import { gerarHash } from "../auth/senha";
import { salvarConfiguracao } from "../config/provisionamento";

export function criarUsuario(
  configuracao: any,
  usuario: string,
  senha: string,
  papel: string
): void {
  configuracao.usuarios.push({
    usuario: usuario,
    hashSenha: gerarHash(senha),
    papel: papel,
  });

  salvarConfiguracao(configuracao);
  console.log(`Usuário "${usuario}" criado com papel "${papel}".`);
}