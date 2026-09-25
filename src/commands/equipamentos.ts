import * as fs from "fs";
import * as caminho from "path";
import { Equipamento } from "../models/equipamento";
import { criptografar, descriptografar, escreverAtomico } from "../persistence/armazenamento";
import { registrarTransacao } from "../persistence/journal";

const CAMINHO_EQUIPAMENTOS = caminho.join(__dirname, "..", "..", "data", "equipamentos.enc");

function carregarEquipamentos(): any[] {
  if (!fs.existsSync(CAMINHO_EQUIPAMENTOS)) return [];
  const conteudoCriptografado = fs.readFileSync(CAMINHO_EQUIPAMENTOS, "utf-8");
  const conteudo = descriptografar(conteudoCriptografado);
  return JSON.parse(conteudo);
}

function salvarEquipamentos(equipamentos: any[]): void {
  const conteudoCriptografado = criptografar(JSON.stringify(equipamentos));
  escreverAtomico(CAMINHO_EQUIPAMENTOS, conteudoCriptografado);
}

export function cadastrarEquipamento(id: string, loteId: string, estadoFisico: string, usuarioLogado: string): void {
  registrarTransacao(usuarioLogado, "cadastrar_equipamento", { id, loteId, estadoFisico });

  const equipamento = new Equipamento(id, loteId, estadoFisico);
  const equipamentos = carregarEquipamentos();
  equipamentos.push(equipamento);
  salvarEquipamentos(equipamentos);
  console.log(`Equipamento "${id}" cadastrado com sucesso.`);
}

export function concluirTriagemEquipamento(id: string, usuarioLogado: string): void {
  const equipamentos = carregarEquipamentos();
  const equipamento = equipamentos.find((e: any) => e.id === id);

  if (!equipamento) {
    console.log("Equipamento não encontrado.");
    return;
  }

  registrarTransacao(usuarioLogado, "concluir_triagem", { id });

  equipamento.status = "triagem_completa";
  salvarEquipamentos(equipamentos);
  console.log(`Triagem do equipamento "${id}" concluída.`);
}

export function moverEquipamentoParaDesmonte(id: string, usuarioLogado: string): void {
  const equipamentos = carregarEquipamentos();
  const equipamento = equipamentos.find((e: any) => e.id === id);

  if (!equipamento) {
    console.log("Equipamento não encontrado.");
    return;
  }

  if (equipamento.status !== "triagem_completa") {
    console.log("Equipamento precisa concluir a triagem antes do desmonte.");
    return;
  }

  registrarTransacao(usuarioLogado, "mover_para_desmonte", { id });

  equipamento.status = "desmonte";
  salvarEquipamentos(equipamentos);
  console.log(`Equipamento "${id}" movido para desmonte.`);
}