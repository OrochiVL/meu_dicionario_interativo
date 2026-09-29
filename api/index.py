#!/usr/bin/env python
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

with open("data/dictionary.json", encoding="utf-8") as f:
    termos = json.load(f)

for t in termos:
    if "exemplo" not in t:
        t["exemplo"] = ""
    if "video_url" not in t:
        query = t["termo"].replace(" ", "+")
        t["video_url"] = f"https://www.youtube.com/results?search_query={query}+explicado"

with open("data/dictionary.json", "w", encoding="utf-8") as f:
    json.dump(termos, f, ensure_ascii=False, indent=2)

print(f"{len(termos)} termos atualizados.")

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