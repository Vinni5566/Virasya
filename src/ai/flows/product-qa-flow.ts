'use server';
/**
 * @fileOverview A Genkit flow for answering buyer questions about specific handcrafted products.
 */

import {ai, executePromptWithFailover} from '@/ai/genkit';
import {z} from 'genkit';

const ProductQAInputSchema = z.object({
  productName: z.string(),
  craftType: z.string(),
  materials: z.string(),
  region: z.string(),
  story: z.string(),
  question: z.string(),
});
export type ProductQAInput = z.infer<typeof ProductQAInputSchema>;

const ProductQAOutputSchema = z.object({
  answer: z.string().describe('A helpful, culturally informed answer to the buyer\'s question.'),
});
export type ProductQAOutput = z.infer<typeof ProductQAOutputSchema>;

export async function askProductAI(input: ProductQAInput): Promise<ProductQAOutput> {
  return productQAFlow(input);
}

const productQAPrompt = ai.definePrompt({
  name: 'productQAPrompt',
  input: {schema: ProductQAInputSchema},
  output: {schema: ProductQAOutputSchema},
  prompt: `You are Virasya AI, an expert on Indian handicrafts and cultural heritage. 
Your goal is to answer a buyer's question about a specific handcrafted product.

Product Context:
- Name: {{{productName}}}
- Category: {{{craftType}}}
- Materials: {{{materials}}}
- Region: {{{region}}}
- Heritage Story: {{{story}}}

Question: {{{question}}}

Instructions:
1. Use the provided product context as the primary source of truth.
2. Provide culturally accurate and respectful information.
3. If the question is about care, provide advice suitable for the materials listed.
4. If the question is about history, elaborate on the regional craft tradition.
5. Keep the tone warm, authentic, and knowledgeable.
6. Limit the answer to 3-4 professional and engaging sentences.`,
});

const productQAFlow = ai.defineFlow(
  {
    name: 'productQAFlow',
    inputSchema: ProductQAInputSchema,
    outputSchema: ProductQAOutputSchema,
  },
  async input => {
    try {
      const output = await executePromptWithFailover(productQAPrompt, input);
      if (output) return output;
    } catch (err: any) {
      console.warn('Product QA AI failover exhausted, using contextual craft fallback:', err?.message || err);
    }

    const q = input.question.toLowerCase();
    let answer = '';
    if (q.includes('care') || q.includes('wash') || q.includes('clean') || q.includes('maintain')) {
      answer = `To properly care for this authentic ${input.craftType} made with ${input.materials}, avoid direct exposure to harsh detergents, prolonged moisture, or excessive heat. Gently wipe with a soft dry cloth or follow traditional gentle cleaning methods suited for genuine ${input.materials}.`;
    } else if (q.includes('where') || q.includes('origin') || q.includes('region') || q.includes('made')) {
      answer = `This piece is authentic ${input.craftType} handcrafted by traditional master artisans hailing from ${input.region}. It embodies the time-honoured heritage of this cultural region.`;
    } else if (q.includes('material') || q.includes('what is it made')) {
      answer = `This authentic handcrafted item is made using genuine ${input.materials}, carefully selected and shaped through time-tested artisanal techniques.`;
    } else {
      answer = input.story
        ? `${input.productName} is an authentic ${input.craftType} from ${input.region}. ${input.story}`
        : `${input.productName} is an authentic handcrafted ${input.craftType} piece crafted with ${input.materials} by master artisans in ${input.region}. Every piece preserves time-honoured Indian craft heritage.`;
    }

    return { answer };
  }
);
