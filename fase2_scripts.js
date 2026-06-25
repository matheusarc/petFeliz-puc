/* ============================================================
   scripts.js – PetFeliz Petshop
   Arquivo central de funções JavaScript do sistema
   ============================================================ */

"use strict";

/* ----------------------------------------------------------
   1. RELÓGIO DIGITAL E DATA EM TEMPO REAL
   Exibe hora e data atualizadas a cada segundo (função temporal
   usando setInterval).
   ---------------------------------------------------------- */
function atualizarRelogio() {
  const elementoRelogio = document.getElementById("relogio-digital");
  const elementoData = document.getElementById("data-atual");

  if (!elementoRelogio) return; // evita erro em páginas sem o elemento

  const agora = new Date();

  /* Hora formatada: HH:MM:SS */
  const horas = String(agora.getHours()).padStart(2, "0");
  const minutos = String(agora.getMinutes()).padStart(2, "0");
  const segundos = String(agora.getSeconds()).padStart(2, "0");
  elementoRelogio.textContent = `${horas}:${minutos}:${segundos}`;

  /* Data formatada: dia da semana, dd de mês de aaaa */
  const diasSemana = [
    "Domingo", "Segunda-feira", "Terça-feira",
    "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"
  ];
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];

  if (elementoData) {
    const diaSemana = diasSemana[agora.getDay()];
    const dia = agora.getDate();
    const mes = meses[agora.getMonth()];
    const ano = agora.getFullYear();
    elementoData.textContent = `${diaSemana}, ${dia} de ${mes} de ${ano}`;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  atualizarRelogio();
  setInterval(atualizarRelogio, 1000);
});


/* ----------------------------------------------------------
   2. AVISO DE HORÁRIO DE FUNCIONAMENTO
   Mostra banner se o petshop estiver aberto ou fechado.
   Funcionamento: segunda a sábado, 08h às 18h.
   ---------------------------------------------------------- */
function verificarFuncionamento() {
  const banner = document.getElementById("banner-funcionamento");
  if (!banner) return;

  const agora = new Date();
  const diaSemana = agora.getDay(); // 0 = Domingo … 6 = Sábado
  const hora = agora.getHours();

  const aberto = diaSemana >= 1 && diaSemana <= 6 && hora >= 8 && hora < 18;

  if (aberto) {
    banner.className = "alert alert-success mb-0 text-center fw-bold";
    banner.innerHTML =
      '<i class="bi bi-clock-fill me-1" aria-hidden="true"></i> ' +
      "Estamos <strong>abertos</strong> agora! Atendimento de segunda a sábado, das 8h às 18h.";
  } else {
    banner.className = "alert alert-warning mb-0 text-center fw-bold";
    banner.innerHTML =
      '<i class="bi bi-clock-fill me-1" aria-hidden="true"></i> ' +
      "Estamos <strong>fechados</strong> no momento. Horário de atendimento: seg. a sáb., 8h às 18h.";
  }
}

document.addEventListener("DOMContentLoaded", verificarFuncionamento);
/* Revalida a cada minuto, para o banner mudar sozinho no horário de abrir/fechar */
setInterval(verificarFuncionamento, 60000);


/* ----------------------------------------------------------
   3. MÁSCARAS E VALIDAÇÃO DE CAMPOS
   ---------------------------------------------------------- */

/** Valida CPF pelo algoritmo oficial de dígitos verificadores */
function validarCPF(cpf) {
  cpf = String(cpf).replace(/[^\d]/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i], 10) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9], 10)) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i], 10) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf[10], 10);
}

/** Aplica máscara de CPF (000.000.000-00) enquanto o usuário digita */
function mascaraCPF(campo) {
  let v = campo.value.replace(/\D/g, "").substring(0, 11);
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  campo.value = v;
}

/** Aplica máscara de telefone/WhatsApp, com e sem o 9º dígito */
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

/** Aplica máscara de CEP (00000-000) */
function mascaraCEP(campo) {
  let v = campo.value.replace(/\D/g, "").substring(0, 8);
  v = v.replace(/(\d{5})(\d)/, "$1-$2");
  campo.value = v;
}

/**
 * Busca endereço via API pública ViaCEP (fetch assíncrono) e preenche
 * automaticamente os campos de logradouro, bairro, cidade e estado.
 * @param {string} prefixo  prefixo dos IDs dos campos (ex.: "" ou "tb-")
 */
