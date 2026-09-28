import { Validavel } from "./validavel";

// Classe abstrata: cada entidade define suas próprias regras (polimorfismo).
export abstract class Entidade implements Validavel {
  abstract readonly id: string;

  protected abstract regras(): string[];
  abstract resumo(): string;

  errosDeValidacao(): string[] {
    return this.regras();
  }

  validar(): boolean {
    return this.regras().length === 0;
  }
}