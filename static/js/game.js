let cartasDisponiveis = {};
let blocosDisponiveis = {};

let blocoAtual = "saudacao";
let totalPares = 4;

let deck = [];
let primeiraCarta = null;
let segundaCarta = null;

let bloqueado = false;
let previewAtivo = false;
let jogoIniciado = false;

let movimentos = 0;
let paresEncontrados = 0;
let segundos = 0;

let timer = null;
let previewTimer = null;
let rodadaAtual = 0;

let jogadorNome = "";
let rankingBlocoAtual = "saudacao";

const STORAGE_NOME = "jogoLibrasNomeJogador";
const STORAGE_RANKING = "jogoLibrasRanking";

const nomeAtual = document.getElementById("nomeAtual");

const jogoView = document.getElementById("jogoView");
const rankingView = document.getElementById("rankingView");

const verJogoBtn = document.getElementById("verJogoBtn");
const verRankingBtn = document.getElementById("verRankingBtn");
const trocarNomeBtn = document.getElementById("trocarNomeBtn");

const tabuleiro = document.getElementById("tabuleiro");
const mensagem = document.getElementById("mensagem");

const tempoEl = document.getElementById("tempo");
const movimentosEl = document.getElementById("movimentos");
const paresEncontradosEl = document.getElementById("paresEncontrados");

const previewBox = document.getElementById("previewBox");
const previewContador = document.getElementById("previewContador");

const iniciarBtn = document.getElementById("iniciarBtn");
const reiniciarBtn = document.getElementById("reiniciarBtn");

const blocoDescricao = document.getElementById("blocoDescricao");

const rankingBody = document.getElementById("rankingBody");

const finalModal = document.getElementById("finalModal");
const finalTexto = document.getElementById("finalTexto");
const modalVerRankingBtn = document.getElementById("modalVerRankingBtn");
const modalContinuarBtn = document.getElementById("modalContinuarBtn");


document.addEventListener("DOMContentLoaded", async () => {
    protegerTelaDoJogo();
    configurarEventos();

    await carregarDados();

    atualizarInfoBloco();
    aplicarTemaDoBloco();
    renderizarRanking();
});


function protegerTelaDoJogo() {
    jogadorNome = localStorage.getItem(STORAGE_NOME) || "";

    if (!jogadorNome.trim()) {
        window.location.href = "/";
        return;
    }

    nomeAtual.textContent = jogadorNome;
}


async function carregarDados() {
    try {
        const resposta = await fetch("/api/cartas");
        const dados = await resposta.json();

        cartasDisponiveis = dados.cartas || {};
        blocosDisponiveis = dados.blocos || {};
    } catch (erro) {
        console.error("Erro ao carregar cartas:", erro);
        mostrarMensagem("Não foi possível carregar as cartas do jogo.", "erro");
    }
}


function configurarEventos() {
    document.querySelectorAll(".nivel-btn").forEach((botao) => {
        botao.addEventListener("click", () => {
            document.querySelectorAll(".nivel-btn").forEach((btn) => {
                btn.classList.remove("ativo");
            });

            botao.classList.add("ativo");

            blocoAtual = botao.dataset.bloco;
            totalPares = Number(botao.dataset.pares);

            rodadaAtual++;
            limparTimers();
            resetarEstadoVisual();

            atualizarInfoBloco();
            aplicarTemaDoBloco();

            mostrarMensagem("Bloco selecionado. Clique em iniciar para jogar.", "info");
        });
    });

    document.querySelectorAll(".ranking-tab").forEach((botao) => {
        botao.addEventListener("click", () => {
            document.querySelectorAll(".ranking-tab").forEach((btn) => {
                btn.classList.remove("ativo");
            });

            botao.classList.add("ativo");
            rankingBlocoAtual = botao.dataset.rankingBloco;
            renderizarRanking();
        });
    });

    iniciarBtn.addEventListener("click", iniciarPartida);
    reiniciarBtn.addEventListener("click", iniciarPartida);

    verJogoBtn.addEventListener("click", mostrarTelaJogo);
    verRankingBtn.addEventListener("click", mostrarTelaRanking);

    trocarNomeBtn.addEventListener("click", () => {
        window.location.href = "/";
    });


    modalVerRankingBtn.addEventListener("click", () => {
        fecharModalFinal();
        mostrarTelaRanking();
    });

    modalContinuarBtn.addEventListener("click", () => {
        fecharModalFinal();
        mostrarTelaJogo();
    });
}


