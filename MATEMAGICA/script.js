/* =====================
   ESTADO GLOBAL DO JOGO (MULTIJOGADOR)
===================== */
let numJogadores = 1;
let jogadores = [];                // [{ id, nome, personagem, posicaoAtual, icone }]
let personagensSelecionados = [];

let jogadoresTabuleiro = [];
let jogadorAtualIndex = 0;         // começa no jogador 0
let perguntas = [];
let dadoValor = 0;
let currentQuestion = null;

/* =====================
   NAVEGAÇÃO ENTRE TELAS
===================== */
function irParaPersonagem() {
  window.location.href = "personagem.html";
}

function irParaTabuleiro() {
  // exige todos os nomes preenchidos
  if (jogadores.length < numJogadores || jogadores.some(j => !j.nome || j.nome.trim() === '')) {
    alert(`Por favor, selecione e preencha o nome para os ${numJogadores} jogadores.`);
    return;
  }
  localStorage.setItem("jogadoresMatemagica", JSON.stringify(jogadores));
  window.location.href = "tabuleiro.html";
}

/* =====================
   TELA DE SELEÇÃO
===================== */
// Mudou nº de jogadores
function gerarCamposDeNome() {
  const select = document.getElementById('numJogadores');
  numJogadores = parseInt(select.value, 10);

  // reset
  jogadores = [];
  personagensSelecionados = [];
  document.querySelectorAll('.card-personagem').forEach(card => {
    card.classList.remove('selecionado');
    const wrapper = card.querySelector('.input-nome-wrapper');
    wrapper.innerHTML = '';
  });

  const btn = document.getElementById('btnComecar');
  if (btn) btn.disabled = true;

  // se 1 jogador, já prepara o primeiro card
  if (numJogadores === 1) {
    const primeiroCardWrapper = document.getElementById('inputWrapper-Cavaleira');
    if (primeiroCardWrapper) {
      primeiroCardWrapper.innerHTML = `
        <input type="text"
               id="nome-Cavaleira"
               class="input-nome-jogador"
               placeholder="Seu nome"
               oninput="validarSelecao()"
               onclick="event.stopPropagation()">
      `;
      const primeiroCard = primeiroCardWrapper.closest('.card-personagem');
      primeiroCard.classList.add('selecionado');
      personagensSelecionados.push('Cavaleira');
    }
  }
}

// Clique em um card
function selecionarPersonagem(cardElement, event) {
  // impede desselecionar ao clicar dentro do input
  if (event && event.target.tagName.toLowerCase() === 'input') {
    event.stopPropagation();
    return;
  }

  const nomePersonagem = cardElement.getAttribute('data-personagem');
  const isSelecionado = cardElement.classList.contains('selecionado');
  const nomeInputWrapper = document.getElementById(`inputWrapper-${nomePersonagem}`);

  if (isSelecionado) {
    cardElement.classList.remove('selecionado');
    personagensSelecionados = personagensSelecionados.filter(p => p !== nomePersonagem);
    nomeInputWrapper.innerHTML = '';
    jogadores = jogadores.filter(j => j.personagem !== nomePersonagem);
  } else {
    if (personagensSelecionados.length < numJogadores) {
      cardElement.classList.add('selecionado');
      personagensSelecionados.push(nomePersonagem);
      const jogadorIndex = personagensSelecionados.length;
      nomeInputWrapper.innerHTML = `
        <input type="text"
               id="nome-${nomePersonagem}"
               class="input-nome-jogador"
               placeholder="Nome Jogador ${jogadorIndex}"
               oninput="validarSelecao()"
               onclick="event.stopPropagation()">
      `;
    } else {
      alert(`Você já selecionou o máximo de ${numJogadores} jogadores.`);
    }
  }

  validarSelecao();
}

// Valida nomes + monta array de jogadores
function validarSelecao() {
  jogadores = [];
  let nomesCompletos = true;

  document.querySelectorAll('.card-personagem.selecionado').forEach((card, index) => {
    const nomePersonagem = card.getAttribute('data-personagem');
    const inputNome = document.getElementById(`nome-${nomePersonagem}`);
    const nomeJogador = inputNome ? inputNome.value.trim() : '';

    if (!nomeJogador) nomesCompletos = false;

    jogadores.push({
      id: index + 1,
      nome: nomeJogador || `Jogador ${index + 1}`,
      personagem: nomePersonagem,
      posicaoAtual: 0,
      icone: obterIcone(nomePersonagem)
    });
  });

  const btn = document.getElementById('btnComecar');
  if (btn) btn.disabled = !(jogadores.length === numJogadores && nomesCompletos);
}

