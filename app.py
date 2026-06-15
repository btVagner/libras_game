from flask import Flask, render_template, jsonify

app = Flask(__name__)


CARTAS_LIBRAS = {
    "oi": {
        "emoji": "👋",
        "gif": "imagem/oi.gif",
        "nome": "Oi"
    },
    "tchau": {
        "emoji": "👋",
        "gif": "imagem/tchau.gif",
        "nome": "Tchau"
    },
    "obrigado": {
        "emoji": "🙏",
        "gif": "imagem/obg.gif",
        "nome": "Obrigado"
    },
    "por-favor": {
        "emoji": "🤝",
        "gif": "imagem/pfv.gif",
        "nome": "Por favor"
    },

    "apagador": {
        "emoji": "🧽",
        "gif": "imagem/apagador.gif",
        "nome": "Apagador"
    },
    "cola": {
        "emoji": "🧴",
        "gif": "imagem/cola.gif",
        "nome": "Cola"
    },
    "computador": {
        "emoji": "💻",
        "gif": "imagem/comp.gif",
        "nome": "Computador"
    },
    "estojo": {
        "emoji": "✏️",
        "gif": "imagem/estojo.gif",
        "nome": "Estojo"
    },
    "mochila": {
        "emoji": "🎒",
        "gif": "imagem/mochila.gif",
        "nome": "Mochila"
    },
    "pincel": {
        "emoji": "🖌️",
        "gif": "imagem/pincel.gif",
        "nome": "Pincel"
    },
    "regua": {
        "emoji": "📏",
        "gif": "imagem/regua.gif",
        "nome": "Régua"
    },
    "tesoura": {
        "emoji": "✂️",
        "gif": "imagem/tesoura.gif",
        "nome": "Tesoura"
    },

    "janeiro": {
        "emoji": "📅",
        "gif": "imagem/janeiro.gif",
        "nome": "Janeiro"
    },
    "fevereiro": {
        "emoji": "📅",
        "gif": "imagem/fevereiro.gif",
        "nome": "Fevereiro"
    },
    "marco": {
        "emoji": "📅",
        "gif": "imagem/marco.gif",
        "nome": "Março"
    },
    "abril": {
        "emoji": "📅",
        "gif": "imagem/abril.gif",
        "nome": "Abril"
    },
    "maio": {
        "emoji": "📅",
        "gif": "imagem/maio.gif",
        "nome": "Maio"
    },
    "junho": {
        "emoji": "📅",
        "gif": "imagem/junho.gif",
        "nome": "Junho"
    },
    "outubro": {
        "emoji": "📅",
        "gif": "imagem/outubro.gif",
        "nome": "Outubro"
    },
    "dezembro": {
        "emoji": "📅",
        "gif": "imagem/dezembro.gif",
        "nome": "Dezembro"
    }
}


BLOCOS_LIBRAS = {
    "saudacao": {
        "nome": "Saudações",
        "pares": 4,
        "descricao": "Sinais básicos usados no início de uma comunicação.",
        "cartas": ["oi", "tchau", "obrigado", "por-favor"]
    },
    "material-escolar": {
        "nome": "Material Escolar",
        "pares": 8,
        "descricao": "Objetos comuns usados no ambiente escolar.",
        "cartas": [
            "apagador",
            "cola",
            "computador",
            "estojo",
            "mochila",
            "pincel",
            "regua",
            "tesoura"
        ]
    },
    "meses": {
        "nome": "Meses",
        "pares": 8,
        "descricao": "Meses do ano disponíveis no jogo.",
        "cartas": [
            "janeiro",
            "fevereiro",
            "marco",
            "abril",
            "maio",
            "junho",
            "outubro",
            "dezembro"
        ]
    }
}


@app.route("/")
def entrar():
    return render_template("entrar.html")


@app.route("/jogo")
def index():
    return render_template("index.html")


@app.route("/api/cartas")
def api_cartas():
    return jsonify({
        "cartas": CARTAS_LIBRAS,
        "blocos": BLOCOS_LIBRAS
    })


if __name__ == "__main__":
    app.run(debug=True)