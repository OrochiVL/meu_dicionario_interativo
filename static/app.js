const themeToggle = document.getElementById("theme-toggle");
const htmlEl = document.documentElement;

function aplicarTema(tema) {
  htmlEl.setAttribute("data-theme", tema);
  themeToggle.textContent = tema === "light" ? "☀️" : "🌙";
  localStorage.setItem("tema", tema);
}

const temaGuardado = localStorage.getItem("tema") || "dark";
aplicarTema(temaGuardado);

themeToggle.addEventListener("click", () => {
  const temaAtual = htmlEl.getAttribute("data-theme");
  aplicarTema(temaAtual === "light" ? "dark" : "light");
});

const subtitleEl = document.getElementById("subtitle");
const FRASES_FIXAS = ["Porque a teoria é que faz a prática!"];
let subtitleIndex = 0;

async function trocarSubtitulo() {
  subtitleEl.classList.add("fade");

  setTimeout(async () => {
    if (subtitleIndex % 2 === 0) {

      subtitleEl.textContent = FRASES_FIXAS[0];
    } else {

      const res = await fetch("/api/aleatorio");
      const t = await res.json();
      subtitleEl.textContent = `${t.termo}: ${t.definicao}`;
    }
    subtitleIndex++;
    subtitleEl.classList.remove("fade");
  }, 300); 
}

trocarSubtitulo();
setInterval(trocarSubtitulo, 6000);

const searchInput = document.getElementById("search");
const resultsEl = document.getElementById("results");
const emptyEl = document.getElementById("empty");
const countEl = document.getElementById("count");
const catButtons = document.querySelectorAll(".cat-btn");
const randomBtn = document.getElementById("random-btn");

const modal = document.getElementById("modal");
const modalTerm = document.getElementById("modal-term");
const modalDef = document.getElementById("modal-def");
const modalCat = document.getElementById("modal-cat");
const modalClose = document.getElementById("modal-close");

const modalExemploWrap = document.getElementById("modal-exemplo-wrap");
const modalExemplo = document.getElementById("modal-exemplo");
const modalVideo = document.getElementById("modal-video");


let activeCategoria = "";
let debounceTimer = null;

function render(termos) {
  resultsEl.innerHTML = "";
  countEl.textContent = termos.length === 1
    ? "1 termo encontrado"
    : `${termos.length} termos encontrados`;

  emptyEl.style.display = termos.length ? "none" : "block";

  for (const t of termos) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span class="cat-tag">${t.categoria}</span>
      <h3>${t.termo}</h3>
      <p>${t.definicao}</p>
    `;
    card.addEventListener("click", () => openModal(t));
    resultsEl.appendChild(card);
  }
}

async function fetchTermos() {
  const q = searchInput.value.trim();
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (activeCategoria) params.set("categoria", activeCategoria);

  const res = await fetch(`/api/termos?${params.toString()}`);
  const data = await res.json();
  render(data);
}

function openModal(t) {
  modalTerm.textContent = t.termo;
  modalDef.textContent = t.definicao;
  modalCat.textContent = t.categoria;

  if (t.exemplo && t.exemplo.trim() !== "") {
    modalExemplo.textContent = t.exemplo;
    modalExemploWrap.style.display = "block";
  } else {
    modalExemploWrap.style.display = "none";
  }

  if (t.video_url && t.video_url.trim() !== "") {
    modalVideo.href = t.video_url;
    modalVideo.style.display = "inline-flex";
  } else {
    modalVideo.style.display = "none";
  }

  modal.classList.add("open");
}

function closeModal() {
  modal.classList.remove("open");
}

searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchTermos, 150);
});

catButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    catButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategoria = btn.dataset.cat;
    fetchTermos();
  });
});

randomBtn.addEventListener("click", async () => {
  const res = await fetch("/api/aleatorio");
  const t = await res.json();
  openModal(t);
});

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

fetchTermos();