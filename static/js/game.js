let dadosCartas = {};
let cartasDinamicas = [];
let cartasViradas = [];

let totalPares = 4;
let acertos = 0;
let movimentos = 0;
let tempo = 0;
let timer = null;
let jogoBloqueado = false;

const gameBoard = document.getElementById("gameBoard");
const movimentosEl = document.getElementById("movimentos");
const tempoEl = document.getElementById("tempo");
const acertosEl = document.getElementById("acertos");
const avisoMemoriaEl = document.getElementById("avisoMemoria");
const vitoriaEl = document.getElementById("vitoria");
const finalMovimentosEl = document.getElementById("finalMovimentos");
const finalTempoEl = document.getElementById("finalTempo");


async function carregarCartas() {
    const response = await fetch("/api/cartas");

    if (!response.ok) {
        throw new Error("Erro ao carregar cartas do servidor.");
    }

    dadosCartas = await response.json();
}


async function init() {
    try {
        if (Object.keys(dadosCartas).length === 0) {
            await carregarCartas();
        }

        const btnAtivo = document.querySelector(".nivel-btn.ativo");
        totalPares = parseInt(btnAtivo.dataset.pares);

        resetarEstado();
        criarJogo();
        preCarregarGifs();
        preVisualizacao();

    } catch (error) {
        console.error(error);
        alert("Não foi possível iniciar o jogo. Verifique se o Flask está rodando corretamente.");
    }
}


function resetarEstado() {
    clearInterval(timer);

    cartasDinamicas = [];
    cartasViradas = [];

    acertos = 0;
    movimentos = 0;
    tempo = 0;
    jogoBloqueado = true;

    gameBoard.innerHTML = "";
    gameBoard.style.pointerEvents = "none";

    movimentosEl.textContent = "0";
    acertosEl.textContent = `0/${totalPares}`;
    tempoEl.textContent = "00:00";

    vitoriaEl.classList.remove("mostrar");
}


function criarJogo() {
    const todasChaves = Object.keys(dadosCartas).sort(() => Math.random() - 0.5);
    const chavesSelecionadas = todasChaves.slice(0, totalPares);

    chavesSelecionadas.forEach((tipo) => {
        const item = dadosCartas[tipo];

        cartasDinamicas.push({
            tipo,
            nome: item.nome,
            conteudo: item.emoji,
            tipoCard: "emoji"
        });

        cartasDinamicas.push({
            tipo,
            nome: item.nome,
            conteudo: `/static/${item.gif}`,
            tipoCard: "gif"
        });
    });

    embaralhar(cartasDinamicas);

    cartasDinamicas.forEach((carta, index) => {
        const cardEl = document.createElement("div");

        cardEl.className = "card virada";
        cardEl.dataset.index = index;

        const conteudo = montarConteudoCarta(carta);

        cardEl.innerHTML = `
            <div class="card-inner">
                <div class="card-front">🧠</div>
                <div class="card-back">${conteudo}</div>
            </div>
        `;

        cardEl.addEventListener("click", () => virarCarta(index, cardEl));

        gameBoard.appendChild(cardEl);
    });
}


function montarConteudoCarta(carta) {
    if (carta.tipoCard === "emoji") {
        return `
            <div class="emoji-box">
                <span class="emoji">${carta.conteudo}</span>
                <div class="legenda-emoji">${carta.nome}</div>
            </div>
        `;
    }

    return `
        <img
            src="${carta.conteudo}"
            alt="Sinal de ${carta.nome} em Libras"
            class="gif-sinal"
        >
    `;
}


function embaralhar(lista) {
    for (let i = lista.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [lista[i], lista[j]] = [lista[j], lista[i]];
    }
}


function preCarregarGifs() {
    cartasDinamicas
        .filter((carta) => carta.tipoCard === "gif")
        .forEach((carta) => {
            const img = new Image();
            img.src = carta.conteudo;
        });
}


function preVisualizacao() {
    let segundos = 5;

    avisoMemoriaEl.style.display = "block";
    avisoMemoriaEl.textContent = `Memorize os sinais! Fechando em: ${segundos}s`;

    const contagem = setInterval(() => {
        segundos--;

        if (segundos <= 0) {
            clearInterval(contagem);

            avisoMemoriaEl.style.display = "none";

            document.querySelectorAll(".card").forEach((card) => {
                card.classList.remove("virada");
            });

            jogoBloqueado = false;
            gameBoard.style.pointerEvents = "auto";

            iniciarTimer();

            return;
        }

        avisoMemoriaEl.textContent = `Memorize os sinais! Fechando em: ${segundos}s`;
    }, 1000);
}


function virarCarta(index, cardEl) {
    if (jogoBloqueado) return;
    if (cartasViradas.length === 2) return;
    if (cardEl.classList.contains("virada")) return;
    if (cardEl.classList.contains("acertada")) return;

    cardEl.classList.add("virada");

    cartasViradas.push({
        index,
        el: cardEl
    });

    if (cartasViradas.length === 2) {
        movimentos++;
        movimentosEl.textContent = movimentos;

        checarPar();
    }
}


function checarPar() {
    jogoBloqueado = true;

    const [c1, c2] = cartasViradas;

    const carta1 = cartasDinamicas[c1.index];
    const carta2 = cartasDinamicas[c2.index];

    const ehPar =
        carta1.tipo === carta2.tipo &&
        carta1.tipoCard !== carta2.tipoCard;

    if (ehPar) {
        setTimeout(() => {
            c1.el.classList.add("acertada", "bloqueada");
            c2.el.classList.add("acertada", "bloqueada");

            acertos++;
            acertosEl.textContent = `${acertos}/${totalPares}`;

            cartasViradas = [];
            jogoBloqueado = false;

            if (acertos === totalPares) {
                finalizarJogo();
            }
        }, 350);

        return;
    }

    setTimeout(() => {
        c1.el.classList.remove("virada");
        c2.el.classList.remove("virada");

        cartasViradas = [];
        jogoBloqueado = false;
    }, 900);
}


function iniciarTimer() {
    clearInterval(timer);

    timer = setInterval(() => {
        tempo++;

        tempoEl.textContent = formatarTempo(tempo);
    }, 1000);
}


function finalizarJogo() {
    clearInterval(timer);

    jogoBloqueado = true;
    gameBoard.style.pointerEvents = "none";

    finalMovimentosEl.textContent = movimentos;
    finalTempoEl.textContent = formatarTempo(tempo);

    setTimeout(() => {
        vitoriaEl.classList.add("mostrar");
    }, 500);
}


function formatarTempo(segundosTotais) {
    const minutos = Math.floor(segundosTotais / 60).toString().padStart(2, "0");
    const segundos = (segundosTotais % 60).toString().padStart(2, "0");

    return `${minutos}:${segundos}`;
}


document.querySelectorAll(".nivel-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nivel-btn").forEach((item) => {
            item.classList.remove("ativo");
        });

        btn.classList.add("ativo");

        init();
    });
});


window.addEventListener("load", init);