/* scripts.js: datos de ejemplo, slideshow simple, modal y renderizado de receta completa */

/* ---------- Datos de muestra (puedes sustituir por fetch desde un JSON externo o API) --------- */
const RECIPES = [
  {
    slug: "ensalada-citrica",
    title: "Ensalada cítrica con quinoa",
    image: "assets/img/receta1.jpg",
    summary: "Ensalada fresca con quinoa, naranjas y vinagreta ligera.",
    time: "20 min",
    servings: "2",
    calories: 420,
    ingredients: [
      "1 taza de quinoa cocida",
      "1 naranja en gajos",
      "100 g de rúcula",
      "30 g de almendras tostadas",
      "Vinagreta: 1 cda aceite de oliva, 1 cda vinagre de manzana, sal y pimienta"
    ],
    steps: [
      "Cocinar la quinoa según instrucciones y enfriar.",
      "Mezclar quinoa, rúcula y gajos de naranja.",
      "Emulsionar la vinagreta y añadir a la ensalada.",
      "Espolvorear almendras antes de servir."
    ],
    notes: "Alternativa vegana: sustituir la miel por jarabe de agave en la vinagreta."
  },
  {
    slug: "bowl-avena",
    title: "Bowl matutino de avena",
    image: "assets/img/receta2.jpg",
    summary: "Avena con frutas y semillas — ideal para desayuno balanceado.",
    time: "10 min",
    servings: "1",
    calories: 380,
    ingredients: [
      "50 g de avena integral",
      "200 ml de leche vegetal",
      "1 plátano en rodajas",
      "1 cda de semillas de chía",
      "1 cda de mantequilla de almendra"
    ],
    steps: [
      "Cocinar la avena con la leche hasta obtener la consistencia deseada.",
      "Servir y añadir plátano, semillas y mantequilla de almendra."
    ],
    notes: "Aporta fibra soluble y grasas saludables."
  },
  {
    slug: "salmon-horno",
    title: "Salmón al horno con verduras",
    image: "assets/img/receta3.jpg",
    summary: "Salmón rico en omega-3 acompañado de verduras asadas.",
    time: "30 min",
    servings: "2",
    calories: 520,
    ingredients: [
      "2 filetes de salmón (150 g cada uno)",
      "200 g de brócoli",
      "1 pimiento rojo",
      "Limón, hierbas y especias al gusto"
    ],
    steps: [
      "Precalentar el horno a 200 °C.",
      "Colocar el salmón y las verduras en una bandeja, rociar con aceite y condimentos.",
      "Hornear 15-20 minutos según grosor del pescado."
    ],
    notes: "Controla la sal y evita aceites en exceso para reducir sodio y calorías."
  }
];

/* ---------- Slideshow (navegación manual + clickable) ---------- */
(function initSlideshow(){
  const slides = document.getElementById('slides');
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  let index = 0;
  const total = slides ? slides.children.length : 0;

  function show(i){
    index = (i + total) % total;
    slides.style.transform = `translateX(-${index * 100}%)`;
  }

  if(prev) prev.addEventListener('click', ()=> show(index-1));
  if(next) next.addEventListener('click', ()=> show(index+1));

  // Hacer que cada slide abra modal al click o Enter
  Array.from(document.querySelectorAll('.slide')).forEach((el)=>{
    el.addEventListener('click', ()=> openRecipeModal(Number(el.dataset.index)));
    el.addEventListener('keydown', (e)=> { if(e.key === 'Enter') openRecipeModal(Number(el.dataset.index)); });
  });
})();

/* ---------- Renderizar tarjetas "Recetas destacadas" ---------- */
function renderCards(){
  const cards = document.getElementById('cards');
  if(!cards) return;
  cards.innerHTML = RECIPES.map((r, i)=> `
    <article class="card" aria-labelledby="card-title-${i}">
      <img src="${r.image}" alt="${r.title}" loading="lazy" />
      <div class="card-body">
        <h3 id="card-title-${i}">${r.title}</h3>
        <p>${r.summary}</p>
        <div>
          <a class="btn ghost" href="recipe.html?slug=${r.slug}">Ver receta completa</a>
          <button class="btn primary quickview" data-index="${i}">Vista rápida</button>
        </div>
      </div>
    </article>
  `).join('');

  // enlazar los botones de vista rápida
  Array.from(document.querySelectorAll('.quickview')).forEach(btn=>{
    btn.addEventListener('click', ()=> openRecipeModal(Number(btn.dataset.index)));
  });
}

/* ---------- Modal: abrir, cerrar, inyectar contenido ---------- */
const modal = document.getElementById('recipeModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
const modalBackdrop = document.getElementById('modalBackdrop');
const fullRecipeBtn = document.getElementById('fullRecipeBtn');

function openRecipeModal(index){
  const recipe = RECIPES[index];
  if(!recipe) return;
  // inyectar HTML reducido
  modalBody.innerHTML = `
    <img src="${recipe.image}" alt="${recipe.title}" />
    <h2 id="modalTitle">${recipe.title}</h2>
    <p class="summary">${recipe.summary}</p>
    <p class="meta"><span class="kv">Tiempo:</span> ${recipe.time} • <span class="kv">Porciones:</span> ${recipe.servings} • <span class="kv">Cal:</span> ${recipe.calories}</p>
    <h4>Ingredientes (resumen)</h4>
    <ul>${recipe.ingredients.slice(0,4).map(i=>`<li>${i}</li>`).join('')}</ul>
  `;
  fullRecipeBtn.href = `recipe.html?slug=${recipe.slug}`;
  showModal();
}

function showModal(){
  if(!modal) return;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  // focus trap simple: focus close button
  if(modalClose) modalClose.focus();
}

function closeModal(){
  if(!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
}

/* cerrar modal por clicks */
if(modalClose) modalClose.addEventListener('click', closeModal);
if(modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', (e)=> { if(e.key === 'Escape') closeModal(); });

/* ---------- Recipe page: renderizar receta completa si estamos en recipe.html ---------- */
function getQueryParam(key){
  const url = new URL(window.location.href);
  return url.searchParams.get(key);
}

function renderRecipePage(){
  const container = document.getElementById('recipePage');
  if(!container) return;
  const slug = getQueryParam('slug') || RECIPES[0].slug;
  const recipe = RECIPES.find(r => r.slug === slug);
  if(!recipe){
    container.innerHTML = `<p>Receta no encontrada. <a href="index.html">Volver</a></p>`;
    return;
  }

  container.innerHTML = `
    <article class="recipe">
      <img src="${recipe.image}" alt="${recipe.title}" style="width:100%;max-height:380px;object-fit:cover;border-radius:10px;margin-bottom:1rem;" />
      <h1>${recipe.title}</h1>
      <p class="summary">${recipe.summary}</p>
      <div class="recipe-meta">
        <div><span class="kv">Tiempo:</span> ${recipe.time}</div>
        <div><span class="kv">Porciones:</span> ${recipe.servings}</div>
        <div><span class="kv">Calorías aprox.:</span> ${recipe.calories}</div>
      </div>

      <section class="recipe-ingredients">
        <h3>Ingredientes</h3>
        <ul>${recipe.ingredients.map(i=>`<li>${i}</li>`).join('')}</ul>
      </section>

      <section class="recipe-steps">
        <h3>Preparación</h3>
        <ol>${recipe.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
      </section>

      <section class="recipe-notes">
        <h4>Notas</h4>
        <p>${recipe.notes}</p>
      </section>
    </article>
  `;
}

/* Inicialización al cargar DOM */
document.addEventListener('DOMContentLoaded', ()=>{
  renderCards();
  renderRecipePage();
});
