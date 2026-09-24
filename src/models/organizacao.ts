import { Validavel } from "./validavel";
import { cnpjValido } from "../utils/cnpj";

export class Organizacao implements Validavel {
  cnpj: string;
  nome: string;

  constructor(cnpj: string, nome: string) {
    this.cnpj = cnpj;
    this.nome = nome;
  }

  validar(): boolean {
    return cnpjValido(this.cnpj);
  }
}