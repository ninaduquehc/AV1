import { Organizacao } from "./organizacao";
import { Lote } from "./lote";
import { Equipamento } from "./equipamento";
import { ContratoColeta } from "./contrato";

export class FabricaEntidades {
  // Gera o próximo ID sequencial: prefixo "BR", largura 3 → BR001, BR002...
  static proximoId(prefixo: string, idsExistentes: string[], largura: number): string {
    const maior = idsExistentes
      .map((id) => Number(id.slice(prefixo.length)))
      .filter((n) => !isNaN(n))
      .reduce((a, b) => Math.max(a, b), 0);
    return prefixo + String(maior + 1).padStart(largura, "0");
  }

  static criarOrganizacao(cnpj: string, nome: string, existentes: Organizacao[]): Organizacao {
    const id = FabricaEntidades.proximoId("BR", existentes.map((o) => o.id), 3);
    return new Organizacao(id, cnpj, nome);
  }

  static criarLote(
    org: string,
    nf: string,
    transportadora: string,
    dataEntrada: Date,
    existentes: Lote[]
  ): Lote {
    const id = FabricaEntidades.proximoId("LT", existentes.map((l) => l.id), 4);
    return new Lote(id, org, nf, transportadora, dataEntrada);
  }

  static criarContrato(
    orgId: string,
    descricao: string,
    inicio: Date,
    fim: Date,
    existentes: ContratoColeta[]
  ): ContratoColeta {
    const id = FabricaEntidades.proximoId("CT", existentes.map((c) => c.id), 4);
    return new ContratoColeta(id, orgId, descricao, inicio, fim);
  }

  // Aloca automaticamente o código de barras interno.
  static criarEquipamento(
    id: string,
    loteId: string,
    estadoFisico: string,
    existentes: Equipamento[]
  ): Equipamento {
    const codigo = FabricaEntidades.proximoId("GC", existentes.map((e) => e.codigoBarras), 8);
    return new Equipamento(id, loteId, estadoFisico, codigo);
  }
}