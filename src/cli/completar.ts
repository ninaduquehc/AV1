import { comandosDisponiveis } from "./comandos";

// Completa comandos, subcomandos e flags, respeitando as permissões do papel.
export function criarCompletador(papel: string) {
  return (linha: string): [string[], string] => {
    const disponiveis = comandosDisponiveis(papel);
    const tokens = linha.split(/\s+/).filter((t) => t !== "");
    const terminaEmEspaco = /\s$/.test(linha) || tokens.length === 0;

    const atual = terminaEmEspaco ? "" : tokens[tokens.length - 1];
    const anteriores = terminaEmEspaco ? tokens : tokens.slice(0, -1);
    const n = anteriores.length;

    let candidatos: string[] = [];

    // Nome do comando ou subcomando na posição atual.
    disponiveis.forEach((c) => {
      if (c.nome.length > n && anteriores.every((t, i) => c.nome[i] === t)) {
        candidatos.push(c.nome[n]);
      }
    });

    // Comando já completo: sugere as flags que ainda não foram usadas.
    const comando = disponiveis.find(
      (c) => c.nome.length <= n && c.nome.every((parte, i) => anteriores[i] === parte)
    );
    if (comando) {
      const usadas = anteriores.filter((t) => t.startsWith("--"));
      candidatos = [...comando.flagsObrigatorias, ...comando.flagsOpcionais]
        .map((f) => `--${f}`)
        .filter((f) => !usadas.includes(f));
    }

    const unicos = Array.from(new Set(candidatos));
    return [unicos.filter((c) => c.startsWith(atual)), atual];
  };
}