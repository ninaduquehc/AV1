export function exibirMenu(papel: string): void {
  console.log("\n--- Menu ---");

  if (papel === "administrador") {
    console.log("1. Gerenciar usuários");
    console.log("2. Configurar parâmetros globais");
  }

  if (papel === "operador_cadastro") {
    console.log("3. Cadastrar organização");
  }

  if (papel === "gestor_almoxarifado") {
    console.log("4. Registrar lote");
    console.log("6. Cadastrar equipamento");
    console.log("7. Concluir triagem de equipamento");
    console.log("8. Mover equipamento para desmonte");
  }
  
  if (papel === "auditor" || papel === "administrador") {
    console.log("5. Consultar histórico");
  }

  console.log("0. Sair");
}