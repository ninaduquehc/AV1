import { carregarEquipamentos } from "./equipamentos";
import { carregarLotes } from "./lotes";
import { carregarOrganizacoes } from "./organizacoes";
import { carregarContratos } from "./contratos";
import { listarMovimentacoes } from "./movimentacoes";
import { obterParametros } from "./parametros";
import { log } from "../utils/logger";

export function rastrearEquipamento(idTexto: string): void {
  const id = idTexto.trim();
  const equipamento = carregarEquipamentos().find((e) => e.id === id);

  if (!equipamento) {
    log.erro("Equipamento não encontrado.");
    return;
  }

  const lote = carregarLotes().find((l) => l.id === equipamento.loteId);
  const organizacao = lote ? carregarOrganizacoes().find((o) => o.id === lote.org) : undefined;

  console.log("\n--- Rastreabilidade ---");
  console.log(`Equipamento: ${equipamento.resumo()}`);
  console.log(`Lote: ${lote ? lote.resumo() : "não encontrado"}`);
  console.log(`Origem: ${organizacao ? organizacao.resumo() : "não encontrada"}`);
  console.log("\nMovimentações:");

  const movimentacoes = listarMovimentacoes(equipamento.id);
  if (movimentacoes.length === 0) {
    console.log("  (nenhuma)");
    return;
  }
  movimentacoes.forEach((m) => {
    const justificativa = m.justificativa ? ` — justificativa: ${m.justificativa}` : "";
    console.log(`  [${m.timestamp}] ${m.tipo}: ${m.de} → ${m.para} (por ${m.usuario})${justificativa}`);
  });
}

function contar<T>(itens: T[], chave: (item: T) => string): Record<string, number> {
  const resultado: Record<string, number> = {};
  itens.forEach((item) => {
    const k = chave(item);
    resultado[k] = (resultado[k] ?? 0) + 1;
  });
  return resultado;
}

function imprimirContagem(titulo: string, contagem: Record<string, number>): void {
  console.log(`${titulo}:`);
  const chaves = Object.keys(contagem);
  if (chaves.length === 0) console.log("  (nenhum)");
  chaves.forEach((k) => console.log(`  ${k}: ${contagem[k]}`));
}

export function gerarRelatorio(): void {
  const equipamentos = carregarEquipamentos();
  const parametros = obterParametros();

  console.log("\n--- Relatório resumo ---");
  console.log(`Organizações: ${carregarOrganizacoes().length}`);
  console.log(`Contratos de coleta: ${carregarContratos().length}`);
  console.log(`Lotes: ${carregarLotes().length}`);
  console.log(`Equipamentos: ${equipamentos.length}`);
  console.log(`Movimentações: ${listarMovimentacoes().length}`);
  imprimirContagem("Equipamentos por status", contar(equipamentos, (e) => e.status));
  imprimirContagem("Equipamentos por estado físico", contar(equipamentos, (e) => e.estadoFisico));
  console.log(
    `Parâmetros: alíquota ${parametros.aliquotaImposto}%, depreciação ${parametros.coeficienteDepreciacao}%`
  );
}