async function buscarCEP(prefixo = "") {
  const idCep = prefixo ? `${prefixo}cep` : "cep";
  const campoCep = document.getElementById(idCep);
  if (!campoCep) return;

  const cep = campoCep.value.replace(/\D/g, "");
  if (cep.length !== 8) {
    mostrarFeedback(idCep, false, "O CEP deve conter 8 dígitos.");
    return;
  }

  const idLogradouro = prefixo ? `${prefixo}logradouro` : "logradouro";
  const idBairro = prefixo ? `${prefixo}bairro` : "bairro";
  const idCidade = prefixo ? `${prefixo}cidade` : "cidade";
  const idEstado = prefixo ? `${prefixo}estado` : "estado";

  try {
    mostrarFeedback(idCep, true, "Buscando endereço…");
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados = await resposta.json();

    if (dados.erro) {
      mostrarFeedback(idCep, false, "CEP não encontrado. Verifique e tente novamente.");
      return;
    }

    const campoLogradouro = document.getElementById(idLogradouro);
    const campoBairro = document.getElementById(idBairro);
    const campoCidade = document.getElementById(idCidade);
    const campoEstado = document.getElementById(idEstado);

    if (campoLogradouro) campoLogradouro.value = dados.logradouro || "";
    if (campoBairro) campoBairro.value = dados.bairro || "";
    if (campoCidade) campoCidade.value = dados.localidade || "";
    if (campoEstado) campoEstado.value = dados.uf || "";

    mostrarFeedback(idCep, true, "Endereço encontrado e preenchido automaticamente.");
    anunciarParaLeitor("Endereço encontrado e preenchido automaticamente.");

    /* Move o foco para o campo de número, agilizando o preenchimento */
    const idNumero = prefixo ? `${prefixo}numero` : "numero";
    document.getElementById(idNumero)?.focus();
  } catch (erro) {
    mostrarFeedback(idCep, false, "Não foi possível buscar o CEP agora. Preencha manualmente.");
  }
}

/** Exibe uma mensagem de feedback (sucesso/erro) abaixo de um campo do formulário */
function mostrarFeedback(idCampo, sucesso, mensagem) {
  const campo = document.getElementById(idCampo);
  if (!campo) return;

  /* Procura um elemento .form-text associado ao campo (irmão mais próximo) */
  let referencia = campo.closest(".input-group") || campo;
  let fb = referencia.parentElement.querySelector(".form-text");

  if (fb) {
    fb.textContent = mensagem;
    fb.style.color = sucesso ? "#2e7d32" : "#c62828";
    fb.style.fontWeight = "600";
  }
}


/* ----------------------------------------------------------
   4. CONTADOR DE CARACTERES PARA CAMPOS DE TEXTO LONGOS
   Atualiza um contador "x / máximo" enquanto o usuário digita.
   ---------------------------------------------------------- */
function configurarContadorCaracteres() {
  document.querySelectorAll("textarea[maxlength]").forEach((campo) => {
    const max = campo.getAttribute("maxlength");
    const idContador = `contador-${campo.id}`;
    let contador = document.getElementById(idContador);

    if (!contador) {
      contador = document.createElement("div");
      contador.id = idContador;
      contador.className = "form-text text-end";
      contador.setAttribute("aria-live", "polite");
      campo.insertAdjacentElement("afterend", contador);
    }

    const atualizar = () => {
      contador.textContent = `${campo.value.length} / ${max} caracteres`;
    };

    campo.addEventListener("input", atualizar);
    atualizar();
  });
}

document.addEventListener("DOMContentLoaded", configurarContadorCaracteres);


/* ----------------------------------------------------------
   5. PROCESSAMENTO DOS FORMULÁRIOS (CADASTRO E AGENDAMENTO)
   ---------------------------------------------------------- */

/** Processa o envio do formulário de cadastro de cliente e pet */
function processarCadastro(evento) {
  evento.preventDefault();
  const form = evento.target;

  /* Validação nativa do Bootstrap (campos required, type=email, etc.) */
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    const primeiroInvalido = form.querySelector(":invalid");
    primeiroInvalido?.focus();
    anunciarParaLeitor("Há campos obrigatórios não preenchidos corretamente. Verifique o formulário.");
    return;
  }

  /* Validação adicional do CPF (algoritmo de dígitos verificadores) */
  const campoCPF = document.getElementById("cpf");
  if (campoCPF && !validarCPF(campoCPF.value)) {
    campoCPF.setCustomValidity("CPF inválido.");
    form.classList.add("was-validated");
    campoCPF.focus();
    campoCPF.reportValidity();
    anunciarParaLeitor("O CPF informado é inválido. Verifique os números digitados.");
    return;
  }
  campoCPF?.setCustomValidity("");

  /* Sucesso: exibe mensagem, anuncia para leitor de tela e reseta o formulário */
  exibirAlertaSucesso("alerta-cadastro");
  anunciarParaLeitor("Cadastro realizado com sucesso! Entraremos em contato em breve.");

  form.reset();
  form.classList.remove("was-validated");
  document.querySelectorAll(".form-text[id^='contador-']").forEach((c) => (c.textContent = ""));
}

