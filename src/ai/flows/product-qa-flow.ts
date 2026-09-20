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
Your goal is to answer a buyer's question about a specific handcrafted product accurately and directly.

Product Context:
- Name: {{{productName}}}
- Category: {{{craftType}}}
- Materials: {{{materials}}}
- Region: {{{region}}}
- Heritage Story: {{{story}}}

Question: {{{question}}}

Instructions:
1. Directly answer the buyer's question in the very first sentence. For yes/no questions (e.g. "is this solar powered?", "is it washable?", "is it eco-friendly?"), start with a clear, direct answer before explaining.
2. Ground your answer strictly in the product details and context provided. If an item is an indoor artisanal table lamp or craft, state clearly that it uses standard electrical cord fittings (not solar or battery unless specified).
3. Provide culturally authentic, accurate, and respectful information.
4. Limit the answer to 2-4 professional, helpful, and concise sentences.`,
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
      if (output && output.answer && output.answer.trim().length > 15) {
        return output;
      }
    } catch (err: any) {
      console.warn('Product QA AI failover exhausted, using contextual craft fallback:', err?.message || err);
    }

    const q = input.question.toLowerCase().trim();
    const mats = input.materials || 'traditional natural materials';
    const craft = input.craftType || 'Handcraft';
    const name = input.productName || 'This handcrafted piece';
    const region = input.region || 'India';
    let answer = '';

    // Helper to check whole-word or specific phrase matches
    const hasWord = (pattern: RegExp) => pattern.test(q);

    // 1. Customization / Personalization (Highest priority to avoid collision with 'size')
    if (hasWord(/\b(custom|customize|customized|customization|personalize|personalized|personalization|bespoke|custom order|custom color|custom size)\b/i)) {
      answer = `Custom sizing, motifs, or color adaptations for ${craft} can often be arranged directly with our verified artisans. You can submit a custom inquiry via Virasya to discuss personalized requirements.`;
    }
    // 2. Fair Trade / Pricing / Artisan Benefit (Prioritized to avoid collision with 'plastic' or 'cheap')
    else if (hasWord(/\b(price|pricing|cost|expensive|worth|fair trade|fair-trade|artisan pay|ethical wage|cheap)\b/i)) {
      answer = `Virasya operates on a fair-trade, artisan-first model. The price of ${name} directly reflects the days of skilled manual labor, authentic regional materials (${mats}), and generational heritage expertise invested by master artisans in ${region}, ensuring fair compensation without middlemen exploitation.`;
    }
    // 3. Power Source / Solar / Battery / Electricity / Charging / Cord
    else if (hasWord(/\b(solar|battery|batteries|recharge|rechargeable|charge|charging|cord|cords|wire|wireless|cordless|power source|electricity|electric|plug|plugs)\b/i)) {
      if (hasWord(/\bsolar\b/i)) {
        answer = `No, ${name} is not solar-powered. It is designed as an authentic indoor decorative piece that connects to standard home electrical plug points with a standard cord and socket fitting, ensuring consistent, warm ambient lighting.`;
      } else if (hasWord(/\b(battery|batteries|wireless|cordless)\b/i)) {
        answer = `No, ${name} is powered via a standard plug-in electrical cord rather than batteries, providing stable continuous illumination for your living space.`;
      } else {
        answer = `${name} uses a standard plug-in power cord compatible with regular domestic electrical sockets, designed safely for indoor decorative and ambient lighting.`;
      }
    }
    // 4. Waterproof / Water Resistance / Outdoor Use / Weather / Rain
    else if (hasWord(/\b(waterproof|water-proof|water resistant|outdoor|outdoors|rain|rainy|balcony|garden|weather|moisture)\b/i)) {
      answer = `No, ${name} is strictly intended for indoor use. Because it features delicate hand-painted artwork on materials like ${mats}, exposure to rain, moisture, or direct outdoor weathering will damage the pigments and finish.`;
    }
    // 5. Lamps, Lighting, Bulbs, Electrical Fittings, Wattage
    else if (hasWord(/\b(bulb|bulbs|watt|watts|wattage|voltage|holder|socket|illumination|glow|light fitting|which light|type of light)\b/i)) {
      answer = `For handcrafted lamps like ${name}, we recommend using a warm LED bulb (3W to 9W) with standard socket fittings. LEDs generate minimal heat, which protects the intricate hand-painted artwork and materials (${mats}) from heat wear while casting an enchanting ambient glow.`;
    }
    // 6. Care / Washing / Cleaning / Maintenance / Heat / Sunlight
    else if (hasWord(/\b(care|wash|washing|clean|cleaning|maintain|maintenance|wipe|dust|dusting|soap|dishwasher)\b/i)) {
      answer = `To preserve the longevity and colors of this ${craft} (${mats}), dust gently with a dry, soft microfiber cloth. Do not wash with water or harsh chemical cleaners, and avoid direct prolonged exposure to extreme sunlight or damp conditions to keep the hand-painted detailing vibrant.`;
    }
    // 7. Fragility / Durability / Longevity / Heavy / Breakage
    else if (hasWord(/\b(fragile|break|breakable|durable|durability|heavy|weight|sturdy|sturdiness|strong|fade|fading|rust|rusting)\b/i)) {
      answer = `${name} is built on a sturdy structural frame with authentic ${mats}, ensuring lasting longevity. However, as with any fine handcrafted art piece, the painted surface and delicate embellishments should be handled gently with care to prevent accidental drops or abrasion.`;
    }
    // 8. Eco-friendly / Sustainability / Green / Environmental Impact / Safety
    else if (hasWord(/\b(eco|eco-friendly|ecofriendly|sustainable|sustainability|green|environment|environmental|biodegradable|organic|non-toxic|toxic|lead-free|child safe|pet safe)\b/i)) {
      answer = `Yes, ${name} is largely eco-friendly and sustainably crafted. It is handcrafted in small batches by traditional artisans in ${region} using authentic materials (${mats}), avoiding industrial mass-manufacturing and harsh chemicals. The slow-craft process supports sustainable, ethical livelihoods.`;
    }
    // 9. Dimensions / Size / Height / Fit / Placement
    else if (hasWord(/\b(dimension|dimensions|size|height|tall|width|length|fit|fits|desk|bedside|nightstand|tabletop)\b/i)) {
      answer = `${name} is crafted with proportional dimensions designed to comfortably fit bedside nightstands, study desks, console tables, or living room credenzas without overpowering the surrounding decor.`;
    }
    // 10. Authenticity / Handmade verification / Machine vs Hand / Factory
    else if (hasWord(/\b(authentic|authenticity|handmade|hand-made|original|real|fake|machine made|factory|factory-made|artisan|artisans)\b/i)) {
      answer = `This is a 100% genuine handcrafted ${craft} piece created by verified master artisans in ${region}. Because each piece is manually crafted with ${mats}, subtle nuances in paint strokes, textures, and detailing are natural signatures of authenticity, making your item unique and one-of-a-kind.`;
    }
    // 11. Assembly / Installation / Setup
    else if (hasWord(/\b(assemble|assembly|install|installation|setup|how to use|how to set up)\b/i)) {
      answer = `${name} comes pre-assembled and ready to display. For lighting pieces, simply unbox carefully, fit a standard compatible LED bulb into the holder, plug into your wall socket, and switch on to enjoy its warm artisanal ambiance.`;
    }
    // 12. Packaging / Shipping / Delivery / Safe Transit
    else if (hasWord(/\b(pack|package|packaging|packed|ship|shipping|shipped|deliver|delivery|transit|damage in transit|box)\b/i)) {
      answer = `Every ${craft} order is packaged with multi-layer protective cushioning, bubble wrap, and reinforced corrugated boxes to ensure safe, damage-free delivery from the artisan workshop directly to your doorstep.`;
    }
    // 13. Religious / Spiritual / Deity / Krishna / Pichwai Symbolism
    else if (hasWord(/\b(krishna|shree krishna|spiritual|spirituality|religious|religion|god|deity|puja|pooja|mandir|temple|sacred|symbol|symbolism|meaning)\b/i)) {
      answer = `${name} carries deep spiritual and cultural significance, portraying devotional motifs inspired by sacred traditions in ${region}. It brings an auspicious, serene aura to living spaces, meditation rooms, and home mandirs.`;
    }
    // 14. Origin / Geography / Artisan Heritage / History
    else if (hasWord(/\b(history|origin|origins|where is it from|where was it made|tradition|traditional|heritage|story|background)\b/i)) {
      if (input.story && input.story.length > 25) {
        answer = `${name} is rooted in the rich artistic heritage of ${region}. ${input.story}`;
      } else {
        answer = `${name} represents centuries of regional craft mastery from ${region}. Passed down through generations of artisans, this ${craft} combines sacred symbolism with meticulous attention to detail.`;
      }
    }
    // 15. Materials / What is it made of
    else if (hasWord(/\b(material|materials|what is it made|composition|fabric|wood|metal|paper|paint|paints)\b/i)) {
      answer = `${name} is meticulously constructed from genuine ${mats}. Artisans in ${region} carefully select and treat each raw material to balance aesthetic heritage with everyday structural durability.`;
    }
    // 16. Gifting / Home Decor / Placement
    else if (hasWord(/\b(gift|gifting|gifts|gifted|decor|decoration|room|living room|placement|occasion|housewarming|wedding|diwali)\b/i)) {
      answer = `This ${craft} makes an exceptional cultural statement piece for living rooms, study desks, bedside tables, or spiritual corners. Its authentic handcrafted aesthetics and cultural charm also make it a meaningful, memorable gift for housewarmings, festivals, and weddings.`;
    }
    // 17. General / Fallback
    else {
      answer = input.story
        ? `${name} is an authentic handcrafted ${craft} from ${region}, skillfully created using ${mats}. ${input.story}`
        : `${name} is an authentic handcrafted ${craft} piece crafted with ${mats} by master artisans in ${region}. Every piece directly supports traditional Indian craft livelihoods while preserving cultural heritage.`;
    }

    return { answer };
  }
);
