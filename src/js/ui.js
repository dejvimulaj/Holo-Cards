import { fromEvent, combineLatest, BehaviorSubject, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { fetchPokemon, fetchYugioh, combineResults } from './api.js';

const btnAll   = document.getElementById('btnAll');
const btnPoke  = document.getElementById('btnPoke');
const btnYugi  = document.getElementById('btnYugi');
const input    = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearButton');
const suggestionsList = document.getElementById('suggestions');
const inputBox = document.getElementById('inputBox');
const cardDisplay = document.getElementById('cardDisplay');

const btnAPI = document.getElementById('btnAPI');
const btnDrawn = document.getElementById('btnDrawn');

btnAll.classList.add('active-btn');
export const mode$ = new BehaviorSubject('all');

export function setupButtons() {
  fromEvent(btnAll, 'click').subscribe(() => {
    btnAll.classList.add('active-btn');
    btnPoke.classList.remove('active-btn');
    btnYugi.classList.remove('active-btn');
    mode$.next('all');
  });

  fromEvent(btnPoke, 'click').subscribe(() => {
    btnAll.classList.remove('active-btn');
    btnPoke.classList.add('active-btn');
    btnYugi.classList.remove('active-btn');
    mode$.next('pokemon');
  });

  fromEvent(btnYugi, 'click').subscribe(() => {
    btnAll.classList.remove('active-btn');
    btnPoke.classList.remove('active-btn');
    btnYugi.classList.add('active-btn');
    mode$.next('yugioh');
  });
}

export function setupDisplayMode() {
  fromEvent(btnAPI, 'click').subscribe(() => {
    btnAPI.classList.add('active-mode');
    btnDrawn.classList.remove('active-mode');
    document.querySelector('.autocomplete-container').style.display = 'block';
    cardDisplay.style.display = 'block';
    cardDisplay.innerHTML = '';
  });

  fromEvent(btnDrawn, 'click').subscribe(() => {
    btnAPI.classList.remove('active-mode');
    btnDrawn.classList.add('active-mode');
    document.querySelector('.autocomplete-container').style.display = 'none';
    cardDisplay.style.display = 'block';
    renderDrawnCard();
  });
}

export function setupInputStream() {
  const input$ = fromEvent(input, 'input').pipe(
    map(event => event.target.value),
    debounceTime(300),
    distinctUntilChanged()
  );

  const combined$ = combineLatest([mode$, input$]).pipe(
    switchMap(([selectedMode, query]) => {
      if (!query) return of([]);
      if (selectedMode === 'all') return combineResults(query);
      else if (selectedMode === 'pokemon') return fetchPokemon(query);
      else return fetchYugioh(query);
    })
  );

  combined$.subscribe(renderSuggestions);
}

function renderSuggestions(results) {
  if (results.length > 0) {
    suggestionsList.style.display = 'block';
    inputBox.classList.add('active');
  } else {
    suggestionsList.style.display = 'none';
    inputBox.classList.remove('active');
  }
  
  suggestionsList.innerHTML = '';
  results.forEach(card => {
    const li = document.createElement('li');
    if (card.image) {
      const img = document.createElement('img');
      img.src = card.image;
      img.alt = card.name;
      li.appendChild(img);
    }
    const span = document.createElement('span');
    span.textContent = card.name;
    li.appendChild(span);
    
    li.addEventListener('click', () => {
      input.value = card.name;
      suggestionsList.innerHTML = '';
      suggestionsList.style.display = 'none';
      inputBox.classList.remove('active');
      clearBtn.style.display = 'block';
      
      displayCard(card);
    });
    suggestionsList.appendChild(li);
  });
}

export function setupClearButton() {
  fromEvent(clearBtn, 'click').subscribe(() => {
    input.value = '';
    clearBtn.style.display = 'none';
    suggestionsList.innerHTML = '';
    suggestionsList.style.display = 'none';
    inputBox.classList.remove('active');
    cardDisplay.innerHTML = '';
  });
}

function displayCard(card) {
  cardDisplay.innerHTML = '';
  
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card';
  
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'card__wrapper';
  
  const card3d = document.createElement('div');
  card3d.className = 'card__3d';
  
  const cardImageDiv = document.createElement('div');
  cardImageDiv.className = 'card__image';
  
  if (card.image) {
    const img = document.createElement('img');
    img.src = card.image;
    img.alt = card.name;
    cardImageDiv.appendChild(img);
  }
  
  const cardLayer1 = document.createElement('div');
  cardLayer1.className = 'card__layer1';
  
  const cardLayer2 = document.createElement('div');
  cardLayer2.className = 'card__layer2';
  
  card3d.appendChild(cardImageDiv);
  card3d.appendChild(cardLayer1);
  card3d.appendChild(cardLayer2);
  cardWrapper.appendChild(card3d);
  cardDiv.appendChild(cardWrapper);
  cardDisplay.appendChild(cardDiv);
  
  import('./effects.js').then(module => {
    module.applyTiltEffect(cardDiv);
  });
}

function renderDrawnCard() {
  cardDisplay.innerHTML = '';
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card drawn-card';
  cardDisplay.appendChild(cardDiv);
}