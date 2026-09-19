'use server';
/**
 * @fileOverview A Genkit flow for providing personalized product recommendations to buyers.
 *
 * - buyerAIProductRecommendations - A function that generates product recommendations for a buyer.
 * - BuyerAIProductRecommendationsInput - The input type for the buyerAIProductRecommendations function.
 * - BuyerAIProductRecommendationsOutput - The return type for the buyerAIProductRecommendations function.
 */

import {ai, executePromptWithFailover} from '@/ai/genkit';
import {z} from 'genkit';

const ProductForRecommendationSchema = z.object({
  productId: z.string().describe('Unique identifier for the product.'),
  productName: z.string().describe('Name of the product.'),
  description: z.string().describe('Detailed description of the product.'),
  craftType: z.string().describe('Category or type of craft (e.g., Pottery, Textiles, Jewelry).'),
  region: z.string().describe('Geographic region where the craft originated or is made.'),
  materials: z.string().describe('Materials used to create the product.'),
  story: z.string().describe('The cultural story or background of the craft.'),
  tags: z.array(z.string()).describe('Keywords or tags associated with the product.')
});
export type ProductForRecommendation = z.infer<typeof ProductForRecommendationSchema>;


const BuyerAIProductRecommendationsInputSchema = z.object({
  userId: z.string().describe('The ID of the buyer for whom recommendations are being generated.'),
  viewedProducts: z.array(ProductForRecommendationSchema).describe('A list of products the buyer has recently viewed.'),
  searchQueries: z.array(z.string()).describe('A list of search terms previously used by the buyer.'),
  allProducts: z.array(ProductForRecommendationSchema).describe('A comprehensive list of all available products to choose recommendations from.')
});
export type BuyerAIProductRecommendationsInput = z.infer<typeof BuyerAIProductRecommendationsInputSchema>;

const BuyerAIProductRecommendationsOutputSchema = z.object({
  recommendedProductIds: z.array(z.string().describe('The ID of a recommended product.')).describe('A list of unique product IDs recommended to the buyer.')
});
export type BuyerAIProductRecommendationsOutput = z.infer<typeof BuyerAIProductRecommendationsOutputSchema>;

export async function buyerAIProductRecommendations(
  input: BuyerAIProductRecommendationsInput
): Promise<BuyerAIProductRecommendationsOutput> {
  return buyerAIProductRecommendationsFlow(input);
}

const recommendationsPrompt = ai.definePrompt({
  name: 'recommendationsPrompt',
  input: { schema: BuyerAIProductRecommendationsInputSchema },
  output: { schema: BuyerAIProductRecommendationsOutputSchema },
  prompt: `You are an AI-powered craft marketplace recommendation engine. Your goal is to provide personalized product recommendations to buyers based on their past interactions.

Analyze the user's viewed products and search queries to understand their preferences and interests. Then, from the list of 'allProducts', identify products that align with these preferences.

IMPORTANT: Do not recommend any products that are already in the 'viewedProducts' list.
Aim to recommend between 5 and 10 unique products.

Here is the user's information:
User ID: {{{userId}}}

Products recently viewed by the user:
{{#if viewedProducts}}
{{#each viewedProducts}}
- Product ID: {{{productId}}}
  Name: {{{productName}}}
  Craft Type: {{{craftType}}}
  Region: {{{region}}}
  Description: {{{description}}}
  Materials: {{{materials}}}
  Story snippet: {{{story}}}
  Tags: {{#each tags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}
{{else}}
No products recently viewed.
{{/if}}

User's past search queries:
{{#if searchQueries}}
{{#each searchQueries}}
- {{{this}}}
{{/each}}
{{else}}
No past search queries.
{{/if}}

Available products for recommendation (choose from this list):
{{#each allProducts}}
- Product ID: {{{productId}}}
  Name: {{{productName}}}
  Craft Type: {{{craftType}}}
  Region: {{{region}}}
  Description: {{{description}}}
  Materials: {{{materials}}}
  Story snippet: {{{story}}}
  Tags: {{#each tags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

Based on the above, provide a list of recommended product IDs.`
});

const buyerAIProductRecommendationsFlow = ai.defineFlow(
  {
    name: 'buyerAIProductRecommendationsFlow',
    inputSchema: BuyerAIProductRecommendationsInputSchema,
    outputSchema: BuyerAIProductRecommendationsOutputSchema,
  },
  async (input) => {
    const viewedProductIds = new Set(input.viewedProducts.map(p => p.productId));
    try {
      const output = await executePromptWithFailover(recommendationsPrompt, input);
      if (output && output.recommendedProductIds) {
        const uniqueRecommendedIds = Array.from(new Set(output.recommendedProductIds));
        const filtered = uniqueRecommendedIds.filter(id => !viewedProductIds.has(id));
        if (filtered.length > 0) {
          return { recommendedProductIds: filtered };
        }
      }
    } catch (err: any) {
      console.warn('Recommendations AI failover exhausted, using catalog preference ranker fallback:', err?.message || err);
    }

    // Heuristic fallback: rank unviewed products by matching categories or search terms
    const viewedTypes = new Set(input.viewedProducts.map(p => p.craftType.toLowerCase()));
    const unviewed = input.allProducts.filter(p => !viewedProductIds.has(p.productId));
    const sorted = [...unviewed].sort((a, b) => {
      const aMatch = viewedTypes.has(a.craftType.toLowerCase()) ? 1 : 0;
      const bMatch = viewedTypes.has(b.craftType.toLowerCase()) ? 1 : 0;
      return bMatch - aMatch;
    });

    const fallbackIds = sorted.slice(0, 8).map(p => p.productId);
    return { recommendedProductIds: fallbackIds };
  }
);
