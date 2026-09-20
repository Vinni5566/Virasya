'use server';
/**
 * @fileOverview A Genkit flow for generating culturally authentic craft stories based on structured artisan input.
 *
 * - artisanAiCraftStoryGenerator - A function that generates a narrative story about a craft.
 * - ArtisanAiCraftStoryGeneratorInput - The input type for the artisanAiCraftStoryGenerator function.
 * - ArtisanAiCraftStoryGeneratorOutput - The return type for the artisanAiCraftStoryGenerator function.
 */

import {ai, executePromptWithFailover} from '@/ai/genkit';
import {z} from 'genkit';

const ArtisanAiCraftStoryGeneratorInputSchema = z.object({
  productName: z
    .string()
    .describe('The name of the product for which the story is being generated.'),
  region: z
    .string()
    .describe('The geographical region where the craft originates or is practiced.'),
  craftTradition: z
    .string()
    .describe('The historical or cultural tradition associated with this craft.'),
  materials: z
    .string()
    .describe('The primary materials used in crafting the product.'),
  yearsOfExperience: z
    .number()
    .describe('The number of years the artisan has practiced this craft.'),
  specialTechnique: z
    .string()
    .describe('Any unique or special techniques used in creating the product.'),
  targetLanguage: z
    .string()
    .optional()
    .describe('Target language for the story, e.g. English, Hindi, Tamil, Bengali, Punjabi, etc.'),
});
export type ArtisanAiCraftStoryGeneratorInput = z.infer<
  typeof ArtisanAiCraftStoryGeneratorInputSchema
>;

const ArtisanAiCraftStoryGeneratorOutputSchema = z.object({
  story: z
    .string()
    .describe('A culturally authentic narrative story about the craft and product.'),
});
export type ArtisanAiCraftStoryGeneratorOutput = z.infer<
  typeof ArtisanAiCraftStoryGeneratorOutputSchema
>;

export async function artisanAiCraftStoryGenerator(
  input: ArtisanAiCraftStoryGeneratorInput
): Promise<ArtisanAiCraftStoryGeneratorOutput> {
  return artisanAiCraftStoryGeneratorFlow(input);
}

const artisanCraftStoryPrompt = ai.definePrompt({
  name: 'artisanCraftStoryPrompt',
  input: {schema: ArtisanAiCraftStoryGeneratorInputSchema},
  output: {schema: ArtisanAiCraftStoryGeneratorOutputSchema},
  prompt: `You are a skilled storyteller specializing in authentic craft narratives. Your task is to generate a culturally rich and engaging story about a handcrafted product, based *solely* on the provided facts. Do NOT invent any details or information not explicitly given. The story should highlight the heritage and uniqueness of the product.

Product Name: {{{productName}}}

Facts about the craft:
Region: {{{region}}}
Craft Tradition: {{{craftTradition}}}
Materials: {{{materials}}}
Years of Artisan Experience: {{{yearsOfExperience}}}
Special Technique: {{{specialTechnique}}}
{{#if targetLanguage}}Target Language: {{{targetLanguage}}}{{/if}}

Please craft a narrative story (maximum 4 sentences) that captivates potential buyers and conveys the product's cultural significance and the artisan's dedication.
{{#if targetLanguage}}Write the story directly in {{{targetLanguage}}} using authentic phrasing and native script.{{else}}Write the story in English.{{/if}}`,
});

