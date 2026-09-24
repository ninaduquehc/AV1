import { Validavel } from "./validavel";

export class Lote {
  org: string;
  nf: string;
  transportadora: string;
  dataEntrada: Date;

  constructor(org: string, nf: string, transportadora: string, dataEntrada: Date) {
    this.org = org;
    this.nf = nf;
    this.transportadora = transportadora;
    this.dataEntrada = dataEntrada;
  }

  validar(): boolean {
    const agora = Date.now();
    const dataMs = this.dataEntrada.getTime();
    const noventaDiasMs = 90 * 24 * 60 * 60 * 1000;

    if (dataMs > agora) return false;
    if (agora - dataMs > noventaDiasMs) return false;

    return true;
  }
}