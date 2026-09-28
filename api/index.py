import json
import os
import unicodedata
import random
from flask import Flask, jsonify, render_template, request


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = Flask (
    __name__,
    template_folder=os.path.join(BASE_DIR, "static"),
    static_folder=os.path.join(BASE_DIR, "static"),
    static_url_path="/static",
)

with open (os.path.join(BASE_DIR, "data", "dictionary.json"),  encoding="utf-8") as f:
    TERMOS = json.load(f)

TERMOS.sort(key=lambda t: t["termo"].lower())

def normalizar(texto: str) -> str:
    texto = texto.lower().strip()
    texto = unicodedata.normalize("NFKD", texto)
    return "".join(c for c in texto if not unicodedata.combining(c))

@app.route("/")
def home():
    categorias = sorted({t["categoria"] for t in TERMOS})
    return render_template("index.html", categorias=categorias, total=len(TERMOS))

@app.route("/api/termos")
def api_termos():
    query = normalizar(request.args.get("q", ""))
    categoria = request.args.get("categoria", "").strip()

    resultados = TERMOS
    if categoria:
        resultados = [t for t in resultados if t["categoria"] == categoria]
    if query:
        resultados = [
            t for t in resultados
            if query in normalizar(t["termo"]) or query in normalizar(t["definicao"])
        ]

    return jsonify(resultados)

@app.route("/api/aleatorio")
def api_aleatorio():
    return jsonify(random.choice(TERMOS))


if __name__ == "__main__":
    app.run(debug=True, port=5000)