// Ícones por personagem
function obterIcone(personagem) {
  switch (personagem) {
    case 'Cavaleira': return '🧝‍♀️';
    case 'Cavaleiro': return '🛡️';
    case 'Mago':      return '🧙';
    case 'Princesa':  return '👸';
    default:          return '♟️';
  }
}

/* ============================
   CARREGAR PERGUNTAS DO JSON
============================ */
fetch("fases.json")
  .then(response => response.json())
  .then(data => {
    perguntas = data;
    localStorage.setItem("perguntasMatemagica", JSON.stringify(data));
    console.log("✅ Perguntas carregadas com sucesso!");
  })
  .catch(error => console.error("❌ Erro ao carregar perguntas:", error));

/* ============================
   BOOT: detectar tela e iniciar
============================ */
window.addEventListener('load', function () {
  // Tela de seleção?
  if (document.getElementById('numJogadores')) {
    gerarCamposDeNome();
    return;
  }

  // Tela do tabuleiro
  const jogadoresData = localStorage.getItem("jogadoresMatemagica");
  if (jogadoresData) {
    jogadoresTabuleiro = JSON.parse(jogadoresData);
  } else {
    console.error("Dados de jogadores não encontrados. Redirecionando.");
    return;
  }

  perguntas = JSON.parse(localStorage.getItem("perguntasMatemagica")) || [];

  if (document.getElementById("tabuleiro")) {
    gerarTabuleiro();
    atualizarDisplayJogadorAtual();

    const btnDado = document.getElementById('btnJogarDado');
    if (btnDado) btnDado.addEventListener('click', jogarDado);

    const btnConfirm = document.getElementById('btnConfirmarResposta');
    if (btnConfirm) btnConfirm.addEventListener('click', verificarResposta);
  }
});

/* ============================
   TABULEIRO
============================ */
function atualizarDisplayJogadorAtual() {
  const jogadorAtual = jogadoresTabuleiro[jogadorAtualIndex];
  const nomeDisplay = document.getElementById("nomeJogadorDisplay");
  const btnDado = document.getElementById('btnJogarDado');

  if (nomeDisplay) {
    nomeDisplay.textContent = `Vez de: ${jogadorAtual.nome} (${jogadorAtual.personagem} ${jogadorAtual.icone})`;
  }
  if (btnDado) btnDado.disabled = false;
}

function proximoJogador() {
  jogadorAtualIndex = (jogadorAtualIndex + 1) % jogadoresTabuleiro.length;
  atualizarDisplayJogadorAtual();
}

function gerarTabuleiro() {
  const tabuleiro = document.getElementById("tabuleiro");
  if (!tabuleiro) return;

  tabuleiro.innerHTML = '';

  // casas 0..35
  for (let i = 0; i <= 35; i++) {
    const casa = document.createElement("div");
    casa.classList.add("casa");
    casa.textContent = i;
    casa.id = `casa${i}`;
    tabuleiro.appendChild(casa);
  }

  // coloca os jogadores na casa 0
  jogadoresTabuleiro.forEach(jogador => {
    const jogadorEl = document.createElement("div");
    jogadorEl.classList.add("jogador");
    jogadorEl.id = `jogador-${jogador.id}`;
    jogadorEl.textContent = jogador.icone;

    const casa0 = document.getElementById('casa0');
    if (casa0) casa0.appendChild(jogadorEl);

    atualizarPosicao(jogador);
  });
}

/* ============================
   DADO E PERGUNTAS
============================ */
function jogarDado() {
  const btnDado = document.getElementById('btnJogarDado');
  if (btnDado) btnDado.disabled = true;

  dadoValor = Math.floor(Math.random() * 6) + 1;

  const resultadoDado = document.getElementById('resultadoDado');
  if (resultadoDado) resultadoDado.textContent = `Você tirou ${dadoValor}!`;

  mostrarPerguntaParaAvanco();
}

