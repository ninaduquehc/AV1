import { Entidade } from "./entidade";

export class ContratoColeta extends Entidade {
  constructor(
    public readonly id: string,
    public orgId: string,
    public descricao: string,
    public vigenciaInicio: Date,
    public vigenciaFim: Date
  ) {
    super();
  }

  protected regras(): string[] {
    const erros: string[] = [];
    if (!this.orgId) erros.push("Organização é obrigatória.");
    if (!this.descricao) erros.push("Descrição do contrato é obrigatória.");

    const inicio = this.vigenciaInicio.getTime();
    const fim = this.vigenciaFim.getTime();
    if (isNaN(inicio) || isNaN(fim)) {
      erros.push("Datas de vigência inválidas.");
    } else if (fim <= inicio) {
      erros.push("O fim da vigência deve ser posterior ao início.");
    }
    return erros;
  }

  resumo(): string {
    return `${this.id} - ${this.orgId} (${this.vigenciaInicio.toISOString().slice(0, 10)} a ${this.vigenciaFim.toISOString().slice(0, 10)})`;
  }

  static deJSON(bruto: any): ContratoColeta {
    return new ContratoColeta(
      bruto.id,
      bruto.orgId,
      bruto.descricao,
      new Date(bruto.vigenciaInicio),
      new Date(bruto.vigenciaFim)
    );
  }
}