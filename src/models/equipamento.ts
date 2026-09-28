import { Entidade } from "./entidade";
import { RegraDeNegocioError } from "./erros";

export const ESTADOS_FISICOS = ["novo", "bom", "regular", "ruim", "sucata"];

export type StatusEquipamento = "triagem_pendente" | "triagem_completa" | "desmonte";

export class Equipamento extends Entidade {
  constructor(
    public readonly id: string,
    public readonly loteId: string,
    public estadoFisico: string,
    public readonly codigoBarras: string,
    public status: StatusEquipamento = "triagem_pendente"
  ) {
    super();
  }

  protected regras(): string[] {
    const erros: string[] = [];
    if (!this.id) erros.push("ID do equipamento é obrigatório.");
    if (!this.loteId) erros.push("ID do lote é obrigatório.");
    if (!ESTADOS_FISICOS.includes(this.estadoFisico)) {
      erros.push(`Estado físico inválido. Use: ${ESTADOS_FISICOS.join(", ")}.`);
    }
    return erros;
  }

  resumo(): string {
    return `${this.id} [${this.codigoBarras}] - estado: ${this.estadoFisico}, status: ${this.status}`;
  }

  concluirTriagem(): void {
    if (this.status !== "triagem_pendente") {
      throw new RegraDeNegocioError(`Triagem não pode ser concluída: status atual é "${this.status}".`);
    }
    this.status = "triagem_completa";
  }

  moverParaDesmonte(): void {
    if (this.status !== "triagem_completa") {
      throw new RegraDeNegocioError("Equipamento precisa concluir a triagem antes do desmonte.");
    }
    this.status = "desmonte";
  }

  alterarEstadoFisico(novoEstado: string, justificativa: string | null): void {
    if (!ESTADOS_FISICOS.includes(novoEstado)) {
      throw new RegraDeNegocioError(`Estado físico inválido. Use: ${ESTADOS_FISICOS.join(", ")}.`);
    }

    const queda = ESTADOS_FISICOS.indexOf(novoEstado) - ESTADOS_FISICOS.indexOf(this.estadoFisico);
    if (queda === 0) {
      throw new RegraDeNegocioError("O equipamento já está nesse estado físico.");
    }
    if (queda >= 2 && !(justificativa && justificativa.trim())) {
      throw new RegraDeNegocioError(
        "Justificativa obrigatória quando o estado cai duas ou mais categorias."
      );
    }

    this.estadoFisico = novoEstado;
  }

  static deJSON(bruto: any): Equipamento {
    return new Equipamento(
      bruto.id,
      bruto.loteId,
      bruto.estadoFisico,
      bruto.codigoBarras,
      bruto.status as StatusEquipamento
    );
  }
}