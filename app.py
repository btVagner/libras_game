from flask import Flask, render_template, jsonify

app = Flask(__name__)


CARTAS_LIBRAS = {
    "oi": {
        "emoji": "👋",
        "gif": "imagem/oi.gif",
        "nome": "Oi"
    },
    "tchau": {
        "emoji": "✋",
        "gif": "imagem/tchau.gif",
        "nome": "Tchau"
    },
    "obrigado": {
        "emoji": "🙏",
        "gif": "imagem/obg.gif",
        "nome": "Obrigado"
    },
    "por-favor": {
        "emoji": "🙌",
        "gif": "imagem/pfv.gif",
        "nome": "Por favor"
    },
    "laranja": {
        "emoji": "🍊",
        "gif": "imagem/laranja.gif",
        "nome": "Laranja"
    },
    "computador": {
        "emoji": "💻",
        "gif": "imagem/comp.gif",
        "nome": "Computador"
    },
    "luz": {
        "emoji": "💡",
        "gif": "imagem/luz.gif",
        "nome": "Luz"
    },
    "xicara": {
        "emoji": "☕",
        "gif": "imagem/xicara.gif",
        "nome": "Xícara"
    },
    "homem": {
        "emoji": "👨",
        "gif": "imagem/homem.gif",
        "nome": "Homem"
    }
}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/cartas")
def api_cartas():
    return jsonify(CARTAS_LIBRAS)


if __name__ == "__main__":
    app.run(debug=True)