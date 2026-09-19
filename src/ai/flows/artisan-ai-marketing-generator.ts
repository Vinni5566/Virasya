
'use server';
/**
 * @fileOverview A Genkit flow for generating social media promotional content.
 */

import {ai, executePromptWithFailover} from '@/ai/genkit';
import {z} from 'genkit';

const MarketingInputSchema = z.object({
  productName: z.string(),
  craftType: z.string(),
  region: z.string(),
  description: z.string(),
  targetLanguage: z.string().optional().describe('Target language for promotional content, e.g. English, Hindi, Tamil, Punjabi, Bengali, etc.'),
});

const MarketingOutputSchema = z.object({
  instagram: z.string().describe('Max 60 words.'),
  whatsapp: z.string().describe('Around 100 words.'),
  hashtags: z.array(z.string()).describe('8-10 tags.'),
  promoLine: z.string().describe('A catchy short line.'),
});

export async function generateMarketingContent(input: z.infer<typeof MarketingInputSchema>) {
  return marketingGeneratorFlow(input);
}

const marketingPrompt = ai.definePrompt({
  name: 'marketingPrompt',
  input: {schema: MarketingInputSchema},
  output: {schema: MarketingOutputSchema},
  prompt: `Generate promotional social media content for this artisan product. 

Product: {{{productName}}}
Craft: {{{craftType}}}
Region: {{{region}}}
Description: {{{description}}}
{{#if targetLanguage}}Target Language: {{{targetLanguage}}}{{/if}}

Requirements:
- CRITICAL LANGUAGE RULE: Generate ALL content (Instagram caption, WhatsApp message, promo line, hashtags) strictly in {{{targetLanguage}}}. Write in the native script appropriate for {{{targetLanguage}}} (e.g. Devanagari for Hindi/Marathi, Tamil script for Tamil, Gurmukhi for Punjabi, Bengali script for Bengali, Telugu script for Telugu, etc.). Do NOT produce English unless targetLanguage is English.
- Instagram caption: Max 60 words, engaging and authentic.
- WhatsApp message: Around 100 words, written as a warm, complete product introduction encouraging purchase.
- Hashtags: 8-10 relevant tags (including localized craft/region hashtags in script or Roman script as natural).
- Promo Line: A short, punchy one-liner.

Tone: Warm, authentic, premium.`,
});

const LOCALIZED_FALLBACKS: Record<string, {
  instaPrefix: string;
  instaSuffix: string;
  waTitle: string;
  waBody: string;
  waBullet1: string;
  waBullet2: string;
  waBullet3: string;
  waFooter: string;
  promo: string;
}> = {
  Hindi: {
    instaPrefix: '✨ प्रस्तुत है',
    instaSuffix: '— विरासत और शिल्प कला की एक अनूठी कृति! अब विरासया पर उपलब्ध। हस्तशिल्प भारत का अनुभव करें। 🛍️',
    waTitle: '🎨 पेश है:',
    waBody: 'भारतीय हस्तशिल्प और कारीगरी का एक बेजोड़ नमूना। यह कृति हमारे कुशल कारीगरों द्वारा पारंपरिक विधि से तैयार की गई है।',
    waBullet1: '✅ 100% प्रामाणिक और हस्तनिर्मित',
    waBullet2: '✅ सीधे कारीगर के हाथों से',
    waBullet3: '✅ उचित मूल्य की गारंटी',
    waFooter: '🛍️ विरासया (Virasya) पर आज ही ऑर्डर करें।\n📦 सुरक्षित डिलीवरी | 🔒 सुरक्षित भुगतान',
    promo: 'भारत की जीवंत हस्तकला विरासत का हिस्सा बनें —',
  },
  Punjabi: {
    instaPrefix: '✨ ਪੇਸ਼ ਹੈ',
    instaSuffix: '— ਵਿਰਾਸਤ ਅਤੇ ਹੱਥੀਂ ਬਣੀ ਕਲਾ ਦਾ ਇੱਕ ਸ਼ਾਨਦਾਰ ਨਮੂਨਾ! ਹੁਣ ਵਿਰਾਸਯਾ \'ਤੇ ਉਪਲਬਧ। 🛍️',
    waTitle: '🎨 ਪੇਸ਼ ਹੈ:',
    waBody: 'ਭਾਰਤੀ ਸ਼ਿਲਪਕਾਰੀ ਦਾ ਇੱਕ ਅਦਭੁਤ ਨਮੂਨਾ। ਇਹ ਖਾਸ ਚੀਜ਼ ਸਾਡੇ ਮਾਹਰ ਕਾਰੀਗਰਾਂ ਦੁਆਰਾ ਰਵਾਇਤੀ ਤਰੀਕੇ ਨਾਲ ਤਿਆਰ ਕੀਤੀ ਗਈ ਹੈ।',
    waBullet1: '✅ 100% ਪ੍ਰਮਾਣਿਕ ਅਤੇ ਹੱਥ ਨਾਲ ਬਣਿਆ',
    waBullet2: '✅ ਸਿੱਧਾ ਕਾਰੀਗਰ ਤੋਂ',
    waBullet3: '✅ ਸਹੀ ਅਤੇ ਨਿਰਪੱਖ ਕੀਮਤ',
    waFooter: '🛍️ ਅੱਜ ਹੀ ਵਿਰਾਸਯਾ (Virasya) \'ਤੇ ਖਰੀਦੋ।\n📦 ਤੇਜ਼ ਡਿਲਿਵਰੀ | 🔒 ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ',
    promo: 'ਭਾਰਤ ਦੀ ਅਮੀਰ ਵਿਰਾਸਤ ਦਾ ਹਿੱਸਾ ਬਣੋ —',
  },
  Tamil: {
    instaPrefix: '✨ அறிமுகம்',
    instaSuffix: '— பாரம்பரிய கைவினைப் பொருளின் சிறப்புப் படைப்பு! இப்போது விராஸ்யாவில் கிடைக்கிறது. 🛍️',
    waTitle: '🎨 அறிமுகம்:',
    waBody: 'பாரம்பரிய கைவினைத் திறமையால் உருவாக்கப்பட்ட அசல் இந்தியக் கைவினைப் பொருள். கைவினைஞர்களின் திறமையான உழைப்பில் உருவானது.',
    waBullet1: '✅ 100% அசல் மற்றும் கையால் செய்யப்பட்டது',
    waBullet2: '✅ நேரடியாக கைவினைஞரிடமிருந்து',
    waBullet3: '✅ நியாயமான விலை',
    waFooter: '🛍️ விராஸ்யா (Virasya) தளத்தில் உடனே வாங்குங்கள்.\n📦 பாதுகாப்பான விநியோகம் | 🔒 பாதுகாப்பான பணம் செலுத்துதல்',
    promo: 'இந்தியாவின் கைவினை பாரம்பரியத்தை சொந்தமாக்குங்கள் —',
  },
  Bengali: {
    instaPrefix: '✨ উপস্থাপন করছি',
    instaSuffix: '— ঐতিহ্য ও হস্তশিল্পের এক অনন্য সৃষ্টি! এখন ভিরাসিয়াতে উপলব্ধ। 🛍️',
    waTitle: '🎨 পেশ করছি:',
    waBody: 'খাঁটি ভারতীয় হস্তশিল্পের অসাধারণ সৃষ্টি। অভিজ্ঞ কারিগরদের হাতে তৈরি এই শিল্পকর্মটি ঐতিহ্যের প্রতীক।',
    waBullet1: '✅ ১০০% খাঁটি এবং হাতে তৈরি',
    waBullet2: '✅ সরাসরি কারিগরের কাছ থেকে',
    waBullet3: '✅ ন্যায্য মূল্য',
    waFooter: '🛍️ ভিরাসিয়া (Virasya) প্ল্যাটফর্মে আজই সংগ্রহ করুন।\n📦 দ্রুত ডেলিভারি | 🔒 নিরাপদ পেমেন্ট',
    promo: 'ভারতের ঐতিহ্যবাহী হস্তশিল্পের অংশ হন —',
  },
};

