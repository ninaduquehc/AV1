import { provisionar, estaProvisionado } from "../src/config/provisionamento";
import { autenticar } from "../src/auth/login";
import { FabricaEntidades } from "../src/models/fabrica";
import { Repositorio } from "../src/persistence/repositorio";
import { Organizacao } from "../src/models/organizacao";
import { Lote } from "../src/models/lote";
import { Equipamento } from "../src/models/equipamento";
import { ARQ_ORGANIZACOES, ARQ_LOTES, ARQ_EQUIPAMENTOS } from "../src/config/caminhos";

function executarJornadaAutomatizada() {
  console.log("=== INICIANDO TESTE INTEGRADO DE JORNADA DO USUÁRIO ===");

  // 1. Teste de Provisionamento
  console.log("\n1. Testando Provisionamento Mestre...");
  provisionar("senhaAdmin123");
  console.log("-> Provisionado com sucesso:", estaProvisionado());

  // 2. Teste de Autenticação
  console.log("\n2. Testando Autenticação...");
  const auth = autenticar("admin", "senhaAdmin123");
  console.log("-> Login efetuado:", auth.autenticado, "| Papel:", auth.papel);

  // 3. Cadastro de Organização
  console.log("\n3. Criando Organização Geradora...");
  const repoOrg = new Repositorio<Organizacao>(ARQ_ORGANIZACOES);
  const org = FabricaEntidades.criarOrganizacao("Empresa Teste S/A", "11.222.333/0001-81", "gerador");
  repoOrg.salvar([org]);
  console.log("-> Organização registrada:", org.resumo());

  // 4. Registro de Lote
  console.log("\n4. Registrando Lote de Coleta...");
  const repoLote = new Repositorio<Lote>(ARQ_LOTES);
  const dataHoje = new Date().toISOString().slice(0, 10);
  const lote = FabricaEntidades.criarLote(org.id, "NF-9988", "Transportadora Rápida", dataHoje);
  repoLote.salvar([lote]);
  console.log("-> Lote registrado:", lote.resumo());

  // 5. Cadastro e Movimentação de Equipamento
  console.log("\n5. Cadastrando e Triando Equipamento...");
  const repoEq = new Repositorio<Equipamento>(ARQ_EQUIPAMENTOS);
  const eq = FabricaEntidades.criarEquipamento("EQP-TEST-001", lote.id, "Notebook", "Dell Latitude", "A_EXCELENTE");
  eq.triagemConcluida = true;
  eq.status = "triado";
  repoEq.salvar([eq]);
  console.log("-> Equipamento Triado:", eq.resumo());

  console.log("\n=== JORNADA CONCLUÍDA COM SUCESSOsem erros ===");
}

executarJornadaAutomatizada();