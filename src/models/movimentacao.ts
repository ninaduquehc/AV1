export interface Movimentacao {
  timestamp: string;
  equipamentoId: string;
  tipo: string; // cadastro | triagem | desmonte | estado_fisico
  de: string;
  para: string;
  usuario: string;
  justificativa: string | null;
}