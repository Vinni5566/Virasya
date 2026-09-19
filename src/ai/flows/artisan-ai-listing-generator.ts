'use server';
/**
 * @fileOverview A Genkit flow for artisans to generate product listing content using AI.
 *
 * - generateArtisanListing - A function that handles the generation of product title, description, SEO tags, and craft story.
 * - ArtisanAIListingGeneratorInput - The input type for the generateArtisanListing function.
 * - ArtisanAIListingGeneratorOutput - The return type for the generateArtisanListing function.
 */

import {ai, executePromptWithFailover} from '@/ai/genkit';
import {z} from 'genkit';

const ArtisanAIListingGeneratorInputSchema = z.object({
  productImages: z
    .array(
      z
        .string()
        .describe(
          "A photo of a product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        )
    )
    .describe('An array of product images.'),
  productNameKeywords: z
    .string()
    .describe("Keywords or a tentative name for the product. Example: 'terracotta bowl', 'embroidered scarf'."),
  craftType: z
    .string()
    .describe(
      "The primary category or type of craft. Example: 'Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Hand paintings'."
    ),
  materials: z
    .string()
    .describe(
      "Key materials used in the product. Example: 'terracotta clay, natural glazes', 'cotton, silk threads', 'sterling silver, semi-precious stones'."
    ),
  region: z
    .string()
    .describe(
      "The geographical region or origin of the craft. Example: 'Khurja, Uttar Pradesh', 'Kutch, Gujarat', 'Jaipur, Rajasthan'."
    ),
  storyFacts: z
    .string()
    .describe(
      "Structured facts (e.g., historical context, artisan techniques, cultural significance, years of experience, specific community) to base the craft story on, preventing AI hallucination. Provide as bullet points or a short paragraph. Example: 'Made by master artisan Rama Devi with 30 years experience. Uses traditional block printing technique passed down for generations. Inspired by local folklore.'"
    ),
  existingDescription: z
    .string()
    .optional()
    .describe(
      "An optional existing product description provided by the artisan that the AI can expand upon, refine, or rewrite to be more engaging and SEO-friendly."
    ),
});
export type ArtisanAIListingGeneratorInput = z.infer<
  typeof ArtisanAIListingGeneratorInputSchema
>;

const ArtisanAIListingGeneratorOutputSchema = z.object({
  productTitle: z
    .string()
    .describe(
      'A concise, compelling, and SEO-optimized product title, typically 50-70 characters.'
    ),
  description: z
    .string()
    .describe(
      'A detailed, engaging, and persuasive product description that highlights craftsmanship, unique features, cultural relevance, and benefits to the buyer. It should be at least 150 words.'
    ),
  seoTags: z
    .array(z.string())
    .describe(
      'An array of 5-10 relevant and high-ranking SEO-friendly keywords and phrases (tags) to improve product discoverability.'
    ),
  craftStory: z
    .string()
    .describe(
      "A narrative story about the craft and its cultural significance, strictly based on the provided 'storyFacts'. It must not introduce any new information or embellishments not found in the facts. If no facts are given, it should state that the story will be generated once facts are provided."
    ),
});
export type ArtisanAIListingGeneratorOutput = z.infer<
  typeof ArtisanAIListingGeneratorOutputSchema
>;

export async function generateArtisanListing(
  input: ArtisanAIListingGeneratorInput
): Promise<ArtisanAIListingGeneratorOutput> {
  return artisanAIListingGeneratorFlow(input);
}

const artisanAIListingGeneratorPrompt = ai.definePrompt({
  name: 'artisanAIListingGeneratorPrompt',
  input: {schema: ArtisanAIListingGeneratorInputSchema},
  output: {schema: ArtisanAIListingGeneratorOutputSchema},
  prompt: `You are an expert e-commerce content creator specializing in handcrafted art. Your task is to generate a product title, a detailed description, SEO tags, and a fact-based craft story for an artisan's product listing.

Strictly follow these guidelines:
1.  **Product Title**: Create a concise and catchy product title that is SEO-friendly.
2.  **Product Description**: Write a detailed, engaging, and persuasive description that highlights the product's unique qualities, craftsmanship, and benefits. If an existing description is provided, expand upon it or refine it.
3.  **SEO Tags**: Generate an array of 5-10 relevant and high-ranking SEO tags (keywords) that will help customers find the product.
4.  **Craft Story**: Generate a narrative story about the craft. This story MUST ONLY use the provided 'storyFacts' and MUST NOT hallucinate any additional information. If no story facts are provided, state that the story will be generated when facts are available.

Here are the details about the product:

Product Name Keywords: {{{productNameKeywords}}}
Craft Type: {{{craftType}}}
Materials: {{{materials}}}
Region: {{{region}}}
Existing Description (if any): {{{existingDescription}}}
Craft Story Facts: {{{storyFacts}}}

Product Image(s):
{{#each productImages}}
  {{media url=this}}
{{/each}}`,
});

const artisanAIListingGeneratorFlow = ai.defineFlow(
  {
    name: 'artisanAIListingGeneratorFlow',
    inputSchema: ArtisanAIListingGeneratorInputSchema,
    outputSchema: ArtisanAIListingGeneratorOutputSchema,
  },
  async input => {
    try {
      const output = await executePromptWithFailover(artisanAIListingGeneratorPrompt, input);
      if (output) return output;
    } catch (err: any) {
      console.warn('Listing generator AI failover exhausted, using intelligent structured fallback:', err?.message || err);
    }

    const keywords = input.productNameKeywords.trim();
    const craft = input.craftType;
    const region = input.region;
    const materials = input.materials;
    const title = `${keywords ? keywords.charAt(0).toUpperCase() + keywords.slice(1) : 'Authentic Handcrafted Piece'} - ${craft} from ${region}`;
    const baseDesc = input.existingDescription?.trim()
      ? input.existingDescription.trim()
      : `Exquisitely handcrafted ${craft.toLowerCase()} made from authentic ${materials} by skilled artisans in ${region}.`;
    const fullDesc = `${baseDesc} Each piece reflects centuries of traditional Indian craftsmanship, requiring meticulous attention to detail, natural sustainable materials, and time-honoured techniques. Perfect as a thoughtful gift or a distinctive cultural accent for modern homes, this piece celebrates genuine artisan heritage and fair-trade ethics.`;
    const story = input.storyFacts?.trim()
      ? input.storyFacts.trim()
      : `Rooted in the living heritage of ${region}, this authentic ${craft} carries generations of artistic dedication. Every detail honors traditional Indian artisan practices, preserving our rich cultural legacy through patient, sustainable craftsmanship.`;

    const cleanKeywords = keywords.toLowerCase().split(/\s+/).filter(Boolean);
    const seoTags = Array.from(new Set([
      'handmade',
      'indian handicraft',
      craft.toLowerCase(),
      region.toLowerCase(),
      ...cleanKeywords,
      'fair trade',
      'artisan made',
    ])).slice(0, 8);

    return {
      productTitle: title,
      description: fullDesc,
      seoTags,
      craftStory: story,
    };
  }
);
