import { Organizacao } from "./organizacao";
import { Contrato } from "./contrato";
import { Lote } from "./lote";
import { Equipamento, EstadoFisico } from "./equipamento";

export class FabricaEntidades {
  public static criarOrganizacao(razosocial: string, cnpj: string, tipo: any): Organizacao {
    const id = `ORG-${Date.now().toString().slice(-6)}`;
    const org = new Organizacao(id, razosocial, cnpj, tipo);
    org.validar();
    return org;
  }

  public static criarContrato(organizacaoId: string, dataInicio: string, dataFim: string, termos: string): Contrato {
    const id = `CTR-${Date.now().toString().slice(-6)}`;
    const contrato = new Contrato(id, organizacaoId, dataInicio, dataFim, termos);
    contrato.validar();
    return contrato;
  }

  public static criarLote(organizacaoId: string, notaFiscal: string, transportadora: string, dataEntrada: string): Lote {
    const id = `LOT-${Date.now().toString().slice(-6)}`;
    const lote = new Lote(id, organizacaoId, notaFiscal, transportadora, dataEntrada);
    lote.validar();
    return lote;
  }

  public static criarEquipamento(codigoBarras: string, loteId: string, tipo: string, modelo: string, estado: EstadoFisico): Equipamento {
    const eq = new Equipamento(codigoBarras, loteId, tipo, modelo, estado);
    eq.validar();
    return eq;
  }
}