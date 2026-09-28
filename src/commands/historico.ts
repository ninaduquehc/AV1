import { lerJournal, verificarIntegridadeJournal } from "../persistence/journal";
import { log } from "../utils/logger";

export function exibirHistorico(): void {
  const registros = lerJournal();

  if (registros.length === 0) {
    log.aviso("Nenhum registro encontrado.");
    return;
  }

  const invalido = verificarIntegridadeJournal();
  if (invalido === -1) {
    log.info("Integridade do journal verificada.");
  } else {
    log.erro(`Journal adulterado a partir do registro #${invalido + 1}.`);
  }

  console.log("\n--- Histórico de Transações ---");
  registros.forEach((registro) => {
    console.log(`[${registro.timestamp}] ${registro.usuario} → ${registro.acao}`);
    console.log(`  Detalhes: ${JSON.stringify(registro.detalhes)}`);
  });
}