function mostrarTelaJogo() {
    jogoView.classList.add("ativa");
    rankingView.classList.remove("ativa");

    verJogoBtn.classList.add("ativo");
    verRankingBtn.classList.remove("ativo");
}


function mostrarTelaRanking() {
    rankingBlocoAtual = blocoAtual;
    ativarAbaRankingDoBlocoAtual();
    renderizarRanking();

    jogoView.classList.remove("ativa");
    rankingView.classList.add("ativa");

    verJogoBtn.classList.remove("ativo");
    verRankingBtn.classList.add("ativo");
}


function iniciarPartida() {
    rodadaAtual++;
    const idRodada = rodadaAtual;

    limparTimers();

    movimentos = 0;
    paresEncontrados = 0;
    segundos = 0;

    primeiraCarta = null;
    segundaCarta = null;

    bloqueado = true;
    previewAtivo = true;
    jogoIniciado = true;

    atualizarPlacar();
    montarDeck();
    renderizarTabuleiro();

    mostrarMensagem("Observe as cartas antes de começar.", "info");
    preVisualizacao(idRodada);
}


function montarDeck() {
    const bloco = blocosDisponiveis[blocoAtual];

    if (!bloco) {
        deck = [];
        return;
    }

    const cartasDoBloco = bloco.cartas.slice(0, bloco.pares);

    deck = [];

    cartasDoBloco.forEach((chave) => {
        const carta = cartasDisponiveis[chave];

        if (!carta) return;

        deck.push({
            id: `${chave}-emoji`,
            tipo: chave,
            tipoCard: "emoji",
            nome: carta.nome,
            emoji: carta.emoji,
            gif: carta.gif,
            matched: false
        });

        deck.push({
            id: `${chave}-gif`,
            tipo: chave,
            tipoCard: "gif",
            nome: carta.nome,
            emoji: carta.emoji,
            gif: carta.gif,
            matched: false
        });
    });

    embaralhar(deck);
}


function embaralhar(lista) {
    for (let i = lista.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lista[i], lista[j]] = [lista[j], lista[i]];
    }
}


