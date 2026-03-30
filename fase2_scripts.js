/* ============================================================
   scripts.js – PetFeliz Petshop | Fase 2
   Funções JavaScript do sistema
   ============================================================ */

"use strict";

/* ----------------------------------------------------------
   1. RELÓGIO DIGITAL E DATA EM TEMPO REAL
   Exibe hora e data atualizadas a cada segundo.
   ---------------------------------------------------------- */
function atualizarRelogio() {
  const elementoRelogio = document.getElementById("relogio-digital");
  const elementoData    = document.getElementById("data-atual");

  if (!elementoRelogio) return; // evita erro em páginas sem o elemento

  const agora = new Date();

  /* Hora formatada: HH:MM:SS */
  const horas    = String(agora.getHours()).padStart(2, "0");
  const minutos  = String(agora.getMinutes()).padStart(2, "0");
  const segundos = String(agora.getSeconds()).padStart(2, "0");
  elementoRelogio.textContent = `${horas}:${minutos}:${segundos}`;

  /* Data formatada: dia da semana, dd/mm/aaaa */
  const diasSemana = [
    "Domingo", "Segunda-feira", "Terça-feira",
    "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"
  ];
  const meses = [
    "janeiro","fevereiro","março","abril","maio","junho",
    "julho","agosto","setembro","outubro","novembro","dezembro"
  ];

  if (elementoData) {
    const diaSemana = diasSemana[agora.getDay()];
    const dia       = agora.getDate();
    const mes       = meses[agora.getMonth()];
    const ano       = agora.getFullYear();
    elementoData.textContent = `${diaSemana}, ${dia} de ${mes} de ${ano}`;
  }
}

/* Inicia relógio assim que o DOM estiver pronto */
document.addEventListener("DOMContentLoaded", function () {
  atualizarRelogio();
  setInterval(atualizarRelogio, 1000);
});


/* ----------------------------------------------------------
   2. AVISO DE HORÁRIO DE FUNCIONAMENTO
   Mostra banner se o petshop estiver fechado.
   Funcionamento: seg–sáb, 08h–18h.
   ---------------------------------------------------------- */
function verificarFuncionamento() {
  const banner = document.getElementById("banner-funcionamento");
  if (!banner) return;

  const agora     = new Date();
  const diaSemana = agora.getDay();   // 0=Dom … 6=Sáb
  const hora      = agora.getHours();

  const aberto = diaSemana >= 1 && diaSemana <= 6 && hora >= 8 && hora < 18;

  if (aberto) {
    banner.className = "alert alert-success text-center fw-bold mb-0";
    banner.innerHTML = "🟢 Estamos <strong>abertos</strong>! Atendimento de segunda a sábado, das 8h às 18h.";
  } else {
    banner.className = "alert alert-warning text-center fw-bold mb-0";
    banner.innerHTML = "🔴 Estamos <strong>fechados</strong> no momento. Horário: seg–sáb, 8h às 18h.";
  }
}

document.addEventListener("DOMContentLoaded", verificarFuncionamento);


/* ----------------------------------------------------------
   3. VALIDAÇÃO E ENVIO DO FORMULÁRIO DE CADASTRO
   Valida campos obrigatórios, CPF e exibe mensagem de sucesso.
   ---------------------------------------------------------- */

/** Valida CPF (algoritmo oficial) */
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf[10]);
}

/** Máscara de CPF enquanto o usuário digita */
function mascaraCPF(campo) {
  let v = campo.value.replace(/\D/g, "").substring(0, 11);
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  campo.value = v;
}

/** Máscara de telefone */
function mascaraTelefone(campo) {
  let v = campo.value.replace(/\D/g, "").substring(0, 11);
  if (v.length <= 10) {
    v = v.replace(/(\d{2})(\d)/, "($1) $2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    v = v.replace(/(\d{2})(\d)/, "($1) $2");
    v = v.replace(/(\d{5})(\d)/, "$1-$2");
  }
  campo.value = v;
}

/** Máscara de CEP */
function mascaraCEP(campo) {
  let v = campo.value.replace(/\D/g, "").substring(0, 8);
  v = v.replace(/(\d{5})(\d)/, "$1-$2");
  campo.value = v;
}

/** Busca endereço via ViaCEP (sem dependências externas) */
async function buscarCEP() {
  const campoCep = document.getElementById("cep");
  if (!campoCep) return;

  const cep = campoCep.value.replace(/\D/g, "");
  if (cep.length !== 8) {
    mostrarFeedback("cep", false, "CEP deve ter 8 dígitos.");
    return;
  }

  try {
    const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados = await resp.json();
    if (dados.erro) {
      mostrarFeedback("cep", false, "CEP não encontrado.");
      return;
    }
    document.getElementById("logradouro").value = dados.logradouro || "";
    document.getElementById("bairro").value     = dados.bairro     || "";
    document.getElementById("cidade").value     = dados.localidade  || "";
    document.getElementById("estado").value     = dados.uf          || "";
    mostrarFeedback("cep", true, "Endereço preenchido.");
  } catch {
    mostrarFeedback("cep", false, "Erro ao buscar CEP. Preencha manualmente.");
  }
}

/** Exibe feedback inline em campo do formulário */
function mostrarFeedback(idCampo, sucesso, mensagem) {
  const campo = document.getElementById(idCampo);
  if (!campo) return;
  const fb = campo.nextElementSibling;
  if (fb && fb.classList.contains("form-text")) {
    fb.textContent = mensagem;
    fb.style.color = sucesso ? "#2e7d32" : "#c62828";
  }
}

/** Processa o envio do formulário de cadastro */
function processarCadastro(evento) {
  evento.preventDefault();
  const form = evento.target;

  /* Validação nativa Bootstrap */
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    form.querySelector(":invalid")?.focus();
    return;
  }

  /* Validação CPF */
  const campoCPF = document.getElementById("cpf");
  if (campoCPF && !validarCPF(campoCPF.value)) {
    campoCPF.setCustomValidity("CPF inválido.");
    form.classList.add("was-validated");
    campoCPF.focus();
    campoCPF.reportValidity();
    return;
  } else {
    campoCPF?.setCustomValidity("");
  }

  /* Sucesso: exibe mensagem e reseta */
  const alerta = document.getElementById("alerta-cadastro");
  if (alerta) {
    alerta.style.display = "block";
    alerta.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => { alerta.style.display = "none"; }, 5000);
  }

  form.reset();
  form.classList.remove("was-validated");
}

