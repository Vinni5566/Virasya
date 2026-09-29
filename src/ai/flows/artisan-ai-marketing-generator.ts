
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
- CRITICAL LANGUAGE RULE: Generate ALL content (Instagram caption, WhatsApp message, promo line, hashtags) strictly in {{{targetLanguage}}}. Write in the native script appropriate for {{{targetLanguage}}} (e.g. Devanagari for Hindi/Marathi, Tamil script for Tamil, Gurmukhi for Punjabi, Bengali script for Bengali, Telugu script for Telugu, etc.). All hashtags MUST be in the native language script or localized terms matching {{{targetLanguage}}}. Do NOT produce any English hashtags when targetLanguage is not English.
- Instagram caption: Max 60 words, engaging and authentic.
- WhatsApp message: Around 100 words, written as a warm, complete product introduction encouraging purchase.
- Hashtags: 8-10 relevant tags strictly written in {{{targetLanguage}}} script.
- Promo Line: A short, punchy one-liner in {{{targetLanguage}}}.

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
  Marathi: {
    instaPrefix: '✨ सादर करत आहोत',
    instaSuffix: '— भारतीय वारसा आणि हस्तकलेचा एक अप्रतिम नमुना! आता विरास्यावर उपलब्ध. 🛍️',
    waTitle: '🎨 सादर करत आहोत:',
    waBody: 'पारंपारिक कारागिरीतून साकारलेली अस्सल कलाकृती. आमच्या कुशल कारागिरांनी अत्यंत प्रेमाने आणि कौशल्याने बनवलेली.',
    waBullet1: '✅ १००% अस्सल आणि हस्तनिर्मित',
    waBullet2: '✅ थेट कारागिराकडून',
    waBullet3: '✅ योग्य व रास्त दर',
    waFooter: '🛍️ आजच विरास्या (Virasya) वरून ऑर्डर करा.\n📦 जलद डिलिव्हरी | 🔒 सुरक्षित पेमेंट',
    promo: 'भारतीय हस्तकलेचा अभिमान बाळगा —',
  },
  Gujarati: {
    instaPrefix: '✨ પ્રસ્તુત છે',
    instaSuffix: '— વારસો અને હસ્તકલાનો એક અદ્ભુત નમૂનો! હવે વિરાસ્ય પર ઉપલબ્ધ. 🛍️',
    waTitle: '🎨 પ્રસ્તુત છે:',
    waBody: 'ભારતીય હસ્તકળા અને કારીગરીની અનોખી કૃતિ. અમારા કુશળ કારીગરો દ્વારા પરંપરાગત રીતે તૈયાર કરાયેલ.',
    waBullet1: '✅ ૧૦૦% અસલ અને હાથબનાવટ',
    waBullet2: '✅ સીધા કારીગર પાસેથી',
    waBullet3: '✅ યોગ્ય અને વ્યાજબી કિંમત',
    waFooter: '🛍️ આજે જ વિરાસ્ય (Virasya) પર ઓર્ડર કરો.\n📦 ઝડપી ડિલિવરી | 🔒 સુરક્ષિત ચુકવણી',
    promo: 'ભારતની અનોખી હસ્તકલાનો ભાગ બનો —',
  },
  Telugu: {
    instaPrefix: '✨ పరిచయం చేస్తున్నాము',
    instaSuffix: '— సంస్కృతి మరియు చేతివృత్తుల అద్భుత సృష్టి! ఇప్పుడు విరాస్యలో అందుబాటులో ఉంది. 🛍️',
    waTitle: '🎨 పరిచయం:',
    waBody: 'భారతీయ సాంప్రదాయ కళా నైపుణ్యంతో రూపొందించిన అసలైన కళాఖండం. నిపుణులైన చేతివృత్తి కళాకారుల ద్వారా తయారు చేయబడింది.',
    waBullet1: '✅ 100% అసలైనది మరియు చేతితో తయారు చేయబడింది',
    waBullet2: '✅ నేరుగా కళాకారుల నుండి',
    waBullet3: '✅ న్యాయమైన ధరల హామీ',
    waFooter: '🛍️ విరాస్య (Virasya) లో ఇప్పుడే ఆర్డర్ చేయండి.\n📦 వేగవంతమైన డెలివరీ | 🔒 సురక్షితమైన చెల్లింపు',
    promo: 'భారతదేశ కళా వారసత్వాన్ని మీ సొంతం చేసుకోండి —',
  },
  Kannada: {
    instaPrefix: '✨ ಪರಿಚಯಿಸುತ್ತಿದ್ದೇವೆ',
    instaSuffix: '— ಪರಂಪರೆ ಮತ್ತು ಕರಕುಶಲತೆಯ ವಿಶಿಷ್ಟ ಕಲಾಕೃತಿ! ಈಗ ವಿರಾಸ್ಯಾದಲ್ಲಿ ಲಭ್ಯವಿದೆ. 🛍️',
    waTitle: '🎨 ಪರಿಚಯ:',
    waBody: 'ಭಾರತೀಯ ಸಾಂಪ್ರದಾಯಿಕ ಕರಕುಶಲತೆಯ ಅದ್ಭುತ ಸೃಷ್ಟಿ. ನುರಿತ ಕುಶಲಕರ್ಮಿಗಳಿಂದ ಸಾಂಪ್ರದಾಯಿಕ ಶೈಲಿಯಲ್ಲಿ ರಚಿಸಲ್ಪಟ್ಟಿದೆ.',
    waBullet1: '✅ 100% ಅಪ್ಪಟ ಮತ್ತು ಕೈಯಿಂದ ತಯಾರಿಸಿದ ಕೃತಿ',
    waBullet2: '✅ ನೇರವಾಗಿ ಕುಶಲಕರ್ಮಿಗಳಿಂದ',
    waBullet3: '✅ ನ್ಯಾಯಯುತ ಬೆಲೆ',
    waFooter: '🛍️ ವಿರಾಸ್ಯಾ (Virasya) ದಲ್ಲಿ ಇಂದೇ ಆರ್ಡರ್ ಮಾಡಿ.\n📦 ಸುರಕ್ಷಿತ ಡೆಲಿವರಿ | 🔒 ಸುರಕ್ಷಿತ ಪಾವತಿ',
    promo: 'ಭಾರತೀಯ ಕರಕುಶಲ ಪರಂಪರೆಯ ಭಾಗವಾಗಿ —',
  },
  Malayalam: {
    instaPrefix: '✨ അവതരിപ്പിക്കുന്നു',
    instaSuffix: '— പാരമ്പര്യത്തിന്റെയും കരകൗശലത്തിന്റെയും ഒരു അപൂർവ്വ സൃഷ്ടി! ഇപ്പോൾ വിരാസ്യയിൽ ലഭ്യമാണ്. 🛍️',
    waTitle: '🎨 അവതരണം:',
    waBody: 'ഇന്ത്യൻ പരമ്പരാഗത കരകൗശലവിദ്യയിൽ തീർത്ത വിശിഷ്ട കലാസൃഷ്ടി. വിദഗ്ധരായ കരകൗശല വിദഗ്ധർ തയ്യാറാക്കിയത്.',
    waBullet1: '✅ 100% യഥാർത്ഥവും കൈകൊണ്ട് നിർമ്മിച്ചതും',
    waBullet2: '✅ നേരിട്ട് കരകൗശല വിദഗ്ദ്ധരിൽ നിന്ന്',
    waBullet3: '✅ ന്യായമായ വില',
    waFooter: '🛍️ വിരാസ്യ (Virasya) വഴി ഇന്ന് തന്നെ സ്വന്തമാക്കൂ.\n📦 വേഗതയേറിയ ഡെലിവറി | 🔒 സുരക്ഷിത പേയ്‌മെന്റ്',
    promo: 'ഇന്ത്യൻ പാരമ്പര്യ കലയെ നെഞ്ചിലേറ്റൂ —',
  },
  Odia: {
    instaPrefix: '✨ ପ୍ରସ୍ତୁତ କରୁଛୁ',
    instaSuffix: '— ଐତିହ୍ୟ ଏବଂ ହସ୍ତଶିଳ୍ପର ଏକ ଅନନ୍ୟ କୃତି! ଏବେ ଭିରାସ୍ୟାରେ ଉପଲବ୍ଧ। 🛍️',
    waTitle: '🎨 ପ୍ରସ୍ତୁତି:',
    waBody: 'ଭାରତୀୟ ପାରମ୍ପରିକ କାରିଗରୀର ଏକ ଅନନ୍ୟ ଉଦାହରଣ। ଦକ୍ଷ କାରିଗରମାନଙ୍କ ଦ୍ୱାରା ପ୍ରସ୍ତୁତ।',
    waBullet1: '✅ ୧୦୦% ପ୍ରାମାଣିକ ଏବଂ ହସ୍ତନିର୍ମିତ',
    waBullet2: '✅ ସିଧାସଳଖ କାରିଗରଙ୍କଠାରୁ',
    waBullet3: '✅ ଉଚିତ ମୂଲ୍ୟ',
    waFooter: '🛍️ ଭିରାସ୍ୟା (Virasya) ରେ ଆଜି ହିଁ ଅର୍ଡର କରନ୍ତୁ।\n📦 ସୁରକ୍ଷିତ ଡେଲିଭରି | 🔒 ସୁରକ୍ଷିତ ପେମେଣ୍ଟ',
    promo: 'ଭାରତର ସମୃଦ୍ଧ ହସ୍ତକଳା ଐତିହ୍ୟର ଅଂଶ ହୁଅନ୍ତୁ —',
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
      const LOCALIZED_HASHTAGS: Record<string, string[]> = {
        Hindi: ['#विरासया', '#हस्तशिल्प', '#कारीगरी', '#हस्तनिर्मित', '#भारतीयशिल्प', '#प्रामाणिककला', '#भारतमेंनिर्मित', '#विरासतशिल्प'],
        Punjabi: ['#ਵਿਰਾਸਯਾ', '#ਹੱਥਕਲਾ', '#ਦਸਤਕਾਰੀ', '#ਹੈਂਡਮੇਡ', '#ਭਾਰਤੀਕਾਰੀਗਰ', '#ਪੰਜਾਬੀਕਲਾ', '#ਭਾਰਤਵਿੱਚਬਣਿਆ', '#ਵਿਰਾਸਤੀਕਲਾ'],
        Tamil: ['#விராஸ்யா', '#கைவினை', '#பாரம்பரியம்', '#கைவினைஞர்கள்', '#இந்தியகைவினை', '#அசல்கைவினை', '#பாரம்பரியகலை'],
        Bengali: ['#ভিরাসিয়া', '#হস্তশিল্প', '#ঐতিহ্য', '#বাংলারশিল্প', '#ভারতীয়হস্তশিল্প', '#খাঁটিশিল্প', '#ঐতিহ্যবাহীশিল্প'],
        Marathi: ['#विरास्या', '#हस्तकला', '#पारंपारिक', '#भारतीयशिल्प', '#अस्सलकला', '#भारतनिर्मित', '#वारसाशिल्प'],
        Gujarati: ['#વિરાસ્ય', '#હસ્તકલા', '#પરંપરાગત', '#કારીગરી', '#ભારતીયહસ્તકલા', '#અસલકલા', '#વારસાશિલ્પ'],
        Telugu: ['#విరాస్య', '#హస్తకళ', '#చేతివృత్తులు', '#సాంప్రదాయం', '#భారతీయకళ', '#అసలైనకళ', '#వారసత్వకళ'],
        Kannada: ['#ವಿರಾಸ್ಯಾ', '#ಕರಕುಶಲ', '#ಸಾಂಪ್ರದಾಯಿಕ', '#ಕುಶಲಕರ್ಮಿಗಳು', '#ಭಾರತೀಯಕಲೆ', '#ಅಪ್ಪಟಕಲಾವಿಭಾಗ', '#ಪರಂಪರೆ'],
        Malayalam: ['#വിരാസ്യ', '#കരകൗശലം', '#പാരമ്പര്യം', '#ഹാൻഡ്‌മെയ്ഡ്', '#ഭാരതീയകല', '#യഥാർത്ഥകല', '#പാരമ്പര്യകല'],
        Odia: ['#ଭିରାସ୍ୟା', '#ହସ୍ତଶିଳ୍ପ', '#ପାରମ୍ପରିକ', '#କାରିଗରୀ', '#ଭାରତୀୟଶିଳ୍ପ', '#ପ୍ରାମାଣିକକଳା', '#ଐତିହ୍ୟଶିଳ୍ପ'],
      };

      const tags = LOCALIZED_HASHTAGS[targetLang] || [
        '#Virasya',
        '#HandmadeInIndia',
        '#ArtisanCraft',
        `#${craftSlug}`,
        `#${regionSlug}`,
        '#AuthenticCraft',
        '#IndianArtisans',
        '#Heritage',
      ];

      return {
        instagram: `${fallback.instaPrefix} *${name}* (${craft}, ${region}) ${fallback.instaSuffix}`,
        whatsapp: `${fallback.waTitle} *${name}*\n\n${fallback.waBody} (${craft}, ${region})\n\n${fallback.waBullet1}\n${fallback.waBullet2}\n${fallback.waBullet3}\n\n${fallback.waFooter}`,
        hashtags: tags,
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
