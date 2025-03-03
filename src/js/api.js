import { fromFetch } from 'rxjs/fetch';
import { of, combineLatest } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

export function fetchPokemon(query) {
  const url = `https://api.pokemontcg.io/v2/cards?q=name:*${encodeURIComponent(query)}*`;
  return fromFetch(url, { headers: { 'Accept': 'application/json' } }).pipe(
    switchMap(response => {
      if (!response.ok) {
        console.error('TCG API error:', response.status, response.statusText);
        return of([]);
      }
      return response.json();
    }),
    map(json => {
      if (json && json.data) {
        return json.data.map(card => ({
          name: card.name,
          image: card.images ? card.images.large : null
        }));
      }
      return [];
    }),
    catchError(err => {
      console.error('Error fetching from TCG API:', err);
      return of([]);
    })
  );
}

export function fetchYugioh(query) {
  return fromFetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(query)}`).pipe(
    switchMap(response => {
      if (!response.ok) return of([]);
      return response.json();
    }),
    map(json => {
      if (json && json.data) {
        return json.data.map(card => ({
          name: card.name,
          image: (card.card_images && card.card_images.length > 0) ? card.card_images[0].image_url : null
        }));
      }
      return [];
    }),
    catchError(() => of([]))
  );
}

export function combineResults(query) {
  return combineLatest([
    fetchPokemon(query),
    fetchYugioh(query)
  ]).pipe(
    map(([pokeResults, yugiResults]) => [...pokeResults, ...yugiResults])
  );
}
