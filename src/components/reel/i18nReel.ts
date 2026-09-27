export interface ReelI18nStrings {
  verifiedHeritage: string;
  authenticMaterials: string;
  masterArtisanLegacy: string;
  masterCraftsman: string;
  fairTradeVerified: string;
  artisanalPrice: string;
  onlyRemaining: (qty: number) => string;
  directFairTrade: string;
  supportsArtisan: (name: string) => string;
  orderHeritage: string;
  tapLinkInBio: string;
  sourcedMaterials: string;
  craftTradition: string;
  macroDetail: string;
  studioTitle: string;
  studioHeading: string;
  studioSubheading: string;
  selectHook: string;
  cinematicAtmosphere: string;
  autoMatched: string;
  readyToPost: string;
  copyCaption: string;
  copied: string;
  shareWhatsApp: string;
  copyInstagram: string;
  captionCopied: string;
  nativeShare: string;
  copyProductLink: string;
  linkCopied: string;
  audioSoundtrack: string;
  audioVoiceover: string;
  fidelityBadge: string;
}

export const REEL_I18N: Record<string, ReelI18nStrings> = {
  English: {
    verifiedHeritage: 'Verified Heritage',
    authenticMaterials: '✦ Authentic Materials & Technique',
    masterArtisanLegacy: '👨‍🎨 Master Artisan Legacy',
    masterCraftsman: 'Master Craftsman',
    fairTradeVerified: 'Fair Trade Verified',
    artisanalPrice: 'Artisanal Price',
    onlyRemaining: (qty) => `⚡ Only ${qty} Remaining`,
    directFairTrade: 'Direct Fair Trade',
    supportsArtisan: (name) => `✓ 100% directly supports ${name}`,
    orderHeritage: 'Order Authentic Heritage',
    tapLinkInBio: 'Tap Link in Bio to Order',
    sourcedMaterials: 'Handmade Sourced Materials',
    craftTradition: 'Craft Tradition',
    macroDetail: '100% DETAIL',
    studioTitle: 'Virasya AI Reel Studio',
    studioHeading: 'Dynamic Heritage Reel',
    studioSubheading: 'Multi-angle 3D gimbal camera motion, rotating Indian mandala geometry, and fair-trade story.',
    selectHook: 'Select Story Hook:',
    cinematicAtmosphere: 'Cinematic Atmosphere:',
    autoMatched: 'Auto-Matched to Craft',
    readyToPost: 'Ready-to-Post Caption & Tags',
    copyCaption: 'Copy Caption',
    copied: 'Copied!',
    shareWhatsApp: 'Share on WhatsApp',
    copyInstagram: 'Copy Instagram Reel',
    captionCopied: 'Caption Copied!',
    nativeShare: 'Native Share',
    copyProductLink: 'Copy Product Link',
    linkCopied: 'Link Copied!',
    audioSoundtrack: 'Audio Mood Soundtrack:',
    audioVoiceover: 'Storytelling Voiceover Track',
    fidelityBadge: '100% Authentic Handcraft Fidelity • Zero AI Distortion',
  },
  Hindi: {
    verifiedHeritage: 'प्रमाणित विरासत',
    authenticMaterials: '✦ प्रामाणिक सामग्री और शिल्प कौशल',
    masterArtisanLegacy: '👨‍🎨 मास्टर कारीगर विरासत',
    masterCraftsman: 'मास्टर शिल्पकार',
    fairTradeVerified: 'उचित व्यापार सत्यापित',
    artisanalPrice: 'कारीगरी मूल्य',
    onlyRemaining: (qty) => `⚡ केवल ${qty} शेष`,
    directFairTrade: 'प्रत्यक्ष निष्पक्ष व्यापार',
    supportsArtisan: (name) => `✓ 100% सीधे ${name} का समर्थन करता है`,
    orderHeritage: 'प्रामाणिक विरासत ऑर्डर करें',
    tapLinkInBio: 'ऑर्डर करने के लिए बायो में दिए गए लिंक पर टैप करें',
    sourcedMaterials: 'पारंपरिक शुद्ध सामग्री',
    craftTradition: 'हस्तशिल्प परंपरा',
    macroDetail: '100% बारीक नक्काशी',
    studioTitle: 'विरास्या एआई रील स्टूडियो',
    studioHeading: 'डायनामिक हेरिटेज रील',
    studioSubheading: '3D कैमरा मोशन, घूमता हुआ भारतीय मंडला और प्रामाणिक कारीगर की कहानी।',
    selectHook: 'कहानी का हुक चुनें:',
    cinematicAtmosphere: 'सिनेमाई वातावरण:',
    autoMatched: 'शिल्प के अनुसार चयनित',
    readyToPost: 'पोस्ट करने के लिए तैयार कैप्शन और टैग',
    copyCaption: 'कैप्शन कॉपी करें',
    copied: 'कॉपी हो गया!',
    shareWhatsApp: 'व्हाट्सएप पर शेयर करें',
    copyInstagram: 'इंस्टाग्राम रील कॉपी करें',
    captionCopied: 'कैप्शन कॉपी हो गया!',
    nativeShare: 'शेयर करें',
    copyProductLink: 'उत्पाद लिंक कॉपी करें',
    linkCopied: 'लिंक कॉपी हो गया!',
    audioSoundtrack: 'ऑडियो साउंडट्रैक:',
    audioVoiceover: 'कारीगर वॉयसओवर कहानी',
    fidelityBadge: '100% प्रामाणिक हस्तशिल्प • शून्य एआई विकृति',
  },
  Tamil: {
    verifiedHeritage: 'சான்றளிக்கப்பட்ட பாரம்பரியம்',
    authenticMaterials: '✦ உண்மையான பொருட்கள் & நுட்பம்',
    masterArtisanLegacy: '👨‍🎨 மாஸ்டர் கைவினைஞர் பாரம்பரியம்',
    masterCraftsman: 'மாஸ்டர் கைவினைஞர்',
    fairTradeVerified: 'நியாயமான வர்த்தகம் சரிபார்க்கப்பட்டது',
    artisanalPrice: 'கைவினை விலை',
    onlyRemaining: (qty) => `⚡ ${qty} மட்டுமே எஞ்சியுள்ளது`,
    directFairTrade: 'நேரடி நியாயமான வர்த்தகம்',
    supportsArtisan: (name) => `✓ 100% நேரடியாக ${name} ஐ ஆதரிக்கிறது`,
    orderHeritage: 'பாரம்பரிய கைவினைப் பொருளை ஆர்டர் செய்யுங்கள்',
    tapLinkInBio: 'ஆர்டர் செய்ய பயோ இணைப்பைத் தட்டவும்',
    sourcedMaterials: 'தூய கைவினைப் பொருட்கள்',
    craftTradition: 'கைவினை பாரம்பரியம்',
    macroDetail: '100% நுணுக்கம்',
    studioTitle: 'விராஸ்யா AI ரீல் ஸ்டுடியோ',
    studioHeading: 'டைனமிக் பாரம்பரிய ரீல்',
    studioSubheading: '3D கேமரா இயக்கம், சுழலும் மண்டலா கலை மற்றும் கைவினைஞர் கதை.',
    selectHook: 'கதை ஹூக்கைத் தேர்ந்தெடுக்கவும்:',
    cinematicAtmosphere: 'சினிமா சூழல்:',
    autoMatched: 'பொருளுக்கு ஏற்ப தேர்ந்தெடுக்கப்பட்டது',
    readyToPost: 'இடுகையிடத் தயாராக உள்ள தலைப்பு & குறிச்சொற்கள்',
    copyCaption: 'தலைப்பை நகலெடுக்கவும்',
    copied: 'நகலெடுக்கப்பட்டது!',
    shareWhatsApp: 'வாட்ஸ்அப்பில் பகிரவும்',
    copyInstagram: 'இன்ஸ்டாகிராம் ரீலை நகலெடுக்கவும்',
    captionCopied: 'தலைப்பு நகலெடுக்கப்பட்டது!',
    nativeShare: 'பகிரவும்',
    copyProductLink: 'இணைப்பை நகலெடுக்கவும்',
    linkCopied: 'இணைப்பு நகலெடுக்கப்பட்டது!',
    audioSoundtrack: 'ஆடியோ இசை:',
    audioVoiceover: 'கைவினைஞர் குரல் கதை',
    fidelityBadge: '100% உண்மையான கைவினைப் பொருள் • AI சிதைவு இல்லை',
  },
  Bengali: {
    verifiedHeritage: 'যাচাইকৃত ঐতিহ্য',
    authenticMaterials: '✦ খাঁটি উপকরণ ও নির্মাণ কৌশল',
    masterArtisanLegacy: '👨‍🎨 মাস্টার কারিগরের ঐতিহ্য',
    masterCraftsman: 'মাস্টার কারিগর',
    fairTradeVerified: 'ন্যায্য বাণিজ্য যাচাইকৃত',
    artisanalPrice: 'হস্তশিল্পের মূল্য',
    onlyRemaining: (qty) => `⚡ মাত্র ${qty}টি অবশিষ্ট`,
    directFairTrade: 'সরাসরি ন্যায্য বাণিজ্য',
    supportsArtisan: (name) => `✓ ১০০% সরাসরি ${name}-কে সহায়তা করে`,
    orderHeritage: 'খাঁটি ঐতিহ্যবাহী শিল্প অর্ডার করুন',
    tapLinkInBio: 'অর্ডার করতে বায়োতে লিঙ্কে ক্লিক করুন',
    sourcedMaterials: 'সংগৃহীত খাঁটি উপকরণ',
    craftTradition: 'ঐতিহ্যবাহী কারুকাজ',
    macroDetail: '১০০% নিখুঁত কারুকাজ',
    studioTitle: 'ভিরাসিয়া এআই রিল স্টুডিও',
    studioHeading: 'ডাইনামিক ঐতিহ্যবাহী রিল',
    studioSubheading: 'থ্রি-ডি ক্যামেরা মোশন, ঘূর্ণায়মান ভারতীয় মন্ডলা এবং কারিগরের গল্প।',
    selectHook: 'গল্পের হুক নির্বাচন করুন:',
    cinematicAtmosphere: 'সিনেমাটিক আবহাওয়া:',
    autoMatched: 'শিল্পকর্ম অনুযায়ী নির্বাচিত',
    readyToPost: 'পোস্টের জন্য প্রস্তুত ক্যাপশন ও ট্যাগ',
    copyCaption: 'ক্যাপশন কপি করুন',
    copied: 'কপি করা হয়েছে!',
    shareWhatsApp: 'হোয়াটসঅ্যাপে শেয়ার করুন',
    copyInstagram: 'ইনস্টাগ্রাম রিল কপি করুন',
    captionCopied: 'ক্যাপশন কপি করা হয়েছে!',
    nativeShare: 'শেয়ার করুন',
    copyProductLink: 'প্রোডাক্ট লিঙ্ক কপি করুন',
    linkCopied: 'লিঙ্ক কপি করা হয়েছে!',
    audioSoundtrack: 'অডিও সাউন্ডট্র্যাক:',
    audioVoiceover: 'কারিগরের ভয়েসওভার গল্প',
    fidelityBadge: '১০০% খাঁটি হস্তশিল্প • কোনো এআই বিকৃতি নেই',
  },
  Marathi: {
    verifiedHeritage: 'प्रमाणित वारसा',
    authenticMaterials: '✦ अस्सल साहित्य आणि कारागिरी',
    masterArtisanLegacy: '👨‍🎨 मास्टर कारागीर वारसा',
    masterCraftsman: 'मास्टर कारागीर',
    fairTradeVerified: 'योग्य व्यापार प्रमाणित',
    artisanalPrice: 'कारागिरी किंमत',
    onlyRemaining: (qty) => `⚡ फक्त ${qty} शिल्लक`,
    directFairTrade: 'थेट रास्त व्यापार',
    supportsArtisan: (name) => `✓ १००% थेट ${name} यांना मदत होते`,
    orderHeritage: 'अस्सल वारसा ऑर्डर करा',
    tapLinkInBio: 'ऑर्डर करण्यासाठी बायो मधील लिंकवर टॅप करा',
    sourcedMaterials: 'पारंपरिक शुद्ध साहित्य',
    craftTradition: 'हस्तकला परंपरा',
    macroDetail: '१००% बारकावे',
    studioTitle: 'विरास्या एआय रील स्टुडिओ',
    studioHeading: 'डायनॅमिक हेरिटेज रील',
    studioSubheading: '3D कॅमेरा मोशन, फिरणारे भारतीय मंडला आणि कारागिराची गोष्ट.',
    selectHook: 'स्टोरी हुक निवडा:',
    cinematicAtmosphere: 'सिनेमॅटिक वातावरण:',
    autoMatched: 'शिल्पानुसार निवडलेले',
    readyToPost: 'पोस्टसाठी तयार कॅप्शन आणि टॅग्ज',
    copyCaption: 'कॅप्शन कॉपी करा',
    copied: 'कॉपी झाले!',
    shareWhatsApp: 'व्हॉट्सॲपवर शेअर करा',
    copyInstagram: 'इन्स्टाग्राम रील कॉपी करा',
    captionCopied: 'कॅप्शन कॉपी झाले!',
    nativeShare: 'शेअर करा',
    copyProductLink: 'प्रॉडक्ट लिंक कॉपी करा',
    linkCopied: 'लिंक कॉपी झाली!',
    audioSoundtrack: 'ऑडिओ साउंडट्रॅक:',
    audioVoiceover: 'कारागीर व्हॉईसओव्हर गोष्ट',
    fidelityBadge: '१००% अस्सल हस्तकला • शून्य एआय विकृती',
  },
  Gujarati: {
    verifiedHeritage: 'પ્રમાણિત વારસો',
    authenticMaterials: '✦ અધિકૃત સામગ્રી અને કારીગરી',
    masterArtisanLegacy: '👨‍🎨 માસ્ટર કારીગર વારસો',
    masterCraftsman: 'માસ્ટર કારીગર',
    fairTradeVerified: 'વાજબી વેપાર પ્રમાણિત',
    artisanalPrice: 'કારીગરી કિંમત',
    onlyRemaining: (qty) => `⚡ માત્ર ${qty} બાકી`,
    directFairTrade: 'સીધો વાજબી વેપાર',
    supportsArtisan: (name) => `✓ 100% સીધું ${name} ને સમર્થન`,
    orderHeritage: 'અધિકૃત વારસો ઓર્ડર કરો',
    tapLinkInBio: 'ઓર્ડર કરવા માટે બાયોમાં લિંક પર ટેપ કરો',
    sourcedMaterials: 'શુદ્ધ હસ્તનિર્મિત સામગ્રી',
    craftTradition: 'હસ્તકલા પરંપરા',
    macroDetail: '100% ઝીણવટભરી નકશીકામ',
    studioTitle: 'વિરાસ્યા AI રીલ સ્ટુડિયો',
    studioHeading: 'ડાયનેમિક હેરિટેજ રીલ',
    studioSubheading: '3D કેમેરા મોશન, ફરતી ભારતીય મંડલા કલા અને વાસ્તવિક કારીગર કથા.',
    selectHook: 'સ્ટોરી હૂક પસંદ કરો:',
    cinematicAtmosphere: 'સિનેમેટિક વાતાવરણ:',
    autoMatched: 'કલા મુજબ મેળવેલ',
    readyToPost: 'પોસ્ટ માટે તૈયાર કેપ્શન અને ટેગ્સ',
    copyCaption: 'કેપ્શન કૉપિ કરો',
    copied: 'કૉપિ થઈ ગયું!',
    shareWhatsApp: 'વોટ્સએપ પર શેર કરો',
    copyInstagram: 'ઇન્સ્ટાગ્રામ રીલ કૉપિ કરો',
    captionCopied: 'કેપ્શન કૉપિ થઈ ગયું!',
    nativeShare: 'શેર કરો',
    copyProductLink: 'પ્રોડક્ટ લિંક કૉપિ કરો',
    linkCopied: 'લિંક કૉપિ થઈ ગઈ!',
    audioSoundtrack: 'ઓડિયો સાઉન્ડટ્રેક:',
    audioVoiceover: 'કારીગર વોઇસઓવર કથા',
    fidelityBadge: '100% અસલી હસ્તકલા • શૂન્ય AI વિકૃતિ',
  },
  Telugu: {
    verifiedHeritage: 'ధృవీకరించబడిన వారసత్వం',
    authenticMaterials: '✦ ప్రామాణిక పదార్థాలు & సాంకేతికత',
    masterArtisanLegacy: '👨‍🎨 మాస్టర్ కళాకారుడి వారసత్వం',
    masterCraftsman: 'మాస్టర్ కళాకారుడు',
    fairTradeVerified: 'న్యాయమైన వాణిజ్యం ధృవీకరించబడింది',
    artisanalPrice: 'హస్తకళ ధర',
    onlyRemaining: (qty) => `⚡ కేవలం ${qty} మాత్రమే మిగిలి ఉన్నాయి`,
    directFairTrade: 'ప్రత్యక్ష న్యాయమైన వ్యాపారం',
    supportsArtisan: (name) => `✓ 100% నేరుగా ${name}కి మద్దతు ఇస్తుంది`,
    orderHeritage: 'ప్రామాణిక వారసత్వాన్ని ఆర్డర్ చేయండి',
    tapLinkInBio: 'ఆర్డర్ చేయడానికి బయోలోని లింక్‌ను నొక్కండి',
    sourcedMaterials: 'సహజసిద్ధ పదార్థాలు',
    craftTradition: 'కళా సంప్రదాయం',
    macroDetail: '100% నాణ్యమైన వివరాలు',
    studioTitle: 'విరాస్య AI రీల్ స్టూడియో',
    studioHeading: 'డైనమిక్ హెరిటేజ్ రీల్',
    studioSubheading: '3D కెమెరా మోషన్, తిరిగే భారతీయ మండలా మరియు కళాకారుడి కథ.',
    selectHook: 'స్టోరీ హుక్ ఎంచుకోండి:',
    cinematicAtmosphere: 'సినిమాటిక్ వాతావరణం:',
    autoMatched: 'కళకు అనుగుణంగా ఎంపిక చేయబడింది',
    readyToPost: 'పోస్ట్ చేయడానికి సిద్ధంగా ఉన్న క్యాప్షన్ & ట్యాగ్‌లు',
    copyCaption: 'క్యాప్షన్ కాపీ చేయండి',
    copied: 'కాపీ చేయబడింది!',
    shareWhatsApp: 'వాట్సాప్‌లో షేర్ చేయండి',
    copyInstagram: 'ఇన్‌స్టాగ్రామ్ రీల్ కాపీ చేయండి',
    captionCopied: 'క్యాప్షన్ కాపీ చేయబడింది!',
    nativeShare: 'షేర్ చేయండి',
    copyProductLink: 'లింక్ కాపీ చేయండి',
    linkCopied: 'లింక్ కాపీ చేయబడింది!',
    audioSoundtrack: 'ఆడియో సంగీతం:',
    audioVoiceover: 'కళాకారుడి వాయిస్‌ఓవర్ కథ',
    fidelityBadge: '100% ప్రామాణిక హస్తకళ • AI లోపం లేదు',
  },
  Kannada: {
    verifiedHeritage: 'ದೃಢೀಕರಿಸಿದ ಪರಂಪರೆ',
    authenticMaterials: '✦ ಅಧಿಕೃತ ಸಾಮಗ್ರಿಗಳು & ತಂತ್ರಜ್ಞಾನ',
    masterArtisanLegacy: '👨‍🎨 ಮಾಸ್ಟರ್ ಕುಶಲಕರ್ಮಿ ಪರಂಪರೆ',
    masterCraftsman: 'ಮಾಸ್ಟರ್ ಕುಶಲಕರ್ಮಿ',
    fairTradeVerified: 'ನ್ಯಾಯಯುತ ವ್ಯಾಪಾರ ದೃಢೀಕರಿಸಲಾಗಿದೆ',
    artisanalPrice: 'ಕುಶಲಕರ್ಮಿ ಬೆಲೆ',
    onlyRemaining: (qty) => `⚡ ಕೇವಲ ${qty} ಮಾತ್ರ ಉಳಿದಿದೆ`,
    directFairTrade: 'ನೇರ ನ್ಯಾಯಯುತ ವ್ಯಾಪಾರ',
    supportsArtisan: (name) => `✓ 100% ನೇರವಾಗಿ ${name} ಅವರಿಗೆ ಬೆಂಬಲಿಸುತ್ತದೆ`,
    orderHeritage: 'ಅಧಿಕೃತ ಪರಂಪರೆಯನ್ನು ಆರ್ಡರ್ ಮಾಡಿ',
    tapLinkInBio: 'ಆರ್ಡರ್ ಮಾಡಲು ಬಯೋದಲ್ಲಿರುವ ಲಿಂಕ್ ಅನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ',
    sourcedMaterials: 'ಶುದ್ಧ ನೈಸರ್ಗಿಕ ಸಾಮಗ್ರಿಗಳು',
    craftTradition: 'ಕರಕುಶಲ ಪರಂಪರೆ',
    macroDetail: '100% ನಿಖರ ಕೆತ್ತನೆ',
    studioTitle: 'ವಿರಾಸ್ಯ AI ರೀಲ್ ಸ್ಟುಡಿಯೋ',
    studioHeading: 'ಡೈನಾಮಿಕ್ ಹೆರಿಟೇಜ್ ರೀಲ್',
    studioSubheading: '3D ಕ್ಯಾಮೆರಾ ಚಲನೆ, ಸುತ್ತುವ ಭಾರತೀಯ ಮಂಡಲ ಮತ್ತು ಕುಶಲಕರ್ಮಿ ಕಥೆ.',
    selectHook: 'ಸ್ಟೋರಿ ಹುಕ್ ಆಯ್ಕೆಮಾಡಿ:',
    cinematicAtmosphere: 'ಸಿನಿಮೀಯ ವಾತಾವರಣ:',
    autoMatched: 'ಕಲೆಗೆ ಅನುಗುಣವಾಗಿ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ',
    readyToPost: 'ಪೋಸ್ಟ್ ಮಾಡಲು ಸಿದ್ಧವಾಗಿರುವ ಶೀರ್ಷಿಕೆ & ಟ್ಯಾಗ್‌ಗಳು',
    copyCaption: 'ಶೀರ್ಷಿಕೆಯನ್ನು ನಕಲಿಸಿ',
    copied: 'ನಕಲಿಸಲಾಗಿದೆ!',
    shareWhatsApp: 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ',
    copyInstagram: 'ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ರೀಲ್ ನಕಲಿಸಿ',
    captionCopied: 'ಶೀರ್ಷಿಕೆ ನಕಲಿಸಲಾಗಿದೆ!',
    nativeShare: 'ಹಂಚಿಕೊಳ್ಳಿ',
    copyProductLink: 'ಉತ್ಪನ್ನ ಲಿಂಕ್ ನಕಲಿಸಿ',
    linkCopied: 'ಲಿಂಕ್ ನಕಲಿಸಲಾಗಿದೆ!',
    audioSoundtrack: 'ಆಡಿಯೋ ಸಂಗೀತ:',
    audioVoiceover: 'ಕುಶಲಕರ್ಮಿ ಧ್ವನಿ ಕಥೆ',
    fidelityBadge: '100% ಅಧಿಕೃತ ಕರಕುಶಲತೆ • ಯಾವುದೇ AI ವಿರೂಪವಿಲ್ಲ',
  },
  Malayalam: {
    verifiedHeritage: 'സാക്ഷ്യപ്പെടുത്തിയ പാരമ്പര്യം',
    authenticMaterials: '✦ യഥാർത്ഥ വസ്തുക്കളും സാങ്കേതികതയും',
    masterArtisanLegacy: '👨‍🎨 മാസ്റ്റർ കരകൗശല പാരമ്പര്യം',
    masterCraftsman: 'മാസ്റ്റർ ശില്പി',
    fairTradeVerified: 'ന്യായമായ വ്യാപാരം സ്ഥിരീകരിച്ചു',
    artisanalPrice: 'കരകൗശല വില',
    onlyRemaining: (qty) => `⚡ ${qty} എണ്ണം മാത്രം ബാക്കി`,
    directFairTrade: 'നേരിട്ടുള്ള ന്യായവ്യാപാരം',
    supportsArtisan: (name) => `✓ 100% നേരിട്ട് ${name}-നെ സഹായിക്കുന്നു`,
    orderHeritage: 'യഥാർത്ഥ പൈതൃക ഉൽപ്പന്നം ഓർഡർ ചെയ്യുക',
    tapLinkInBio: 'ഓർഡർ ചെയ്യാൻ ബയോയിലെ ലിങ്കിൽ ക്ലിക്ക് ചെയ്യുക',
    sourcedMaterials: 'ശുദ്ധമായ കരകൗശല സാമഗ്രികൾ',
    craftTradition: 'കരകൗശല പാരമ്പര്യം',
    macroDetail: '100% സൂക്ഷ്മ കൊത്തുപണി',
    studioTitle: 'വിരാസ്യ AI റീൽ സ്റ്റുഡിയോ',
    studioHeading: 'ഡൈനാമിക് ഹെറിറ്റേജ് റീൽ',
    studioSubheading: '3D ക്യാമറ ചലനം, കറങ്ങുന്ന ഇന്ത്യൻ മണ്ഡല കല, ശില്പിയുടെ കഥ.',
    selectHook: 'സ്റ്റോറി ഹുക്ക് തിരഞ്ഞെടുക്കുക:',
    cinematicAtmosphere: 'സിനിമ അന്തരീക്ഷം:',
    autoMatched: 'ഉൽപ്പന്നത്തിന് അനുയോജ്യമായത്',
    readyToPost: 'പോസ്റ്റ് ചെയ്യാൻ തയ്യാറായ അടിക്കുറിപ്പും ടാഗുകളും',
    copyCaption: 'അടിക്കുറിപ്പ് പകർത്തുക',
    copied: 'പകർത്തി!',
    shareWhatsApp: 'വാട്ട്‌സ്ആപ്പിൽ പങ്കിടുക',
    copyInstagram: 'ഇൻസ്റ്റാഗ്രാം റീൽ പകർത്തുക',
    captionCopied: 'അടിക്കുറിപ്പ് പകർത്തി!',
    nativeShare: 'പങ്കുവെക്കുക',
    copyProductLink: 'ഉൽപ്പന്ന ലിങ്ക് പകർത്തുക',
    linkCopied: 'ലിങ്ക് പകർത്തി!',
    audioSoundtrack: 'ഓഡിയോ സംഗീതം:',
    audioVoiceover: 'ശില്പിയുടെ വോയ്‌സ്ഓവർ കഥ',
    fidelityBadge: '100% യഥാർത്ഥ കരകൗശലം • AI കൃത്രിമത്വമില്ല',
  },
  Punjabi: {
    verifiedHeritage: 'ਪ੍ਰਮਾਣਿਤ ਵਿਰਾਸਤ',
    authenticMaterials: '✦ ਪ੍ਰਮਾਣਿਕ ਸਮੱਗਰੀ ਅਤੇ ਸ਼ਿਲਪਕਾਰੀ',
    masterArtisanLegacy: '👨‍🎨 ਮਾਸਟਰ ਕਾਰੀਗਰ ਵਿਰਾਸਤ',
    masterCraftsman: 'ਮਾਸਟਰ ਕਾਰੀਗਰ',
    fairTradeVerified: 'ਨਿਰਪੱਖ ਵਪਾਰ ਪ੍ਰਮਾਣਿਤ',
    artisanalPrice: 'ਕਾਰੀਗਰੀ ਮੁੱਲ',
    onlyRemaining: (qty) => `⚡ ਸਿਰਫ਼ ${qty} ਬਾਕੀ`,
    directFairTrade: 'ਸਿੱਧਾ ਨਿਰਪੱਖ ਵਪਾਰ',
    supportsArtisan: (name) => `✓ 100% ਸਿੱਧਾ ${name} ਦਾ ਸਮਰਥਨ ਕਰਦਾ ਹੈ`,
    orderHeritage: 'ਪ੍ਰਮਾਣਿਕ ਵਿਰਾਸਤ ਆਰਡਰ ਕਰੋ',
    tapLinkInBio: 'ਆਰਡਰ ਕਰਨ ਲਈ ਬਾਇਓ ਵਿੱਚ ਲਿੰਕ ਤੇ ਕਲਿੱਕ ਕਰੋ',
    sourcedMaterials: 'ਸ਼ੁੱਧ ਹੱਥੀਂ ਤਿਆਰ ਸਮੱਗਰੀ',
    craftTradition: 'ਦਸਤਕਾਰੀ ਪਰੰਪਰਾ',
    macroDetail: '100% ਬਾਰੀਕ ਨੱਕਾਸ਼ੀ',
    studioTitle: 'ਵਿਰਾਸਿਆ AI ਰੀਲ ਸਟੂਡੀਓ',
    studioHeading: 'ਡਾਇਨਾਮਿਕ ਹੈਰੀਟੇਜ ਰੀਲ',
    studioSubheading: '3D ਕੈਮਰਾ ਮੋਸ਼ਨ, ਘੁੰਮਦਾ ਭਾਰਤੀ ਮੰਡਲਾ ਅਤੇ ਸੱਚੇ ਕਾਰੀਗਰ ਦੀ ਕਹਾਣੀ।',
    selectHook: 'ਸਟੋਰੀ ਹੁੱਕ ਚੁਣੋ:',
    cinematicAtmosphere: 'ਸਿਨੇਮੈਟਿਕ ਮਾਹੌਲ:',
    autoMatched: 'ਕਲਾ ਅਨੁਸਾਰ ਚੁਣਿਆ ਗਿਆ',
    readyToPost: 'ਪੋਸਟ ਲਈ ਤਿਆਰ ਕੈਪਸ਼ਨ ਅਤੇ ਟੈਗਸ',
    copyCaption: 'ਕੈਪਸ਼ਨ ਕਾਪੀ ਕਰੋ',
    copied: 'ਕਾਪੀ ਹੋ ਗਿਆ!',
    shareWhatsApp: 'ਵਟਸਐਪ ਤੇ ਸ਼ੇਅਰ ਕਰੋ',
    copyInstagram: 'ਇੰਸਟਾਗ੍ਰਾਮ ਰੀਲ ਕਾਪੀ ਕਰੋ',
    captionCopied: 'ਕੈਪਸ਼ਨ ਕਾਪੀ ਹੋ ਗਿਆ!',
    nativeShare: 'ਸ਼ੇਅਰ ਕਰੋ',
    copyProductLink: 'ਉਤਪਾਦ ਲਿੰਕ ਕਾਪੀ ਕਰੋ',
    linkCopied: 'ਲਿੰਕ ਕਾਪੀ ਹੋ ਗਿਆ!',
    audioSoundtrack: 'ਆਡੀਓ ਸਾਊਂਡਟਰੈਕ:',
    audioVoiceover: 'ਕਾਰੀਗਰ ਵਾਇਸਓਵਰ ਕਹਾਣੀ',
    fidelityBadge: '100% ਪ੍ਰਮਾਣਿਕ ਹਸਤਕਲਾ • ਜ਼ੀਰੋ AI ਵਿਗਾੜ',
  },
};

