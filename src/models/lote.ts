import { Entidade } from "./entidade";

const DIAS_MAXIMOS_RETROATIVOS = 90;

export class Lote extends Entidade {
  constructor(
    public readonly id: string,
    public org: string,
    public nf: string,
    public transportadora: string,
    public dataEntrada: Date
  ) {
    super();
  }

  protected regras(): string[] {
    const erros: string[] = [];
    if (!this.org) erros.push("Organização é obrigatória.");
    if (!this.nf) erros.push("Nota fiscal é obrigatória.");
    if (!this.transportadora) erros.push("Transportadora é obrigatória.");

    const dataMs = this.dataEntrada.getTime();
    if (isNaN(dataMs)) {
      erros.push("Data de entrada inválida.");
    } else {
      const agora = Date.now();
      if (dataMs > agora) erros.push("Data de entrada não pode ser futura.");
      if (agora - dataMs > DIAS_MAXIMOS_RETROATIVOS * 24 * 60 * 60 * 1000) {
        erros.push(`Data de entrada anterior a ${DIAS_MAXIMOS_RETROATIVOS} dias.`);
      }
    }
    return erros;
  }

  resumo(): string {
    return `${this.id} - NF ${this.nf}, ${this.transportadora}, entrada em ${this.dataEntrada.toISOString().slice(0, 10)}`;
  }

  static deJSON(bruto: any): Lote {
    return new Lote(bruto.id, bruto.org, bruto.nf, bruto.transportadora, new Date(bruto.dataEntrada));
  }
}