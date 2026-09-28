export class ErroDeUso extends Error {}

export interface ArgsComando {
  posicionais: string[];
  flags: Record<string, string>;
}

// Separa a linha em tokens. Aspas duplas agrupam valores com espaços.
export function tokenizar(linha: string): string[] {
  const tokens: string[] = [];
  let atual = "";
  let dentroDeAspas = false;
  let temToken = false;

  for (const c of linha) {
    if (dentroDeAspas) {
      if (c === '"') dentroDeAspas = false;
      else atual += c;
    } else if (c === '"') {
      dentroDeAspas = true;
      temToken = true;
    } else if (/\s/.test(c)) {
      if (temToken) {
        tokens.push(atual);
        atual = "";
        temToken = false;
      }
    } else {
      atual += c;
      temToken = true;
    }
  }

  if (dentroDeAspas) throw new ErroDeUso("Aspas não fechadas.");
  if (temToken) tokens.push(atual);
  return tokens;
}

// Separa posicionais de flags (--flag valor ou --flag=valor).
export function analisarArgumentos(tokens: string[]): ArgsComando {
  const posicionais: string[] = [];
  const flags: Record<string, string> = Object.create(null);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (!token.startsWith("--")) {
      posicionais.push(token);
      continue;
    }

    const corpo = token.slice(2);
    if (!corpo) throw new ErroDeUso("Flag vazia.");

    const igual = corpo.indexOf("=");
    if (igual >= 0) {
      flags[corpo.slice(0, igual)] = corpo.slice(igual + 1);
      continue;
    }

    const proximo = tokens[i + 1];
    if (proximo === undefined || proximo.startsWith("--")) {
      throw new ErroDeUso(`A flag --${corpo} precisa de um valor.`);
    }
    flags[corpo] = proximo;
    i++;
  }

  return { posicionais, flags };
}