/** Processa o envio do formulário de agendamento de serviço */
function processarAgendamento(evento) {
  evento.preventDefault();
  const form = evento.target;

  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    form.querySelector(":invalid")?.focus();
    anunciarParaLeitor("Há campos obrigatórios não preenchidos corretamente. Verifique o formulário.");
    return;
  }

  /* Garante que a data escolhida não é anterior a hoje */
  const campoData = document.getElementById("data-agendamento");
  if (campoData) {
    const dataSelecionada = new Date(campoData.value + "T00:00:00");
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataSelecionada < hoje) {
      campoData.setCustomValidity("Selecione uma data a partir de hoje.");
      form.classList.add("was-validated");
      campoData.reportValidity();
      anunciarParaLeitor("A data selecionada já passou. Escolha uma data a partir de hoje.");
      return;
    }
    campoData.setCustomValidity("");
  }

  /* Monta um pequeno resumo do agendamento, exibido no alerta de sucesso */
  const servicoSelect = document.getElementById("ag-servico");
  const metodoSelecionado = document.querySelector('input[name="metodo"]:checked');
  const resumo = document.getElementById("resumo-agendamento");

  if (resumo && servicoSelect && campoData && metodoSelecionado) {
    const nomeServico = servicoSelect.options[servicoSelect.selectedIndex]?.text || "";
    const dataFormatada = formatarDataBR(campoData.value);
    const horario = document.getElementById("horario")?.value || "";
    const metodoTexto = metodoSelecionado.value === "telebusca" ? "Tele-busca" : "Entrega no local";

    resumo.textContent = `${nomeServico} • ${metodoTexto} • ${dataFormatada} às ${horario}`;
  }

  exibirAlertaSucesso("alerta-agendamento");
  anunciarParaLeitor("Agendamento realizado com sucesso! Você receberá uma confirmação por e-mail e WhatsApp.");

  form.reset();
  form.classList.remove("was-validated");

  /* Restaura o estado inicial dos campos condicionais de tele-busca */
  const secaoEndereco = document.getElementById("secao-endereco-busca");
  if (secaoEndereco) secaoEndereco.style.display = "none";
  const radioPresencial = document.getElementById("radio-presencial");
  if (radioPresencial) radioPresencial.checked = true;
}

/** Exibe um alerta de sucesso, rola a tela até ele e o oculta após alguns segundos */
function exibirAlertaSucesso(idAlerta) {
  const alerta = document.getElementById(idAlerta);
  if (!alerta) return;

  alerta.style.display = "block";
  alerta.scrollIntoView({ behavior: "smooth", block: "center" });

  clearTimeout(alerta._timeoutOcultar);
  alerta._timeoutOcultar = setTimeout(() => {
    alerta.style.display = "none";
  }, 6000);
}

/** Converte "aaaa-mm-dd" em "dd/mm/aaaa" */
function formatarDataBR(dataISO) {
  if (!dataISO) return "";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}


/* ----------------------------------------------------------
   6. FILTRO DE PRODUTOS POR CATEGORIA (página produtos.html)
   ---------------------------------------------------------- */
function filtrarProdutos(categoria) {
  const cards = document.querySelectorAll(".card-produto-wrapper");
  const botoes = document.querySelectorAll(".btn-filtro");

  botoes.forEach((btn) => {
    const ativo = btn.dataset.categoria === categoria;
    btn.classList.toggle("btn-petfeliz", ativo);
    btn.classList.toggle("btn-outline-secondary", !ativo);
    btn.setAttribute("aria-pressed", ativo ? "true" : "false");
  });

  let visiveis = 0;
  cards.forEach((card) => {
    const cat = card.dataset.categoria;
    if (categoria === "todos" || cat === categoria) {
      card.style.display = "";
      card.style.animation = "fadeIn 0.35s ease";
      visiveis++;
    } else {
      card.style.display = "none";
    }
  });

  const contador = document.getElementById("contador-produtos");
  if (contador) {
    contador.textContent = `${visiveis} produto${visiveis === 1 ? "" : "s"} encontrado${visiveis === 1 ? "" : "s"}`;
  }
  anunciarParaLeitor(`Exibindo ${visiveis} produto${visiveis === 1 ? "" : "s"} na categoria selecionada.`);
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".btn-filtro").forEach((btn) => {
    btn.addEventListener("click", function () {
      filtrarProdutos(this.dataset.categoria);
    });
  });
});


