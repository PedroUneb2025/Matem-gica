/* =====================
    ESTADO GLOBAL DO JOGO (MULTIJOGADOR)
===================== */
let numJogadores = 1;
// Armazena os objetos dos jogadores: [{ nome: 'Nome1', personagem: 'Cavaleira', posicaoAtual: 0 }, ...]
let jogadores = [];
let personagensSelecionados = [];

/* =====================
    NAVEGAÇÃO ENTRE TELAS
===================== */
function irParaPersonagem() {
    window.location.href = "personagem.html";
}

function irParaTabuleiro() {
    // 1. Verificar se o número correto de jogadores foi configurado e se todos têm nome
    if (jogadores.length < numJogadores || jogadores.some(j => !j.nome || j.nome.trim() === '')) {
        alert(`Por favor, selecione e preencha o nome para os ${numJogadores} jogadores.`);
        return;
    }

    // 2. Salvar o array completo de jogadores
    localStorage.setItem("jogadoresMatemagica", JSON.stringify(jogadores));
    window.location.href = "tabuleiro.html";
}

// ----------------------------------------------------
// TELA DE SELEÇÃO
// ----------------------------------------------------

<<<<<<< HEAD
// Função chamada ao mudar o dropdown (select) de número de jogadores
function gerarCamposDeNome() {
    const select = document.getElementById('numJogadores');
    numJogadores = parseInt(select.value, 10);
    
    // Resetar seleções e campos de nome visíveis
    jogadores = [];
    personagensSelecionados = [];
    
    document.querySelectorAll('.card-personagem').forEach(card => {
        card.classList.remove('selecionado');
        const wrapper = card.querySelector('.input-nome-wrapper');
        wrapper.innerHTML = ''; // Remove o campo de input existente
    });
    
    // Desabilitar o botão Começar no reset
    const btn = document.getElementById('btnComecar');
    if(btn) btn.disabled = true;

    // Se for 1 jogador, gera o campo no primeiro card para já pedir o nome
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
            // Seleciona o primeiro card automaticamente para 1 jogador
            const primeiroCard = primeiroCardWrapper.closest('.card-personagem');
            primeiroCard.classList.add('selecionado');
            personagensSelecionados.push('Cavaleira');
        }
    }
=======
function selecionarPersonagem(id) {
  personagemSelecionado = id;
  document.querySelectorAll(".personagem").forEach(p => p.style.border = "none");
  document.querySelectorAll('.personagem').forEach(function(el){ el.style.boxShadow = ''; });
  const el = Array.from(document.querySelectorAll('.personagem')).find(e=>e.getAttribute('onclick') && e.getAttribute('onclick').includes(id));
  if(el) el.style.boxShadow = '0 12px 28px rgba(107,79,159,0.15)';
  const input = el ? el.querySelector('input') : null;
  const name = input ? input.value : 'Jogador';
  const btn = document.getElementById('btnComecar');
  if(btn) btn.disabled = false;
>>>>>>> 08bfa96174a6125a72fb02419df852c60c00b1cc
}

