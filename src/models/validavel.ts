export interface Validavel {
  validar(): boolean;
  errosDeValidacao(): string[];
}