function renderizarTabuleiro() {
    tabuleiro.innerHTML = "";
    tabuleiro.classList.remove("vazio");

    if (totalPares >= 8) {
        tabuleiro.classList.add("tabuleiro-grande");
    } else {
        tabuleiro.classList.remove("tabuleiro-grande");
    }

    deck.forEach((carta, index) => {
        const card = document.createElement("button");
        card.className = "card flipped";
        card.type = "button";
        card.dataset.index = index;

        const conteudoFrente = carta.tipoCard === "emoji"
            ? `
                <div class="emoji-card">${carta.emoji}</div>
                <strong>${carta.nome}</strong>
              `
            : `
                <img src="/static/${carta.gif}" alt="Sinal de ${carta.nome}" class="gif-card">
                <strong>${carta.nome}</strong>
              `;

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-face card-front">
                    ${conteudoFrente}
                </div>

                <div class="card-face card-back">
                    <span>LIBRAS</span>
                </div>
            </div>
        `;

        card.addEventListener("click", () => virarCarta(index));

        tabuleiro.appendChild(card);
    });
}


function preVisualizacao(idRodada) {
    let tempoPreview = obterTempoPreview();

    previewBox.classList.remove("hidden");
    previewContador.textContent = tempoPreview;

    previewTimer = setInterval(() => {
        if (idRodada !== rodadaAtual) {
            return;
        }

        tempoPreview--;
        previewContador.textContent = tempoPreview;

        if (tempoPreview <= 0) {
            clearInterval(previewTimer);
            previewTimer = null;

            if (idRodada !== rodadaAtual) {
                return;
            }

            document.querySelectorAll(".card").forEach((card) => {
                card.classList.remove("flipped");
            });

            previewBox.classList.add("hidden");
            previewAtivo = false;
            bloqueado = false;

            iniciarTimer();
            mostrarMensagem("Agora encontre os pares correspondentes.", "info");
        }
    }, 1000);
}


function obterTempoPreview() {
    if (totalPares >= 8) return 12;
    if (totalPares >= 5) return 8;

    return 5;
}


function virarCarta(index) {
    if (!jogoIniciado || bloqueado || previewAtivo) return;

    const carta = deck[index];
    const cardEl = document.querySelector(`[data-index="${index}"]`);

    if (!carta || !cardEl) return;
    if (carta.matched || cardEl.classList.contains("flipped")) return;

    cardEl.classList.add("flipped");

    if (!primeiraCarta) {
        primeiraCarta = { carta, index, elemento: cardEl };
        return;
    }

    segundaCarta = { carta, index, elemento: cardEl };
    movimentos++;
    atualizarPlacar();

    verificarPar();
}


function verificarPar() {
    bloqueado = true;

    const carta1 = primeiraCarta.carta;
    const carta2 = segundaCarta.carta;

    const ehPar =
        carta1.tipo === carta2.tipo &&
        carta1.tipoCard !== carta2.tipoCard;

    if (ehPar) {
        carta1.matched = true;
        carta2.matched = true;

        primeiraCarta.elemento.classList.add("matched");
        segundaCarta.elemento.classList.add("matched");

        paresEncontrados++;
        atualizarPlacar();

        primeiraCarta = null;
        segundaCarta = null;
        bloqueado = false;

        if (paresEncontrados === totalPares) {
            finalizarPartida();
        }

        return;
    }

    setTimeout(() => {
        primeiraCarta.elemento.classList.remove("flipped");
        segundaCarta.elemento.classList.remove("flipped");

        primeiraCarta = null;
        segundaCarta = null;
        bloqueado = false;
    }, 850);
}


function iniciarTimer() {
    limparTimerPrincipal();

    timer = setInterval(() => {
        segundos++;
        tempoEl.textContent = formatarTempo(segundos);
    }, 1000);
}


function finalizarPartida() {
    limparTimerPrincipal();

    bloqueado = true;
    jogoIniciado = false;

    salvarResultadoRanking();

    const textoFinal = `${jogadorNome}, você concluiu em ${formatarTempo(segundos)} com ${movimentos} movimentos.`;

    mostrarMensagem(`Parabéns! ${textoFinal}`, "sucesso");

    finalTexto.textContent = textoFinal;
    abrirModalFinal();

    rankingBlocoAtual = blocoAtual;
    ativarAbaRankingDoBlocoAtual();
    renderizarRanking();
}


function abrirModalFinal() {
    finalModal.classList.remove("hidden");
}


function fecharModalFinal() {
    finalModal.classList.add("hidden");
}


function atualizarPlacar() {
    tempoEl.textContent = formatarTempo(segundos);
    movimentosEl.textContent = movimentos;
    paresEncontradosEl.textContent = `${paresEncontrados}/${totalPares}`;
}


function formatarTempo(totalSegundos) {
    const minutos = Math.floor(totalSegundos / 60);
    const segundosRestantes = totalSegundos % 60;

    return `${String(minutos).padStart(2, "0")}:${String(segundosRestantes).padStart(2, "0")}`;
}


function formatarData(dataIso) {
    const data = new Date(dataIso);

    return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


function mostrarMensagem(texto, tipo = "info") {
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
}


function limparTimers() {
    limparTimerPrincipal();

    if (previewTimer) {
        clearInterval(previewTimer);
        previewTimer = null;
    }

    previewBox.classList.add("hidden");
}


function limparTimerPrincipal() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}


function resetarEstadoVisual() {
    jogoIniciado = false;
    previewAtivo = false;
    bloqueado = false;

    movimentos = 0;
    paresEncontrados = 0;
    segundos = 0;

    primeiraCarta = null;
    segundaCarta = null;

    atualizarPlacar();

    tabuleiro.classList.add("vazio");
    tabuleiro.classList.remove("tabuleiro-grande");

    tabuleiro.innerHTML = `
        <div class="empty-state">
            <img src="/static/imagem/libras.png" alt="Libras">
            <h2>Bloco alterado</h2>
            <p>Clique em iniciar para começar uma nova partida.</p>
        </div>
    `;
}


function atualizarInfoBloco() {
    const bloco = blocosDisponiveis[blocoAtual];

    if (!bloco) return;

    blocoDescricao.textContent = bloco.descricao;
    totalPares = bloco.pares;
    paresEncontradosEl.textContent = `0/${totalPares}`;
}


function aplicarTemaDoBloco() {
    document.body.classList.remove(
        "tema-saudacao",
        "tema-material-escolar",
        "tema-meses"
    );

    if (blocoAtual === "saudacao") {
        document.body.classList.add("tema-saudacao");
    }

    if (blocoAtual === "material-escolar") {
        document.body.classList.add("tema-material-escolar");
    }

    if (blocoAtual === "meses") {
        document.body.classList.add("tema-meses");
    }
}


function obterRankingCompleto() {
    const rankingSalvo = localStorage.getItem(STORAGE_RANKING);

    if (!rankingSalvo) {
        return criarRankingVazio();
    }

    try {
        const ranking = JSON.parse(rankingSalvo);

        return {
            "saudacao": ranking["saudacao"] || [],
            "material-escolar": ranking["material-escolar"] || [],
            "meses": ranking["meses"] || []
        };
    } catch (erro) {
        console.error("Erro ao ler ranking:", erro);
        return criarRankingVazio();
    }
}


function criarRankingVazio() {
    return {
        "saudacao": [],
        "material-escolar": [],
        "meses": []
    };
}


function salvarResultadoRanking() {
    const ranking = obterRankingCompleto();

    const resultado = {
        nome: jogadorNome,
        tempo: segundos,
        movimentos: movimentos,
        data: new Date().toISOString()
    };

    ranking[blocoAtual].push(resultado);

    ranking[blocoAtual].sort((a, b) => {
        if (a.tempo !== b.tempo) {
            return a.tempo - b.tempo;
        }

        return a.movimentos - b.movimentos;
    });

    ranking[blocoAtual] = ranking[blocoAtual].slice(0, 10);

    localStorage.setItem(STORAGE_RANKING, JSON.stringify(ranking));
}


function renderizarRanking() {
    const ranking = obterRankingCompleto();
    const resultados = ranking[rankingBlocoAtual] || [];

    rankingBody.innerHTML = "";

    if (resultados.length === 0) {
        rankingBody.innerHTML = `
            <tr>
                <td colspan="5">Nenhum resultado salvo ainda.</td>
            </tr>
        `;
        return;
    }

    resultados.forEach((item, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${index + 1}º</td>
            <td>${escaparHtml(item.nome)}</td>
            <td>${formatarTempo(item.tempo)}</td>
            <td>${item.movimentos}</td>
            <td>${formatarData(item.data)}</td>
        `;

        rankingBody.appendChild(tr);
    });
}


function ativarAbaRankingDoBlocoAtual() {
    document.querySelectorAll(".ranking-tab").forEach((botao) => {
        botao.classList.remove("ativo");

        if (botao.dataset.rankingBloco === blocoAtual) {
            botao.classList.add("ativo");
        }
    });
}




function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}