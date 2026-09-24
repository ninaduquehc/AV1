import { gerarHash } from "./senha";

export function autenticar(
  usuario: string,
  senha: string,
  configuracao: any
): { autenticado: boolean; papel: string | null } {
  const hashDigitado = gerarHash(senha);

  if (usuario === configuracao.admin.usuario && hashDigitado === configuracao.admin.hashSenha) {
    return { autenticado: true, papel: configuracao.admin.papel };
  }

  const encontrado = configuracao.usuarios.find(
    (u: any) => u.usuario === usuario && u.hashSenha === hashDigitado
  );

  if (encontrado) {
    return { autenticado: true, papel: encontrado.papel };
  }

  return { autenticado: false, papel: null };
}