/** Processa o envio do formulário de agendamento */
function processarAgendamento(evento) {
  evento.preventDefault();
  const form = evento.target;

  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    form.querySelector(":invalid")?.focus();
    return;
  }

  /* Valida que a data não é no passado */
  const campoData = document.getElementById("data-agendamento");
  if (campoData) {
    const dataSel  = new Date(campoData.value + "T00:00:00");
    const hoje     = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dataSel < hoje) {
      campoData.setCustomValidity("Selecione uma data a partir de hoje.");
      form.classList.add("was-validated");
      campoData.reportValidity();
      return;
    }
    campoData.setCustomValidity("");
  }

  const alerta = document.getElementById("alerta-agendamento");
  if (alerta) {
    alerta.style.display = "block";
    alerta.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => { alerta.style.display = "none"; }, 5000);
  }

  form.reset();
  form.classList.remove("was-validated");
}


/* ----------------------------------------------------------
   4. FILTRO DE PRODUTOS POR CATEGORIA
   Mostra/oculta cards de produto com animação simples.
   ---------------------------------------------------------- */
function filtrarProdutos(categoria) {
  const cards = document.querySelectorAll(".card-produto-wrapper");
  const botoes = document.querySelectorAll(".btn-filtro");

  /* Atualiza estado visual dos botões */
  botoes.forEach(btn => {
    btn.classList.toggle("btn-petfeliz", btn.dataset.categoria === categoria || categoria === "todos");
    btn.classList.toggle("btn-outline-secondary", btn.dataset.categoria !== categoria && categoria !== "todos");
  });

  /* Filtra cards */
  cards.forEach(card => {
    const cat = card.dataset.categoria;
    if (categoria === "todos" || cat === categoria) {
      card.style.display = "block";
      card.style.animation = "fadeIn 0.3s ease";
    } else {
      card.style.display = "none";
    }
  });
}

/* Registra cliques nos botões de filtro após DOM pronto */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".btn-filtro").forEach(btn => {
    btn.addEventListener("click", function () {
      filtrarProdutos(this.dataset.categoria);
    });
  });
});


/* ----------------------------------------------------------
   5. DEFINIR DATA MÍNIMA NO CALENDÁRIO DE AGENDAMENTO
   Impede seleção de datas passadas.
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const campoData = document.getElementById("data-agendamento");
  if (!campoData) return;

  const hoje = new Date();
  const ano  = hoje.getFullYear();
  const mes  = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia  = String(hoje.getDate()).padStart(2, "0");
  campoData.min = `${ano}-${mes}-${dia}`;
});


/* ----------------------------------------------------------
   6. TOGGLE: EXIBIR/OCULTAR CAMPOS DE TELE-BUSCA
   Mostra campos de endereço só se o usuário escolher tele-busca.
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const radios     = document.querySelectorAll('input[name="metodo"]');
  const secaoEnder = document.getElementById("secao-endereco-busca");

  function toggleEndereco() {
    const selecionado = document.querySelector('input[name="metodo"]:checked');
    if (!secaoEnder || !selecionado) return;
    secaoEnder.style.display = selecionado.value === "telebusca" ? "block" : "none";
  }

  radios.forEach(r => r.addEventListener("change", toggleEndereco));
  toggleEndereco(); // estado inicial
});


/* ----------------------------------------------------------
   7. ACESSIBILIDADE: ANUNCIA MUDANÇAS AO LEITOR DE TELA
   Usa uma live region ARIA para notificar alterações dinâmicas.
   ---------------------------------------------------------- */
function anunciarParaLeitor(mensagem) {
  let live = document.getElementById("aria-live-region");
  if (!live) {
    live = document.createElement("div");
    live.id = "aria-live-region";
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");
    live.setAttribute("aria-atomic", "true");
    live.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);";
    document.body.appendChild(live);
  }
  live.textContent = "";
  setTimeout(() => { live.textContent = mensagem; }, 50);
}
