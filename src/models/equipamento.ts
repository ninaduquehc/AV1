export const ESTADOS_FISICOS = ["novo", "bom", "regular", "ruim", "sucata"];

export class Equipamento {
  id: string;
  loteId: string;
  estadoFisico: string;
  status: string;
  historico: { estadoAnterior: string; estadoNovo: string; justificativa: string | null }[];

  constructor(id: string, loteId: string, estadoFisico: string) {
    this.id = id;
    this.loteId = loteId;
    this.estadoFisico = estadoFisico;
    this.status = "triagem_pendente";
    this.historico = [];
  }

  concluirTriagem(): void {
    this.status = "triagem_completa";
  }

  moverParaDesmonte(): boolean {
    if (this.status !== "triagem_completa") return false;
    this.status = "desmonte";
    return true;
  }

  alterarEstadoFisico(novoEstado: string, justificativa: string | null): boolean {
    const indiceAtual = ESTADOS_FISICOS.indexOf(this.estadoFisico);
    const indiceNovo = ESTADOS_FISICOS.indexOf(novoEstado);
    const quedaCategorias = indiceNovo - indiceAtual;

    if (quedaCategorias >= 2 && !justificativa) return false;

    this.historico.push({
      estadoAnterior: this.estadoFisico,
      estadoNovo: novoEstado,
      justificativa: justificativa,
    });
    this.estadoFisico = novoEstado;
    return true;
  }
}