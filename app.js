// ------------------------------------------------------------------ //
// app.js — lógica da aplicação SalaViva (JavaScript puro + Bootstrap) //
// ------------------------------------------------------------------ //

import { infraestrutura, agendamentosIniciais, TURNOS } from "./src/dados.js";

// Estado da aplicação: começa com uma cópia dos agendamentos iniciais.
let agendamentos = agendamentosIniciais.slice();

// Referências aos elementos da página.
const corpoTabela = document.getElementById("corpoTabela");
const containerTabela = document.getElementById("containerTabela");
const alertaVazio = document.getElementById("alertaVazio");

const formAgendamento = document.getElementById("formAgendamento");
const campoSolicitante = document.getElementById("campoSolicitante");
const campoBloco = document.getElementById("campoBloco");
const campoSala = document.getElementById("campoSala");
const campoData = document.getElementById("campoData");
const campoTurno = document.getElementById("campoTurno");
const alertaErro = document.getElementById("alertaErro");
const alertaErroTexto = document.getElementById("alertaErroTexto");
const modalElemento = document.getElementById("modalNovoAgendamento");

// ------------------------------------------------------------------ //
// Inicialização                                                      //
// ------------------------------------------------------------------ //
function iniciar() {
  preencherBlocos();
  preencherTurnos();
  campoBloco.addEventListener("change", atualizarSalas);
  formAgendamento.addEventListener("submit", salvarAgendamento);
  modalElemento.addEventListener("hidden.bs.modal", limparFormulario);
  renderizar();
}

// ------------------------------------------------------------------ //
// Preenchimento dos selects                                          //
// ------------------------------------------------------------------ //
function preencherBlocos() {
  infraestrutura.forEach(function (item) {
    const opcao = document.createElement("option");
    opcao.value = item.bloco;
    opcao.textContent = item.bloco;
    campoBloco.appendChild(opcao);
  });
}

function preencherTurnos() {
  TURNOS.forEach(function (turno) {
    const opcao = document.createElement("option");
    opcao.value = turno;
    opcao.textContent = turno;
    campoTurno.appendChild(opcao);
  });
}

// Select dependente: as salas mudam conforme o bloco escolhido.
function atualizarSalas() {
  const blocoSelecionado = campoBloco.value;
  campoSala.innerHTML = "";

  if (!blocoSelecionado) {
    campoSala.disabled = true;
    campoSala.appendChild(criarOpcao("", "Escolha um bloco primeiro"));
    return;
  }

  const bloco = infraestrutura.find(function (b) {
    return b.bloco === blocoSelecionado;
  });

  campoSala.disabled = false;
  campoSala.appendChild(criarOpcao("", "Selecione..."));
  bloco.salas.forEach(function (sala) {
    campoSala.appendChild(criarOpcao(sala, sala));
  });
}

function criarOpcao(valor, texto) {
  const opcao = document.createElement("option");
  opcao.value = valor;
  opcao.textContent = texto;
  return opcao;
}

// ------------------------------------------------------------------ //
// Salvar (com validação de colisão)                                  //
// ------------------------------------------------------------------ //
function salvarAgendamento(evento) {
  evento.preventDefault();

  const dados = {
    solicitante: campoSolicitante.value.trim(),
    bloco: campoBloco.value,
    sala: campoSala.value,
    data: campoData.value,
    turno: campoTurno.value,
  };

  // Todos os campos são obrigatórios.
  if (!dados.solicitante || !dados.bloco || !dados.sala || !dados.data || !dados.turno) {
    mostrarErro("Preencha todos os campos para confirmar a reserva.");
    return;
  }

  // Colisão: mesma sala + bloco + data + turno.
  const colisao = agendamentos.some(function (a) {
    return (
      a.bloco === dados.bloco &&
      a.sala === dados.sala &&
      a.data === dados.data &&
      a.turno === dados.turno
    );
  });

  if (colisao) {
    mostrarErro(
      "Conflito de Agendamento: A " +
        dados.sala +
        " do " +
        dados.bloco +
        " já está ocupada no turno da " +
        dados.turno +
        " na data selecionada."
    );
    return; // A modal NÃO fecha.
  }

  // Sucesso: adiciona ao estado.
  dados.id = Date.now();
  agendamentos.push(dados);

  esconderErro();
  renderizar();

  // Fecha a modal via código JS (os campos são resetados no evento hidden).
  bootstrap.Modal.getOrCreateInstance(modalElemento).hide();
}

