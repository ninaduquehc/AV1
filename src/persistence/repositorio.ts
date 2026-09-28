import { escreverAtomico, lerAtomico } from "./armazenamento";

export class Repositorio<T> {
  constructor(private caminhoArquivo: string) {}

  public carregar(): T[] {
    try {
      const conteudo = lerAtomico(this.caminhoArquivo, true);
      if (!conteudo) return [];
      return JSON.parse(conteudo) as T[];
    } catch {
      return [];
    }
  }

  public salvar(dados: T[]): void {
    escreverAtomico(this.caminhoArquivo, JSON.stringify(dados, null, 2), true);
  }
}