const artisanAiCraftStoryGeneratorFlow = ai.defineFlow(
  {
    name: 'artisanAiCraftStoryGeneratorFlow',
    inputSchema: ArtisanAiCraftStoryGeneratorInputSchema,
    outputSchema: ArtisanAiCraftStoryGeneratorOutputSchema,
  },
  async input => {
    try {
      const output = await executePromptWithFailover(artisanCraftStoryPrompt, input);
      if (output) return output;
    } catch (err: any) {
      console.warn('Story generator AI failover exhausted, using template fallback:', err?.message || err);
    }
    const lang = input.targetLanguage || 'English';

    const LOCALIZED_STORIES: Record<string, string> = {
      Hindi: `${input.productName}, ${input.region} की समृद्ध ${input.craftTradition} का एक अनूठा उदाहरण है, जिसे ${input.yearsOfExperience} वर्षों के समर्पित अनुभव के साथ ${input.materials} द्वारा तैयार किया गया है। ${input.specialTechnique} की विधि से निर्मित यह कलाकृति भारतीय शिल्प परंपराओं की जीवित विरासत और भक्ति को दर्शाती है। इसका प्रत्येक विवरण सांस्कृतिक प्रामाणिकता को संरक्षित करता है।`,
      Punjabi: `${input.productName}, ${input.region} ਦੀ ਅਮੀਰ ${input.craftTradition} ਦਾ ਇੱਕ ਸ਼ਾਨਦਾਰ ਨਮੂਨਾ ਹੈ, ਜਿਸਨੂੰ ${input.yearsOfExperience} ਸਾਲਾਂ ਦੇ ਸਮਰਪਿਤ ਤਜ਼ਰਬੇ ਨਾਲ ${input.materials} ਦੁਆਰਾ ਤਿਆਰ ਕੀਤਾ ਗਿਆ ਹੈ। ${input.specialTechnique} ਵਿਧੀ ਨਾਲ ਬਣੀ ਇਹ ਕਲਾਕ੍ਰਿਤੀ ਭਾਰਤੀ ਸ਼ਿਲਪ ਪਰੰਪਰਾਵਾਂ ਦੀ ਜੀਵਤ ਵਿਰਾਸਤ ਨੂੰ ਦਰਸਾਉਂਦੀ ਹੈ। ਹਰ ਵੇਰਵਾ ਸੱਭਿਆਚਾਰਕ ਪ੍ਰਮਾਣਿਕਤਾ ਨੂੰ ਸੁਰੱਖਿਅਤ ਰੱਖਦਾ ਹੈ।`,
      Tamil: `${input.productName}, ${input.region} பகுதியின் வரலாற்றுச் சிறப்புமிக்க ${input.craftTradition} பாரம்பரியத்தை பிரதிபலிக்கும் சிறந்த படைப்பாகும். ${input.yearsOfExperience} வருட அனுபவமிக்க கைவினைஞரால் ${input.materials} கொண்டு நேர்த்தியாக உருவாக்கப்பட்டது. ${input.specialTechnique} நுட்பத்துடன் செய்யப்பட்ட இப்படைப்பு இந்திய கைவினைப் பாரம்பரியத்தின் பெருமையைப் பறைசாற்றுகிறது.`,
      Bengali: `${input.productName}, ${input.region}-এর সমৃদ্ধ ${input.craftTradition}-এর এক অনন্য নিদর্শন, যা ${input.yearsOfExperience} বছরের নিষ্ঠাবান অভিজ্ঞতায় ${input.materials} দিয়ে তৈরি। ${input.specialTechnique} কৌশলে নির্মিত এই শিল্পকর্মটি ভারতীয় হস্তশিল্প ঐতিহ্যের জীবন্ত রূপকে তুলে ধরে। প্রতিটি সূক্ষ্ম কাজ সাংস্কৃতিক সত্যতা বহন করে।`,
      Marathi: `${input.productName}, ${input.region} च्या समृद्ध ${input.craftTradition} हस्तकलेचा एक उत्कृष्ट नमुना आहे, जो ${input.yearsOfExperience} वर्षांच्या अनुभवातून ${input.materials} वापरून घडवला गेला आहे। ${input.specialTechnique} तंत्राने बनवलेली ही कलाकृती भारतीय हस्तकला परंपरेचा जिवंत वारसा दर्शवते।`,
      Gujarati: `${input.productName}, ${input.region} ના સમૃદ્ધ ${input.craftTradition} હસ્તકળાનો એક અનોખો નમૂનો છે, જે ${input.yearsOfExperience} વર્ષના અનુભવી કારીગર દ્વારા ${input.materials} વડે તૈયાર કરાયો છે. ${input.specialTechnique} પદ્ધતિથી બનેલી આ કૃતિ ભારતીય હસ્તકળા વારસાનું ગૌરવ વધારે છે.`,
      Telugu: `${input.productName}, ${input.region} యొక్క విశిష్ట ${input.craftTradition} సాంప్రదాయానికి అద్దం పట్టే అద్భుతమైన కళాఖండం. ${input.yearsOfExperience} సంవత్సరాల అనుభవంతో ${input.materials} ఉపయోగించి రూపొందించబడింది. ${input.specialTechnique} సాంకేతికతతో తయారు చేయబడిన ఈ కృతి భారతీయ హస్తకళల వారసత్వాన్ని చాటిచెబుతుంది.`,
      Kannada: `${input.productName}, ${input.region} ನ ಸಮೃದ್ಧ ${input.craftTradition} ಕಲೆಯ ವಿಶಿಷ್ಟ ಸೃಷ್ಟಿಯಾಗಿದೆ. ${input.yearsOfExperience} ವರ್ಷಗಳ ಅನುಭವವಿರುವ ಕುಶಲಕರ್ಮಿಯಿಂದ ${input.materials} ಬಳಸಿ ನಿರ್ಮಿಸಲಾಗಿದೆ. ${input.specialTechnique} ತಂತ್ರಜ್ಞಾನದಲ್ಲಿ ರಚಿಸಲಾದ ಈ ಕಲಾಕೃತಿಯು ಭಾರತೀಯ ಕರಕುಶಲ ಪರಂಪರೆಯ ಜೀವಂತ ಸಂಕೇತವಾಗಿದೆ.`,
      Malayalam: `${input.productName}, ${input.region}-ലെ സമ്പന്നമായ ${input.craftTradition} പാരമ്പര്യത്തിന്റെ മനോಹരമായ ഉദാഹരണമാണ്. ${input.yearsOfExperience} വർഷത്തെ അനുഭവസമ്പത്തുള്ള കരകൗಶല വിദഗ്ദ്ധൻ ${input.materials} ഉപയോഗിച്ച് നിർമ്മിച്ചതാണ്. ${input.specialTechnique} സാങ്കേതികവിദ്യയിലൂടെ നിർമ്മിച്ച ഈ സൃഷ്ടി ഭാരതീയ പൈതൃകത്തിന്റെ ആധികാരികത കാത്തുസൂക്ഷിക്കുന്നു.`,
      Odia: `${input.productName}, ${input.region} ର ସମୃଦ୍ଧ ${input.craftTradition} ପରମ୍ପରାର ଏକ ଅନନ୍ୟ ଉଦାହରଣ, ଯାହାକୁ ${input.yearsOfExperience} ବର୍ଷର ଅନୁଭବ ସହିତ ${input.materials} ଦ୍ୱାରା ନିର୍ମାଣ କରାଯାଇଛି। ${input.specialTechnique} କୌଶଳରେ ନିର୍ମିତ ଏହି କଳାକୃତି ଭାରତୀୟ ହସ୍ତଶିଳ୍ପ ଐତିହ୍ୟକୁ ପ୍ରତିଫଳିତ କରେ।`,
    };

    if (LOCALIZED_STORIES[lang]) {
      return {
        story: LOCALIZED_STORIES[lang],
      };
    }

    // Template fallback — strictly fact-based, no hallucination
    return {
      story: `${input.productName} is a remarkable example of ${input.craftTradition} from ${input.region}, crafted with ${input.materials} by an artisan with ${input.yearsOfExperience} years of dedicated practice. Using the ${input.specialTechnique} technique, this piece embodies the living heritage and patient devotion that defines authentic Indian handicraft traditions. Every detail reflects the artisan's commitment to preserving cultural authenticity while creating something truly unique.`,
    };
  }
);

export const generateArtisanStory = artisanAiCraftStoryGenerator;