// Função chamada ao clicar em um Card de Personagem
function selecionarPersonagem(cardElement, event) {
    // 🛑 CORREÇÃO PRINCIPAL: Impede a desseleção se o clique vier do INPUT
    if (event && event.target.tagName.toLowerCase() === 'input') {
        event.stopPropagation(); 
        return; 
    }
    
    const nomePersonagem = cardElement.getAttribute('data-personagem');
    const isSelecionado = cardElement.classList.contains('selecionado');
    const nomeInputWrapper = document.getElementById(`inputWrapper-${nomePersonagem}`);

    if (isSelecionado) {
        // Remover seleção
        cardElement.classList.remove('selecionado');
        personagensSelecionados = personagensSelecionados.filter(p => p !== nomePersonagem);
        nomeInputWrapper.innerHTML = '';
        jogadores = jogadores.filter(j => j.personagem !== nomePersonagem);
        
    } else {
        // Adicionar seleção (se houver vaga)
        if (personagensSelecionados.length < numJogadores) {
            cardElement.classList.add('selecionado');
            personagensSelecionados.push(nomePersonagem);

            // Adiciona o campo de nome no card
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
    
    // Garante que a lista 'jogadores' esteja atualizada e o botão habilitado/desabilitado
    validarSelecao();
}

// Função para verificar se todos os nomes e personagens foram selecionados
function validarSelecao() {
    jogadores = [];
    let nomesCompletos = true;
    
    // 1. Percorrer os personagens selecionados e coletar os dados
    document.querySelectorAll('.card-personagem.selecionado').forEach((card, index) => {
        const nomePersonagem = card.getAttribute('data-personagem');
        const inputNome = document.getElementById(`nome-${nomePersonagem}`);
        
        // Se o input existe, pega o valor
        const nomeJogador = inputNome ? inputNome.value.trim() : '';

        if (!nomeJogador) {
            nomesCompletos = false;
        }

        jogadores.push({
            id: index + 1, // ID do Jogador (1, 2, 3...)
            nome: nomeJogador || `Jogador ${index + 1}`,
            personagem: nomePersonagem,
            posicaoAtual: 0, // Posição inicial no tabuleiro
            icone: obterIcone(nomePersonagem)
        });
    });

    // 2. Habilitar/Desabilitar o botão "Começar"
    const btn = document.getElementById('btnComecar');
    // Verifica se o número de jogadores selecionados é o esperado E se todos têm nome
    if (jogadores.length === numJogadores && nomesCompletos) {
        if(btn) btn.disabled = false;
    } else {
        if(btn) btn.disabled = true;
    }
}

// Mapeia o personagem para um ícone (para uso no tabuleiro)
function obterIcone(personagem) {
    switch(personagem) {
        case 'Cavaleira': return '🧝‍♀️'; 
        case 'Cavaleiro': return '🛡️';
        case 'Mago': return '🧙';
        case 'Princesa': return '👸';
        default: return '♟️';
    }
}

// ----------------------------------------------------
// TABULEIRO E LÓGICA DO JOGO (Multiplayer)
// ----------------------------------------------------
let jogadoresTabuleiro = [];
let jogadorAtualIndex = 0; // Começa no Jogador 0
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
    // Inicializa a tela de seleção de jogadores
    if (document.getElementById('numJogadores')) {
        gerarCamposDeNome();
        return; 
    }
    
    // Lógica para a tela do Tabuleiro
    const jogadoresData = localStorage.getItem("jogadoresMatemagica");
    if (jogadoresData) {
        jogadoresTabuleiro = JSON.parse(jogadoresData);
    } else {
        console.error("Dados de jogadores não encontrados. Redirecionando.");
        return;
    }

    perguntas = JSON.parse(localStorage.getItem("perguntasMatemagica")) || [];
<<<<<<< HEAD
    
    if (document.getElementById("tabuleiro")) {
        gerarTabuleiro();
        atualizarDisplayJogadorAtual(); 

        const btnDado = document.getElementById('btnJogarDado');
        if(btnDado) btnDado.addEventListener('click', jogarDado);

        const btnConfirm = document.getElementById('btnConfirmarResposta');
        if(btnConfirm) btnConfirm.addEventListener('click', verificarResposta);
        
        // Remove o event listener antigo e usa a lógica do feedback para 'continuar'
        // const btnContinuar = document.getElementById('btnContinuar');
        // if(btnContinuar) btnContinuar.addEventListener('click', continuarJogo); 
    }
=======
    gerarTabuleiro();
    const btnConfirm = document.getElementById('btnConfirmarResposta');
    if(btnConfirm) btnConfirm.addEventListener('click', function(){ verificarResposta(); });
    const btnContinuar = document.getElementById('btnContinuar');
    if(btnContinuar) btnContinuar.addEventListener('click', function(){ continuarJogo(); });
  }
>>>>>>> 08bfa96174a6125a72fb02419df852c60c00b1cc
});

