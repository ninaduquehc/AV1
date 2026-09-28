import { Entidade } from "./entidade";
import { Validavel } from "./validavel";
import { RegraDeNegocioError } from "./erros";

export type EstadoFisico = "A_EXCELENTE" | "B_BOM" | "C_REGULAR" | "D_DANIFICADO" | "E_SUCATA";
export type StatusEquipamento = "recebido" | "triado" | "em_desmonte" | "recuperado" | "descartado";

export const HIERARQUIA_ESTADO: Record<EstadoFisico, number> = {
  A_EXCELENTE: 5,
  B_BOM: 4,
  C_REGULAR: 3,
  D_DANIFICADO: 2,
  E_SUCATA: 1,
};

export class Equipamento extends Entidade implements Validavel {
  public id: string; // Código de barras
  public loteId: string;
  public tipo: string;
  public modelo: string;
  public estadoFisico: EstadoFisico;
  public status: StatusEquipamento;
  public triagemConcluida: boolean;

  constructor(
    id: string,
    loteId: string,
    tipo: string,
    modelo: string,
    estadoFisico: EstadoFisico,
    status: StatusEquipamento = "recebido",
    triagemConcluida: boolean = false
  ) {
    super();
    this.id = id;
    this.loteId = loteId;
    this.tipo = tipo;
    this.modelo = modelo;
    this.estadoFisico = estadoFisico;
    this.status = status;
    this.triagemConcluida = triagemConcluida;
  }

  public validar(): boolean {
    if (!this.id || this.id.trim().length === 0) {
      throw new RegraDeNegocioError("Código de barras do equipamento é obrigatório.");
    }
    if (!this.tipo || !this.modelo) {
      throw new RegraDeNegocioError("Tipo e modelo são obrigatórios para o equipamento.");
    }
    return true;
  }

  public regras(): string[] {
    return ["Código de barras obrigatório", "Desmonte exige triagem concluída", "Degradação >= 2 níveis exige justificativa"];
  }

  public resumo(): string {
    return `Equipamento ${this.id} (${this.tipo} ${this.modelo}) - Status: ${this.status}`;
  }

  public static deJSON(dados: any, _index?: number): Equipamento {
    return new Equipamento(
      dados.id,
      dados.loteId,
      dados.tipo,
      dados.modelo,
      dados.estadoFisico,
      dados.status,
      dados.triagemConcluida
    );
  }
}