const marketingGeneratorFlow = ai.defineFlow(
  {
    name: 'marketingGeneratorFlow',
    inputSchema: MarketingInputSchema,
    outputSchema: MarketingOutputSchema,
  },
  async input => {
    try {
      const output = await executePromptWithFailover(marketingPrompt, input);
      if (output) return output;
    } catch (err: any) {
      console.warn('Marketing AI failover exhausted, using template fallback:', err?.message || err);
    }

    // Template fallback — localized and resilient
    const targetLang = input.targetLanguage || 'English';
    const craft = input.craftType || 'handcraft';
    const region = input.region || 'India';
    const name = input.productName || 'Artisan Piece';
    const regionSlug = region.split(',')[0].trim().replace(/\s+/g, '');
    const craftSlug = craft.replace(/\s+/g, '');

    const fallback = LOCALIZED_FALLBACKS[targetLang];
    if (fallback) {
      return {
        instagram: `${fallback.instaPrefix} *${name}* (${craft}, ${region}) ${fallback.instaSuffix}`,
        whatsapp: `${fallback.waTitle} *${name}*\n\n${fallback.waBody} (${craft}, ${region})\n\n${fallback.waBullet1}\n${fallback.waBullet2}\n${fallback.waBullet3}\n\n${fallback.waFooter}`,
        hashtags: [
          '#Virasya',
          '#HandmadeInIndia',
          '#ArtisanCraft',
          `#${craftSlug}`,
          `#${regionSlug}`,
          '#AuthenticCraft',
          '#IndianArtisans',
          '#Heritage',
        ],
        promoLine: `${fallback.promo} ${name}.`,
      };
    }

    return {
      instagram: `✨ Meet *${name}* — a stunning ${craft} from ${region}! 🇮🇳 Every stitch, every curve carries centuries of heritage. Now available on Virasya. Shop authentic India. 🛍️`,
      whatsapp: `🎨 *Introducing: ${name}*\n\nThis exquisite piece of ${craft} from ${region} is a living tribute to India's rich artisan heritage. Crafted by master artisans using time-honoured techniques passed down through generations, each piece is one-of-a-kind.\n\n✅ 100% Authentic & Handmade\n✅ Directly from the artisan\n✅ Fair-trade pricing\n\n🛍️ Explore & purchase on *Virasya* — India's trusted platform for authentic handcrafted art.\n\n📦 Fast delivery | 🔒 Secure payment`,
      hashtags: [
        '#HandmadeInIndia',
        '#IndianCraft',
        '#Virasya',
        '#ArtisanMade',
        '#HeritageArt',
        `#${craftSlug}`,
        `#${regionSlug}Craft`,
        '#SupportArtisans',
        '#EthicalLiving',
        '#AuthenticIndia',
      ],
      promoLine: `Own a piece of India's living heritage — ${name}.`,
    };
  }
);
