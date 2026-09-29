import json

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