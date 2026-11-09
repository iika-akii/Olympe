import { describe, expect, it } from 'vitest';
import { EXCLUDED_INGREDIENT_KEYWORDS, excludedKeywordsIn } from '../src';

describe('exclusions', () => {
  it('repère un ingrédient exclu dans une ligne importée, accents et casse ignorés', () => {
    expect(excludedKeywordsIn('200 g de Champignons de Paris', EXCLUDED_INGREDIENT_KEYWORDS)).toEqual(['champignon']);
    expect(excludedKeywordsIn('Crevettes décortiquées', EXCLUDED_INGREDIENT_KEYWORDS)).toEqual(['crevette']);
    expect(excludedKeywordsIn('1 bouquet de CORIANDRE', EXCLUDED_INGREDIENT_KEYWORDS)).toEqual(['coriandre']);
  });

  it('laisse passer le thon et les sardines', () => {
    expect(excludedKeywordsIn('1 boîte de thon au naturel', EXCLUDED_INGREDIENT_KEYWORDS)).toEqual([]);
    expect(excludedKeywordsIn('sardines à l’huile', EXCLUDED_INGREDIENT_KEYWORDS)).toEqual([]);
  });
});
