/* =====================
   NAVEGAÇÃO ENTRE TELAS
===================== */
function irParaPersonagem() {
  window.location.href = "personagem.html";
}

function irParaTabuleiro() {
  const nome = document.getElementById("nomeJogador").value.trim();
  if (!nome || !personagemSelecionado) {
    alert("Digite seu nome e selecione um personagem!");
    return;
  }
  localStorage.setItem("nomeJogador", nome);
  localStorage.setItem("personagemSelecionado", personagemSelecionado);
  window.location.href = "tabuleiro.html";

}

/* =====================
   SELEÇÃO DE PERSONAGEM
===================== */
let personagemSelecionado = null;

function selecionarPersonagem(id) {
  personagemSelecionado = id;
  document.querySelectorAll(".personagem").forEach(p => p.style.border = "none");
  // Can't use event.currentTarget in static files without passing event; keep simple visual
  // highlight by matching id
  document.querySelectorAll('.personagem').forEach(function(el){ el.style.boxShadow = ''; });
  const el = Array.from(document.querySelectorAll('.personagem')).find(e=>e.getAttribute('onclick') && e.getAttribute('onclick').includes(id));
  if(el) el.style.boxShadow = '0 12px 28px rgba(107,79,159,0.15)';
  const input = el ? el.querySelector('input') : null;
  const name = input ? input.value : 'Jogador';
  const btn = document.getElementById('btnComecar');
  if(btn) btn.disabled = false;
}

/* =====================
   TABULEIRO E LÓGICA DO JOGO
===================== */
let posicaoAtual = 1;
let perguntas = [];
let dadoValor = 0;
let currentQuestion = null;
// ============================
// CARREGAR PERGUNTAS DO JSON
// ============================
fetch("fases.json")
  .then(response => response.json())
  .then(data => {
    perguntas = data;
    localStorage.setItem("perguntasMatemagica", JSON.stringify(data));
    console.log("✅ Perguntas carregadas com sucesso!");
  })
  .catch(error => console.error("❌ Erro ao carregar perguntas:", error));

window.addEventListener('load', function() {
  const nomeDisplay = document.getElementById("nomeJogadorDisplay");
  if (nomeDisplay) {
    const nome = localStorage.getItem("nomeJogador") || "Jogador";
    nomeDisplay.textContent = `Jogador: ${nome}`;
    perguntas = JSON.parse(localStorage.getItem("perguntasMatemagica")) || [];
    gerarTabuleiro();
    // wire up buttons on tabuleiro page
    const btnConfirm = document.getElementById('btnConfirmarResposta');
    if(btnConfirm) btnConfirm.addEventListener('click', function(){ verificarResposta(); });
    const btnContinuar = document.getElementById('btnContinuar');
    if(btnContinuar) btnContinuar.addEventListener('click', function(){ continuarJogo(); });
  }
});

function gerarTabuleiro() {
  const tabuleiro = document.getElementById("tabuleiro");
  if (!tabuleiro) return;

  // clear any existing
  tabuleiro.innerHTML = '';

  for (let i = 1; i <= 30; i++) {
    const casa = document.createElement("div");
    casa.classList.add("casa");
    casa.textContent = i;
    casa.id = `casa${i}`;
    tabuleiro.appendChild(casa);
  }

  // place player icon in casa1
  const jogador = document.createElement("div");
  jogador.classList.add("jogador");
  jogador.textContent = "🧙";
  const casa1 = document.getElementById('casa1');
  if(casa1) casa1.appendChild(jogador);
}

/* =====================
   DADO E MOVIMENTO
===================== */
function jogarDado() {
  dadoValor = Math.floor(Math.random() * 6) + 1;
  const resultadoDado = document.getElementById('resultadoDado');
  if(resultadoDado) resultadoDado.textContent = `Você tirou ${dadoValor}!`;
  mostrarPerguntaParaAvanco();
}

function mostrarPerguntaParaAvanco() {
  const target = Math.min(posicaoAtual + dadoValor, 30);
  const qObj = perguntas[target-1];
  if(!qObj || !qObj.pergunta) {
    // move directly if no question
    posicaoAtual = target;
    atualizarPosicao();
    if(posicaoAtual >= 30) mostrarVitoria();
    return;
  }
  currentQuestion = { target: target, q: qObj.pergunta, a: qObj.resposta };
  const overlay = document.getElementById('telaPergunta');
  if(overlay) {
    document.getElementById('textoPergunta').textContent = `Casa ${target}: ${currentQuestion.q}`;
    document.getElementById('ansInput')?.focus?.();
    overlay.style.display = 'flex';
  }
}

/* =====================
   PERGUNTAS E RESPOSTAS
===================== */
function verificarResposta() {
  const ansInput = document.getElementById('respostaJogador');
  const ans = ansInput ? ansInput.value.trim() : '';
  if(!currentQuestion) return;
  document.getElementById('telaPergunta').style.display = 'none';
  const correct = (ans === currentQuestion.a) || (Number(ans) === Number(currentQuestion.a));
  if(correct) {
    posicaoAtual = currentQuestion.target;
    atualizarPosicao();
    mostrarFeedback(true, currentQuestion.q, currentQuestion.a);
    if(posicaoAtual >= 30) setTimeout(mostrarVitoria, 700);
  } else {
    // incorrect: stay in place (or return to previous)
    mostrarFeedback(false, currentQuestion.q, ans);
  }
}

function mostrarFeedback(ok, q, ans) {
  const fb = document.getElementById('feedback');
  if(!fb) return;
  fb.style.display = 'flex';
  document.getElementById('feedbackTitulo').textContent = ok ? '✅ Você acertou!' : '❌ Você errou!';
  document.getElementById('feedbackTexto').textContent = ok ? `${q} = ${ans}` : `${q} Sua resposta: ${ans}`;
}

function continuarJogo() {
  const fb = document.getElementById('feedback');
  if(fb) fb.style.display = 'none';
  const input = document.getElementById('respostaJogador');
  if(input) input.value = '';
}

/* =====================
   POSIÇÃO E VITÓRIA
===================== */
function atualizarPosicao() {
  // remove jogador from any casa and append to new casa
  document.querySelectorAll('.jogador').forEach(el=>el.remove());
  const casa = document.getElementById(`casa${posicaoAtual}`);
  if(casa) {
    const jogador = document.createElement('div');
    jogador.classList.add('jogador');
    jogador.textContent = '🧙';
    casa.appendChild(jogador);
  }
  const posLabel = document.getElementById('posLabel');
  if(posLabel) posLabel.textContent = posicaoAtual;
}

function mostrarVitoria() {
  const tela = document.getElementById('telaFinal');
  if(tela) tela.style.display = 'block';
}