export function getReelI18n(lang?: string): ReelI18nStrings {
  if (!lang) return REEL_I18N.English;
  return REEL_I18N[lang] || REEL_I18N.English;
}

export function generateLocalizedReelHooks(params: {
  productName: string;
  artisanName?: string;
  craftType: string;
  region: string;
  materials?: string;
  language?: string;
}): { id: string; title: string; subtext: string }[] {
  const lang = params.language || 'English';
  const craft = params.craftType || 'Handcrafted Heritage';
  const region = params.region || 'India';
  const maker = params.artisanName || 'Master Artisan';
  const mat = params.materials || 'Pure Materials';

  if (lang === 'Hindi') {
    return [
      {
        id: 'heritage-secret',
        title: `${region} की 100 वर्ष पुरानी विरासत`,
        subtext: `मास्टर कारीगर ${maker} द्वारा शुद्ध निष्ठा से हस्तनिर्मित`,
      },
      {
        id: 'slow-craft',
        title: `40+ घंटों की शुद्ध हस्तकला`,
        subtext: `100% प्रामाणिक ${craft} - बिना किसी मशीनी शॉर्टकट के`,
      },
      {
        id: 'direct-maker',
        title: `सीधे मास्टर कारीगर ${maker} से`,
        subtext: `सत्यापित निष्पक्ष व्यापार द्वारा असली कारीगरों का सशक्तिकरण`,
      },
      {
        id: 'rare-find',
        title: `एक दुर्लभ जीवित सांस्कृतिक धरोहर`,
        subtext: `प्रामाणिक ${mat} से हस्तनिर्मित उत्कृष्ट कृति`,
      },
    ];
  }

  if (lang === 'Tamil') {
    return [
      {
        id: 'heritage-secret',
        title: `${region} இன் 100 ஆண்டுகால பாரம்பரியம்`,
        subtext: `மாஸ்டர் கைவினைஞர் ${maker} அவர்களால் கைவினை செய்யப்பட்டது`,
      },
      {
        id: 'slow-craft',
        title: `40+ மணிநேர உழைப்பில் உருவான கலை`,
        subtext: `100% உண்மையான ${craft} - இயந்திர குறுக்குവഴிகள் இல்லை`,
      },
      {
        id: 'direct-maker',
        title: `நேரடியாக மாஸ்டர் கைவினைஞர் ${maker} இடம் இருந்து`,
        subtext: `நேரடி நியாயமான வர்த்தக ஆதரவு`,
      },
      {
        id: 'rare-find',
        title: `அரிய வாழும் கலாச்சார பொக்கிஷம்`,
        subtext: `தூய ${mat} மூலம் கைவினை செய்யப்பட்டது`,
      },
    ];
  }

  if (lang === 'Bengali') {
    return [
      {
        id: 'heritage-secret',
        title: `${region}-এর ১০০ বছরের ঐতিহ্য`,
        subtext: `মাস্টার কারিগর ${maker} দ্বারা পরম শ্রদ্ধায় তৈরি`,
      },
      {
        id: 'slow-craft',
        title: `৪০+ ঘণ্টার নিপুণ হস্তশিল্প`,
        subtext: `১০০% খাঁটি ${craft} - কোনো যন্ত্রের সাহায্য ছাড়া`,
      },
      {
        id: 'direct-maker',
        title: `সরাসরি মাস্টার কারিগর ${maker}-এর কাছ থেকে`,
        subtext: `ন্যায্য বাণিজ্যের মাধ্যমে কারিগরদের ক্ষমতায়ন`,
      },
      {
        id: 'rare-find',
        title: `একটি বিরল জীবন্ত সাংস্কৃতিক নিদর্শন`,
        subtext: `খাঁটি ${mat} দিয়ে পরম যত্নে নির্মিত`,
      },
    ];
  }

  if (lang === 'Marathi') {
    return [
      {
        id: 'heritage-secret',
        title: `${region} चा १०० वर्षांचा ऐतिहासिक वारसा`,
        subtext: `मास्टर कारागीर ${maker} यांच्याकडून निष्ठेने घडवलेले`,
      },
      {
        id: 'slow-craft',
        title: `४०+ तासांची अस्सल कारागिरी`,
        subtext: `१००% अस्सल ${craft} - कोणत्याही मशीनशिवाय`,
      },
      {
        id: 'direct-maker',
        title: `थेट मास्टर कारागीर ${maker} यांच्याकडून`,
        subtext: `योग्य व्यापाराद्वारे कारागिरांना थेट मदत`,
      },
      {
        id: 'rare-find',
        title: `एक दुर्मिळ जिवंत सांस्कृतिक वारसा`,
        subtext: `अस्सल ${mat} पासून प्रेमाने हस्तनिर्मित`,
      },
    ];
  }

  if (lang === 'Gujarati') {
    return [
      {
        id: 'heritage-secret',
        title: `${region} નો ૧૦૦ વર્ષ જૂનો વારસો`,
        subtext: `માસ્ટર કારીગર ${maker} દ્વારા શુદ્ધ સમર્પણથી બનાવેલ`,
      },
      {
        id: 'slow-craft',
        title: `૪૦+ કલાકની અસલી હસ્તકલા`,
        subtext: `૧૦૦% અસલી ${craft} - કોઈ મશીન વગર`,
      },
      {
        id: 'direct-maker',
        title: `સીધા માસ્ટર કારીગર ${maker} પાસેથી`,
        subtext: `પ્રમાણિત વાજબી વેપાર દ્વારા કારીગરોનું સશક્તિકરણ`,
      },
      {
        id: 'rare-find',
        title: `એક દુર્લભ જીવંત સાંસ્કૃતિક ધરોહર`,
        subtext: `અધિકૃત ${mat} થી સંપૂર્ણ હાથથી બનાવેલ`,
      },
    ];
  }

  if (lang === 'Telugu') {
    return [
      {
        id: 'heritage-secret',
        title: `${region} యొక్క 100 సంవత్సరాల వారసత్వం`,
        subtext: `మాస్టర్ కళాకారుడు ${maker} ద్వారా తయారు చేయబడింది`,
      },
      {
        id: 'slow-craft',
        title: `40+ గంటల శ్రమతో రూపొందిన కళ`,
        subtext: `100% ప్రామాణికమైన ${craft} - యంత్రాల సహాయం లేకుండా`,
      },
      {
        id: 'direct-maker',
        title: `నేరుగా మాస్టర్ కళాకారుడు ${maker} నుండి`,
        subtext: `ధృవీకరించబడిన న్యాయమైన వాణిజ్య మద్దతు`,
      },
      {
        id: 'rare-find',
        title: `అరుదైన సజీవ సాంస్కృతిక అద్భుతం`,
        subtext: `సహజసిద్ధ ${mat}తో తయారు చేయబడింది`,
      },
    ];
  }

  if (lang === 'Kannada') {
    return [
      {
        id: 'heritage-secret',
        title: `${region} ನ 100 ವರ್ಷಗಳ ಪರಂಪರೆ`,
        subtext: `ಮಾಸ್ಟರ್ ಕುಶಲಕರ್ಮಿ ${maker} ಅವರಿಂದ ಪ್ರೀತಿಯಿಂದ ರಚಿತ`,
      },
      {
        id: 'slow-craft',
        title: `40+ ಗಂಟೆಗಳ ನೈಜ ಕರಕುಶಲತೆ`,
        subtext: `100% ಅಧಿಕೃತ ${craft} - ಯಾವುದೇ ಯಂತ್ರದ ಶಾರ್ಟ್‌ಕಟ್ ಇಲ್ಲದೆ`,
      },
      {
        id: 'direct-maker',
        title: `ನೇರವಾಗಿ ಮಾಸ್ಟರ್ ಕುಶಲಕರ್ಮಿ ${maker} ಅವರಿಂದ`,
        subtext: `ನ್ಯಾಯಯುತ ವ್ಯಾಪಾರದ ಮೂಲಕ ಕುಶಲಕರ್ಮಿಗಳ ಸಬಲೀಕರಣ`,
      },
      {
        id: 'rare-find',
        title: `ಒಂದು ಅಪರೂಪದ ಜೀವಂತ ಸಾಂಸ್ಕೃತಿಕ ಪರಂಪರೆ`,
        subtext: `ಅಧಿಕೃತ ${mat} ಬಳಸಿ ತಯಾರಿಸಿದ ಶ್ರೇಷ್ಠ ಕಲಾಕೃತಿ`,
      },
    ];
  }

  if (lang === 'Malayalam') {
    return [
      {
        id: 'heritage-secret',
        title: `${region} ലെ 100 വർഷത്തെ പാരമ്പര്യം`,
        subtext: `മാസ്റ്റർ ശില്പി ${maker} സ്നേഹത്തോടെ നിർമ്മിച്ചത്`,
      },
      {
        id: 'slow-craft',
        title: `40+ മണിക്കൂർ എടുത്ത കരകൗശലം`,
        subtext: `100% യഥാർത്ഥ ${craft} - മെഷീൻ സഹായമില്ലാതെ`,
      },
      {
        id: 'direct-maker',
        title: `നേരിട്ട് മാസ്റ്റർ ശില്പി ${maker} ൽ നിന്ന്`,
        subtext: `ന്യായമായ വ്യാപാരത്തിലൂടെ ശില്പികൾക്ക് പിന്തുണ`,
      },
      {
        id: 'rare-find',
        title: `ഒരു അപൂർവ്വ ജീവസ്സുറ്റ സാംസ്കാരിക പൈതൃകം`,
        subtext: `ശുദ്ധമായ ${mat} ഉപയോഗിച്ച് കൈകൊണ്ട് നിർമ്മിച്ചത്`,
      },
    ];
  }

  if (lang === 'Punjabi') {
    return [
      {
        id: 'heritage-secret',
        title: `${region} ਦੀ 100 ਸਾਲ ਪੁਰਾਣੀ ਵਿਰਾਸਤ`,
        subtext: `ਮਾਸਟਰ ਕਾਰੀਗਰ ${maker} ਦੁਆਰਾ ਸੱਚੇ ਦਿਲ ਨਾਲ ਤਿਆਰ`,
      },
      {
        id: 'slow-craft',
        title: `40+ ਘੰਟਿਆਂ ਦੀ ਸ਼ੁੱਧ ਦਸਤਕਾਰੀ`,
        subtext: `100% ਪ੍ਰਮਾਣਿਕ ${craft} - ਬਿਨਾਂ ਕਿਸੇ ਮਸ਼ੀਨੀ ਸ਼ਾਰਟਕੱਟ ਦੇ`,
      },
      {
        id: 'direct-maker',
        title: `ਸਿੱਧਾ ਮਾਸਟਰ ਕਾਰੀਗਰ ${maker} ਕੋਲੋਂ`,
        subtext: `ਨਿਰਪੱਖ ਵਪਾਰ ਰਾਹੀਂ ਕਾਰੀਗਰਾਂ ਨੂੰ ਸਮਰੱਥ ਬਣਾਉਣਾ`,
      },
      {
        id: 'rare-find',
        title: `ਇੱਕ ਦੁਰਲੱਭ ਜਿਊਂਦੀ-ਜਾਗਦੀ ਸੱਭਿਆਚਾਰਕ ਧਰੋਹਰ`,
        subtext: `ਅਸਲੀ ${mat} ਤੋਂ ਹੱਥੀਂ ਤਿਆਰ ਕੀਤਾ ਗਿਆ ਮਾਸਟਰਪੀਸ`,
      },
    ];
  }

  // Default English
  return [
    {
      id: 'heritage-secret',
      title: `The 100-Year Heritage of ${region}`,
      subtext: `Handmade with pure devotion by ${maker}`,
    },
    {
      id: 'slow-craft',
      title: `40+ Hours of Master Handcrafting`,
      subtext: `100% authentic ${craft} with zero machine shortcuts`,
    },
    {
      id: 'direct-maker',
      title: `Direct from Master Artisan ${maker}`,
      subtext: `Empowering real artisans through verified fair trade`,
    },
    {
      id: 'rare-find',
      title: `A Rare Living Heritage Masterpiece`,
      subtext: `Handcrafted from genuine ${mat}`,
    },
  ];
}
