import { Entidade } from "./entidade";
import { Validavel } from "./validavel";
import { cnpjValido } from "../utils/cnpj";
import { RegraDeNegocioError } from "./erros";

export class Organizacao extends Entidade implements Validavel {
  public id: string;
  public razosocial: string;
  public cnpj: string;
  public tipo: "gerador" | "operador_logistico" | "desmontadora" | "comprador";

  constructor(
    id: string,
    razosocial: string,
    cnpj: string,
    tipo: "gerador" | "operador_logistico" | "desmontadora" | "comprador"
  ) {
    super();
    this.id = id;
    this.razosocial = razosocial;
    this.cnpj = cnpj;
    this.tipo = tipo;
  }

  // Getter de conveniência para o nome
  public get nome(): string {
    return this.razosocial;
  }

  public validar(): boolean {
    if (!this.razosocial || this.razosocial.trim().length < 3) {
      throw new RegraDeNegocioError("Razão social inválida.");
    }
    if (!cnpjValido(this.cnpj)) {
      throw new RegraDeNegocioError(`CNPJ '${this.cnpj}' é inválido segundo as regras oficiais.`);
    }
    return true;
  }

  // Métodos no formato de função () => ... para corresponder à classe abstrata Entidade
  public regras(): string[] {
    return ["CNPJ deve ser válido", "Razão social deve ter no mínimo 3 caracteres"];
  }

  public resumo(): string {
    return `${this.razosocial} (${this.cnpj}) - ${this.tipo}`;
  }

  public static deJSON(dados: any, _index?: number): Organizacao {
    return new Organizacao(
      dados.id,
      dados.razosocial || dados.razaoSocial || dados.nome,
      dados.cnpj,
      dados.tipo
    );
  }
}