// ------------------------------------------------------------------ //
// Exclusão                                                           //
// ------------------------------------------------------------------ //
function excluirAgendamento(id) {
  agendamentos = agendamentos.filter(function (a) {
    return a.id !== id;
  });
  renderizar();
}

// ------------------------------------------------------------------ //
// Renderização (tabela, estado vazio e métricas)                     //
// ------------------------------------------------------------------ //
function renderizar() {
  atualizarMetricas();

  // Estado vazio: oculta a tabela e mostra o Alert obrigatório.
  if (agendamentos.length === 0) {
    containerTabela.classList.add("d-none");
    alertaVazio.classList.remove("d-none");
    corpoTabela.innerHTML = "";
    return;
  }

  containerTabela.classList.remove("d-none");
  alertaVazio.classList.add("d-none");

  // Ordena por data.
  const ordenados = agendamentos.slice().sort(function (a, b) {
    return a.data.localeCompare(b.data);
  });

  corpoTabela.innerHTML = "";
  ordenados.forEach(function (a) {
    const linha = document.createElement("tr");
    linha.innerHTML =
      '<td class="ps-4 fw-bold">' +
      formatarData(a.data) +
      "</td>" +
      "<td>" +
      '<span class="fw-semibold">' +
      a.sala +
      "</span>" +
      '<div class="mono small text-secondary">' +
      a.bloco +
      "</div>" +
      "</td>" +
      '<td class="text-secondary">' +
      a.solicitante +
      "</td>" +
      "<td><span class='sv-badge " +
      badgeTurno(a.turno) +
      "'>" +
      a.turno +
      "</span></td>" +
      '<td class="text-end pe-4">' +
      "<button class='btn btn-sm btn-danger' data-id='" +
      a.id +
      "'><i class='bi bi-trash me-1'></i> Excluir</button>" +
      "</td>";

    // Liga o botão Excluir desta linha.
    linha.querySelector("button").addEventListener("click", function () {
      excluirAgendamento(a.id);
    });

    corpoTabela.appendChild(linha);
  });
}

function atualizarMetricas() {
  document.getElementById("kpiTotal").textContent = agendamentos.length;
  document.getElementById("kpiManha").textContent = contarTurno("Manhã");
  document.getElementById("kpiTarde").textContent = contarTurno("Tarde");
  document.getElementById("kpiNoite").textContent = contarTurno("Noite");
}

function contarTurno(turno) {
  return agendamentos.filter(function (a) {
    return a.turno === turno;
  }).length;
}

// ------------------------------------------------------------------ //
// Auxiliares                                                         //
// ------------------------------------------------------------------ //
function mostrarErro(mensagem) {
  alertaErroTexto.textContent = mensagem;
  alertaErro.classList.remove("d-none");
}

function esconderErro() {
  alertaErro.classList.add("d-none");
}

function limparFormulario() {
  formAgendamento.reset();
  campoSala.innerHTML = "";
  campoSala.appendChild(criarOpcao("", "Escolha um bloco primeiro"));
  campoSala.disabled = true;
  esconderErro();
}

function badgeTurno(turno) {
  if (turno === "Noite") return "sv-badge-noite";
  if (turno === "Tarde") return "sv-badge-tarde";
  return "sv-badge-manha";
}

function formatarData(iso) {
  const partes = iso.split("-");
  if (partes.length !== 3) return iso;
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// Inicia quando o DOM estiver pronto.
document.addEventListener("DOMContentLoaded", iniciar);
