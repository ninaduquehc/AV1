import { Entidade } from "./entidade";
import { cnpjValido } from "../utils/cnpj";

export class Organizacao extends Entidade {
  constructor(
    public readonly id: string,
    public cnpj: string,
    public nome: string
  ) {
    super();
  }

  protected regras(): string[] {
    const erros: string[] = [];
    if (!cnpjValido(this.cnpj)) erros.push("CNPJ inválido.");
    if (!this.nome) erros.push("Nome da organização é obrigatório.");
    return erros;
  }

  resumo(): string {
    return `${this.id} - ${this.nome} (CNPJ ${this.cnpj})`;
  }

  static deJSON(bruto: any): Organizacao {
    return new Organizacao(bruto.id, bruto.cnpj, bruto.nome);
  }
}