function mostrarPerguntaParaAvanco() {
  const jogadorAtual = jogadoresTabuleiro[jogadorAtualIndex];
  const target = Math.min(jogadorAtual.posicaoAtual + dadoValor, 35);

  // Casa 0 não tem pergunta => vetor é [target - 1]
  const qObj = perguntas[target - 1];

  // Última casa (35) ou sem pergunta: avança direto
  if (!qObj || !qObj.pergunta || target === 35) {
    jogadorAtual.posicaoAtual = target;
    atualizarPosicao(jogadorAtual);
    if (jogadorAtual.posicaoAtual >= 35) {
      mostrarVitoria(jogadorAtual.nome);
    } else {
      proximoJogador();
    }
    return;
  }

  currentQuestion = { target, q: qObj.pergunta, a: qObj.resposta };
  const overlay = document.getElementById('telaPergunta');
  if (overlay) {
    document.getElementById('textoPergunta').textContent =
      `${jogadorAtual.nome}, Casa ${target}: ${currentQuestion.q}`;
    const ansInput = document.getElementById('respostaJogador');
    if (ansInput) {
      ansInput.value = '';
      if (typeof ansInput.focus === 'function') ansInput.focus(); // foco corrigido
    }
    overlay.style.display = 'flex';
  }
}

/* ============================
   RESPOSTA E FEEDBACK
============================ */
function verificarResposta() {
  const jogadorAtual = jogadoresTabuleiro[jogadorAtualIndex];
  const ansInput = document.getElementById('respostaJogador');
  const ans = ansInput ? ansInput.value.trim() : '';

  if (!currentQuestion) return;

  document.getElementById('telaPergunta').style.display = 'none';
  const correct = (ans === currentQuestion.a) || (Number(ans) === Number(currentQuestion.a));

  if (correct) {
    jogadorAtual.posicaoAtual = currentQuestion.target;
    atualizarPosicao(jogadorAtual);
    mostrarFeedback(true, currentQuestion.q, currentQuestion.a, jogadorAtual.nome);
    if (jogadorAtual.posicaoAtual >= 35) {
      setTimeout(() => mostrarVitoria(jogadorAtual.nome), 700);
    }
  } else {
    mostrarFeedback(false, currentQuestion.q, currentQuestion.a, jogadorAtual.nome);
  }
}

function mostrarFeedback(ok, q, ansCorreta, nomeJogador) {
  const fb = document.getElementById('feedback');
  if (!fb) return;
  fb.style.display = 'flex';
  document.getElementById('feedbackTitulo').textContent =
    ok ? `✅ ${nomeJogador} acertou!` : `❌ ${nomeJogador} errou!`;
  document.getElementById('feedbackTexto').textContent =
    ok ? `Pergunta: ${q} = ${ansCorreta}` : `Pergunta: ${q}. A resposta correta era: ${ansCorreta}`;

  // continuar: fecha feedback, reabilita dado e passa a vez
  document.getElementById('btnContinuar').onclick = function () {
    continuarJogo();
    proximoJogador();
  };
}

function continuarJogo() {
  const fb = document.getElementById('feedback');
  if (fb) fb.style.display = 'none';

  const btnDado = document.getElementById('btnJogarDado');
  if (btnDado) btnDado.disabled = false;
}

/* =====================
   POSIÇÃO E VITÓRIA
===================== */
function atualizarPosicao(jogador) {
  const jogadorEl = document.getElementById(`jogador-${jogador.id}`);
  if (!jogadorEl) return;

  const casa = document.getElementById(`casa${jogador.posicaoAtual}`);
  if (casa) {
    const rect = casa.getBoundingClientRect();
    const boardRect = document.getElementById('tabuleiro').getBoundingClientRect();

    // pequeno deslocamento para múltiplos jogadores na mesma casa
    const offset = (jogador.id - 1) * 5;

    jogadorEl.style.position = 'absolute';
    jogadorEl.style.left = (rect.left - boardRect.left + 22 + offset) + 'px';
    jogadorEl.style.top = (rect.top - boardRect.top + 22) + 'px';
  }
}

function mostrarVitoria(nomeVencedor) {
  const tela = document.getElementById('telaFinal');
  if (tela) {
    const spanNome = document.getElementById('vencedorNome');
    if (spanNome) spanNome.textContent = nomeVencedor;
    tela.style.display = 'block';
  }
}

/* =====================
   AUTO na tela de seleção
===================== */
window.onload = function () {
  if (document.getElementById('numJogadores')) {
    gerarCamposDeNome();
  }
};