/* ----------------------------------------------------------
   7. CALENDÁRIO DE AGENDAMENTO
   Impede a seleção de datas passadas e de domingos (loja fechada).
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const campoData = document.getElementById("data-agendamento");
  if (!campoData) return;

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  campoData.min = `${ano}-${mes}-${dia}`;

  /* Define também uma data máxima de 60 dias no futuro, evitando agendamentos distantes demais */
  const limite = new Date();
  limite.setDate(limite.getDate() + 60);
  campoData.max = limite.toISOString().split("T")[0];

  /* Avisa (sem bloquear) se a data escolhida cair em um domingo */
  campoData.addEventListener("change", function () {
    if (!this.value) return;
    const dataEscolhida = new Date(this.value + "T00:00:00");
    const avisoDomingo = document.getElementById("aviso-domingo");

    if (dataEscolhida.getDay() === 0) {
      this.setCustomValidity("Não atendemos aos domingos. Escolha outro dia.");
      if (avisoDomingo) avisoDomingo.style.display = "block";
      anunciarParaLeitor("Atenção: não atendemos aos domingos. Escolha outra data.");
    } else {
      this.setCustomValidity("");
      if (avisoDomingo) avisoDomingo.style.display = "none";
    }
  });
});


/* ----------------------------------------------------------
   8. TOGGLE: EXIBIR/OCULTAR CAMPOS DE ENDEREÇO PARA TELE-BUSCA
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const radios = document.querySelectorAll('input[name="metodo"]');
  const secaoEndereco = document.getElementById("secao-endereco-busca");
  if (!radios.length || !secaoEndereco) return;

  const camposEndereco = secaoEndereco.querySelectorAll("input");

  function alternarEndereco() {
    const selecionado = document.querySelector('input[name="metodo"]:checked');
    if (!selecionado) return;

    const ehTelebusca = selecionado.value === "telebusca";
    secaoEndereco.style.display = ehTelebusca ? "block" : "none";

    /* Só exige os campos de endereço quando tele-busca está selecionada */
    camposEndereco.forEach((campo) => {
      if (campo.dataset.obrigatorioBase === "true") {
        campo.required = ehTelebusca;
      }
    });

    if (ehTelebusca) {
      anunciarParaLeitor("Tele-busca selecionada. Informe o endereço de busca do pet.");
    }
  }

  /* Marca quais campos do bloco de tele-busca devem ser obrigatórios quando exibidos */
  camposEndereco.forEach((campo) => {
    if (campo.hasAttribute("data-obrigatorio")) {
      campo.dataset.obrigatorioBase = "true";
    }
  });

  radios.forEach((r) => r.addEventListener("change", alternarEndereco));
  alternarEndereco(); // aplica o estado inicial ao carregar a página
});


/* ----------------------------------------------------------
   9. BOTÃO "VOLTAR AO TOPO"
   Aparece após rolar a página e leva suavemente ao início.
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  let botao = document.getElementById("btn-topo");

  if (!botao) {
    botao = document.createElement("button");
    botao.id = "btn-topo";
    botao.type = "button";
    botao.className = "btn btn-petfeliz";
    botao.setAttribute("aria-label", "Voltar ao topo da página");
    botao.innerHTML = '<i class="bi bi-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(botao);
  }

  window.addEventListener("scroll", function () {
    botao.classList.toggle("mostrar", window.scrollY > 400);
  });

  botao.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector(".navbar-brand")?.focus();
  });
});


/* ----------------------------------------------------------
   10. ACESSIBILIDADE: LIVE REGION PARA LEITORES DE TELA
   Cria (uma única vez) uma região ARIA invisível usada para
   anunciar mensagens dinâmicas (sucesso, erro, filtros, etc.).
   ---------------------------------------------------------- */
function anunciarParaLeitor(mensagem) {
  let live = document.getElementById("aria-live-region");

  if (!live) {
    live = document.createElement("div");
    live.id = "aria-live-region";
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");
    live.setAttribute("aria-atomic", "true");
    live.className = "visualmente-oculto";
    document.body.appendChild(live);
  }

  live.textContent = "";
  setTimeout(() => {
    live.textContent = mensagem;
  }, 50);
}


/* ----------------------------------------------------------
   11. ANO ATUAL NO RODAPÉ
   Mantém o ano do copyright sempre atualizado automaticamente.
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".ano-atual").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});