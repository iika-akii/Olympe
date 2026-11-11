import type { Recipe, RecipeRating } from '../domain';
import { recipeMacros, type IngredientIndex } from '../nutrition/macros';
import { portionView } from './view';

/** Export d'une recette au format Markdown compatible Obsidian (frontmatter YAML + liens [[ingrédient]]). */
export function recipeToMarkdown(recipe: Recipe, index: IngredientIndex, rating?: RecipeRating): string {
  const m = recipeMacros(recipe, index);
  const front = [
    '---',
    `id: ${recipe.id}`,
    `nom: "${recipe.name.replace(/"/g, '\\"')}"`,
    `cuisine: ${recipe.cuisine}`,
    `creneaux: [${recipe.slots.join(', ')}]`,
    `mode: ${recipe.mode}`,
    `minutes: ${recipe.minutes}`,
    `kcal_portion: ${Math.round(m.kcal)}`,
    `proteines_portion: ${Math.round(m.protein)}`,
    ...(rating ? [`compagne: ${rating.partnerVerdict}`] : []),
    `tags: [recette, ${recipe.tags.join(', ')}]`,
    '---',
  ];
  const lines = portionView(recipe, index).map((l) => `- [[${l.ingredientId}|${l.name}]] : ${l.user.text}${l.note ? ` (${l.note})` : ''}`);
  const out = [...front, '', `# ${recipe.name}`, '', '## Ingrédients (1 portion)', ...lines];
  if (recipe.steps.length) out.push('', '## Étapes', ...recipe.steps.map((s, i) => `${i + 1}. ${s}`));
  if (recipe.lessons.length) out.push('', "## Retours d'expérience", ...recipe.lessons.map((s) => `- ${s}`));
  return `${out.join('\n')}\n`;
}

export function recipesToMarkdown(recipes: readonly Recipe[], index: IngredientIndex, ratings: readonly RecipeRating[] = []): string {
  const byId = new Map(ratings.map((r) => [r.recipeId, r]));
  return recipes.map((r) => recipeToMarkdown(r, index, byId.get(r.id))).join('\n');
}
