
'use server';
/**
 * @fileOverview A Genkit flow for providing pricing guidance to artisans.
 */

import {ai, executePromptWithFailover} from '@/ai/genkit';
import {z} from 'genkit';

const PriceAdvisorInputSchema = z.object({
  craftCategory: z.string(),
  materialsUsed: z.string(),
  hoursOfWork: z.number(),
  complexity: z.enum(['Low', 'Medium', 'High']),
});

const PriceAdvisorOutputSchema = z.object({
  recommendedMin: z.number(),
  recommendedMax: z.number(),
  reasoning: z.string().describe('Detailed explanation for the pricing suggestion.'),
});

export async function artisanAiPriceAdvisor(input: z.infer<typeof PriceAdvisorInputSchema>) {
  return artisanAiPriceAdvisorFlow(input);
}

const priceAdvisorPrompt = ai.definePrompt({
  name: 'priceAdvisorPrompt',
  input: {schema: PriceAdvisorInputSchema},
  output: {schema: PriceAdvisorOutputSchema},
  prompt: `You are a specialist in the Indian handicraft market. Provide a fair and competitive pricing range in Indian Rupees (₹) for a product with the following details:

Category: {{{craftCategory}}}
Materials: {{{materialsUsed}}}
Labor: {{{hoursOfWork}}} hours
Complexity: {{{complexity}}}

Consider market trends for authentic handmade goods. Provide a clear reasoning explaining how the labor, material cost, and craft rarity influence the price.`,
});

const artisanAiPriceAdvisorFlow = ai.defineFlow(
  {
    name: 'artisanAiPriceAdvisorFlow',
    inputSchema: PriceAdvisorInputSchema,
    outputSchema: PriceAdvisorOutputSchema,
  },
  async input => {
    try {
      const output = await executePromptWithFailover(priceAdvisorPrompt, input);
      if (output) return output;
    } catch (err: any) {
      console.warn('Price advisor AI failover exhausted, using economic craft model fallback:', err?.message || err);
    }

    const hourlyRate = input.complexity === 'High' ? 240 : input.complexity === 'Medium' ? 180 : 130;
    const materialCost = input.complexity === 'High' ? 850 : input.complexity === 'Medium' ? 500 : 300;
    const laborCost = Math.max(1, input.hoursOfWork) * hourlyRate;
    const midpoint = laborCost + materialCost;
    const recommendedMin = Math.round(midpoint * 0.85);
    const recommendedMax = Math.round(midpoint * 1.30);

    return {
      recommendedMin,
      recommendedMax,
      reasoning: `Calculated with a fair artisan wage benchmark (₹${hourlyRate}/hr for ${input.complexity.toLowerCase()} complexity, ${input.hoursOfWork} hrs) plus estimated raw material allowance for ${input.materialsUsed || input.craftCategory}.`,
    };
  }
);