function atualizarDisplayJogadorAtual() {
    const jogadorAtual = jogadoresTabuleiro[jogadorAtualIndex];
    const nomeDisplay = document.getElementById("nomeJogadorDisplay"); 
    const btnDado = document.getElementById('btnJogarDado'); 

<<<<<<< HEAD
    if (nomeDisplay) {
        nomeDisplay.textContent = `Vez de: ${jogadorAtual.nome} (${jogadorAtual.personagem} ${jogadorAtual.icone})`;
    }
    // Garante que o dado esteja pronto para ser jogado
    if (btnDado) {
        btnDado.disabled = false; 
    }
=======
 
  tabuleiro.innerHTML = '';

  for (let i = 1; i <= 30; i++) {
    const casa = document.createElement("div");
    casa.classList.add("casa");
    casa.textContent = i;
    casa.id = `casa${i}`;
    tabuleiro.appendChild(casa);
  }

  
  const jogador = document.createElement("div");
  jogador.classList.add("jogador");
  jogador.textContent = "🧙";
  const casa1 = document.getElementById('casa1');
  if(casa1) casa1.appendChild(jogador);
>>>>>>> 08bfa96174a6125a72fb02419df852c60c00b1cc
}

function proximoJogador() {
    jogadorAtualIndex = (jogadorAtualIndex + 1) % jogadoresTabuleiro.length;
    atualizarDisplayJogadorAtual();
}


function gerarTabuleiro() {
    const tabuleiro = document.getElementById("tabuleiro");
    if (!tabuleiro) return;

    tabuleiro.innerHTML = '';

    for (let i = 0; i <= 35; i++) {
        const casa = document.createElement("div");
        casa.classList.add("casa");
        casa.textContent = i;
        casa.id = `casa${i}`;
        tabuleiro.appendChild(casa);
    }
    
    // Coloca todos os jogadores na Casa 0
    jogadoresTabuleiro.forEach(jogador => {
        const jogadorEl = document.createElement("div");
        jogadorEl.classList.add("jogador");
        jogadorEl.id = `jogador-${jogador.id}`;
        jogadorEl.textContent = jogador.icone; 
        
        const casa0 = document.getElementById('casa0');
        if(casa0) casa0.appendChild(jogadorEl);
        
        atualizarPosicao(jogador);
    });
}

// ----------------------------------------------------
// DADO E MOVIMENTO
// ----------------------------------------------------
function jogarDado() {
    const btnDado = document.getElementById('btnJogarDado');
    if (btnDado) btnDado.disabled = true; 
    
    // ✅ CORRETO: Geração do valor aleatório para a rodada atual
    dadoValor = Math.floor(Math.random() * 6) + 1;
    
    const resultadoDado = document.getElementById('resultadoDado');
    if(resultadoDado) resultadoDado.textContent = `Você tirou ${dadoValor}!`;
    
    mostrarPerguntaParaAvanco();
}

