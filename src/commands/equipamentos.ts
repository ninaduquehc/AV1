import * as fs from "fs";
import * as caminho from "path";
import { Equipamento } from "../models/equipamento";

const CAMINHO_EQUIPAMENTOS = caminho.join(__dirname, "..", "..", "data", "equipamentos.json");

function carregarEquipamentos(): any[] {
  if (!fs.existsSync(CAMINHO_EQUIPAMENTOS)) return [];
  const conteudo = fs.readFileSync(CAMINHO_EQUIPAMENTOS, "utf-8");
  return JSON.parse(conteudo);
}

function salvarEquipamentos(equipamentos: any[]): void {
  fs.writeFileSync(CAMINHO_EQUIPAMENTOS, JSON.stringify(equipamentos));
}

export function cadastrarEquipamento(id: string, loteId: string, estadoFisico: string): void {
  const equipamento = new Equipamento(id, loteId, estadoFisico);
  const equipamentos = carregarEquipamentos();
  equipamentos.push(equipamento);
  salvarEquipamentos(equipamentos);
  console.log(`Equipamento "${id}" cadastrado com sucesso.`);
}

export function concluirTriagemEquipamento(id: string): void {
  const equipamentos = carregarEquipamentos();
  const equipamento = equipamentos.find((e: any) => e.id === id);

  if (!equipamento) {
    console.log("Equipamento não encontrado.");
    return;
  }

  equipamento.status = "triagem_completa";
  salvarEquipamentos(equipamentos);
  console.log(`Triagem do equipamento "${id}" concluída.`);
}

export function moverEquipamentoParaDesmonte(id: string): void {
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

  equipamento.status = "desmonte";
  salvarEquipamentos(equipamentos);
  console.log(`Equipamento "${id}" movido para desmonte.`);
}