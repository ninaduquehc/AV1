import * as fs from "fs";
import * as caminho from "path";
import { criptografar, descriptografar, escreverAtomico } from "./armazenamento";

export class Repositorio<T> {
  constructor(
    private readonly arquivo: string,
    private readonly reidratar: (bruto: any) => T = (bruto) => bruto as T
  ) {}

  carregar(): T[] {
    if (!fs.existsSync(this.arquivo)) return [];
    try {
      const conteudo = descriptografar(fs.readFileSync(this.arquivo, "utf-8"));
      const brutos = JSON.parse(conteudo) as any[];
      return brutos.map((bruto) => this.reidratar(bruto));
    } catch {
      throw new Error(`Arquivo "${caminho.basename(this.arquivo)}" corrompido ou adulterado.`);
    }
  }

  salvar(itens: T[]): void {
    escreverAtomico(this.arquivo, criptografar(JSON.stringify(itens)));
  }
}