function mostrarPerguntaParaAvanco() {
<<<<<<< HEAD
    const jogadorAtual = jogadoresTabuleiro[jogadorAtualIndex];
    const target = Math.min(jogadorAtual.posicaoAtual + dadoValor, 35);

    // 🛑 CORREÇÃO DE ÍNDICE: Se a Casa 0 não tem pergunta, use [target - 1]
    const qObj = perguntas[target - 1]; 
    
    // Se a casa alvo for a última ou não tiver pergunta, move sem perguntar
    if(!qObj || !qObj.pergunta || target === 35) {
        jogadorAtual.posicaoAtual = target;
        atualizarPosicao(jogadorAtual);
        if(jogadorAtual.posicaoAtual >= 35) { 
            mostrarVitoria(jogadorAtual.nome);
        } else {
            // Se não tem pergunta, passa a vez e re-habilita o dado
            proximoJogador();
        }
        return;
    }
    
    currentQuestion = { target: target, q: qObj.pergunta, a: qObj.resposta };
    const overlay = document.getElementById('telaPergunta');
    
    if(overlay) {
        document.getElementById('textoPergunta').textContent = `${jogadorAtual.nome}, Casa ${target}: ${currentQuestion.q}`;
        const ansInput = document.getElementById('respostaJogador');
        if(ansInput) ansInput.value = ''; // Limpa o input
        ansInput?.focus?.();
        overlay.style.display = 'flex';
    }
=======
  const target = Math.min(posicaoAtual + dadoValor, 30);
  const qObj = perguntas[target-1];
  if(!qObj || !qObj.pergunta) {
    
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
>>>>>>> 08bfa96174a6125a72fb02419df852c60c00b1cc
}

// ----------------------------------------------------
// PERGUNTAS E RESPOSTAS
// ----------------------------------------------------
function verificarResposta() {
<<<<<<< HEAD
    const jogadorAtual = jogadoresTabuleiro[jogadorAtualIndex];
    const ansInput = document.getElementById('respostaJogador');
    const ans = ansInput ? ansInput.value.trim() : '';
    
    if(!currentQuestion) return;
    
    document.getElementById('telaPergunta').style.display = 'none';
    const correct = (ans === currentQuestion.a) || (Number(ans) === Number(currentQuestion.a));
    
    if(correct) {
        jogadorAtual.posicaoAtual = currentQuestion.target;
        atualizarPosicao(jogadorAtual);
        mostrarFeedback(true, currentQuestion.q, currentQuestion.a, jogadorAtual.nome);
        if(jogadorAtual.posicaoAtual >= 35) {
            setTimeout(() => mostrarVitoria(jogadorAtual.nome), 700);
        }
    } else {
        // incorreto: fica no lugar.
        mostrarFeedback(false, currentQuestion.q, currentQuestion.a, jogadorAtual.nome);
    }
=======
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
    mostrarFeedback(false, currentQuestion.q, ans);
  }
>>>>>>> 08bfa96174a6125a72fb02419df852c60c00b1cc
}

function mostrarFeedback(ok, q, ansCorreta, nomeJogador) {
    const fb = document.getElementById('feedback');
    if(!fb) return;
    fb.style.display = 'flex';
    document.getElementById('feedbackTitulo').textContent = ok ? `✅ ${nomeJogador} acertou!` : `❌ ${nomeJogador} errou!`;
    document.getElementById('feedbackTexto').textContent = ok ? `Pergunta: ${q} = ${ansCorreta}` : `Pergunta: ${q}. A resposta correta era: ${ansCorreta}`;
    
    // Lógica para CONTINUAR: Fecha o feedback, re-habilita o dado e passa a vez.
    document.getElementById('btnContinuar').onclick = function() {
        continuarJogo();
        proximoJogador(); 
    };
}

function continuarJogo() {
    const fb = document.getElementById('feedback');
    if(fb) fb.style.display = 'none';
    
    // Garante que o botão do dado seja reabilitado para o próximo jogador
    const btnDado = document.getElementById('btnJogarDado');
    if (btnDado) btnDado.disabled = false;
}

<<<<<<< HEAD
// ----------------------------------------------------
// POSIÇÃO E VITÓRIA
// ----------------------------------------------------
function atualizarPosicao(jogador) {
    const jogadorEl = document.getElementById(`jogador-${jogador.id}`);
    if (!jogadorEl) return;

    const casa = document.getElementById(`casa${jogador.posicaoAtual}`);
    if (casa) {
        const rect = casa.getBoundingClientRect();
        const boardRect = document.getElementById('tabuleiro').getBoundingClientRect();
        
        // Ajuste pequeno para jogadores na mesma casa
        const offset = (jogador.id - 1) * 5; 
        
        jogadorEl.style.position = 'absolute';
        jogadorEl.style.left = (rect.left - boardRect.left + 22 + offset) + 'px';
        jogadorEl.style.top = (rect.top - boardRect.top + 22) + 'px';
    }
=======
/* =====================
   POSIÇÃO E VITÓRIA
===================== */
function atualizarPosicao() {
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
>>>>>>> 08bfa96174a6125a72fb02419df852c60c00b1cc
}


function mostrarVitoria(nomeVencedor) {
    const tela = document.getElementById('telaFinal');
    if(tela) {
        document.getElementById('vencedorNome').textContent = nomeVencedor; 
        tela.style.display = 'block';
    }
}

// Inicializa a geração dos campos de nome ao carregar a página (apenas na tela de seleção)
window.onload = function() {
    if (document.getElementById('numJogadores')) {
        gerarCamposDeNome();
    }
}