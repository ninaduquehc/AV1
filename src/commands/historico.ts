import { lerJournal } from "../persistence/journal";

export function exibirHistorico(): void {
  const registros = lerJournal();

  if (registros.length === 0) {
    console.log("Nenhum registro encontrado.");
    return;
  }

  console.log("\n--- Histórico de Transações ---");
  registros.forEach((registro) => {
    console.log(`[${registro.timestamp}] ${registro.usuario} → ${registro.acao}`);
    console.log(`  Detalhes: ${JSON.stringify(registro.detalhes)}`);
  });
}