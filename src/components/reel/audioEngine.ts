// Audio Engine for Virasya Reel Studio: Procedural Indian Heritage Soundscapes & Studio-Grade AI Voiceover
// Features: Gemini Studio Voiceovers (WAV PCM), Natural Human Multilingual Documentary Narration, Dynamic Music Ducking, Zero-Latency Promise-Deduplicated Audio Cache

export interface AudioEngineState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number; // 0.0 to 1.0
  trackId: string;
  enableVoiceover: boolean;
  language: string;
  voiceName: string;
}

export interface ReelAudioData {
  productName: string;
  artisanName?: string;
  craftType?: string;
  region?: string;
  materials?: string;
  price?: number;
  story?: string;
  hookTitle?: string;
  language?: string;
  voiceoverAudioBase64?: string;
  voiceoverScript?: string;
}

// IndexedDB persistent audio cache helpers for unlimited storage across reloads
const IDB_NAME = 'virasya_reel_audio_db';
const IDB_STORE = 'tts_voiceover_cache';

function getIDBDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function getStoredAudioBase64(key: string): Promise<string | null> {
  try {
    const db = await getIDBDatabase();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as string) || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function setStoredAudioBase64(key: string, base64Data: string): Promise<void> {
  try {
    const db = await getIDBDatabase();
    if (!db) return;
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.put(base64Data, key);
  } catch {}
}

// Helpers to clean raw titles and format material lists into natural human prose
function cleanProductTitle(title: string): string {
  if (!title) return 'Handcrafted Masterpiece';
  return title
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/-\s*pack of \d+/gi, '')
    .replace(/-\s*set of \d+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatMaterialsSpoken(materials?: string, lang: string = 'English'): string {
  if (!materials) return '';
  const items = materials
    .split(/[,;&+]/)
    .map((m) => m.trim().toLowerCase())
    .filter((m) => m.length > 0 && m !== 'handicraft' && m !== 'handmade');

  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (lang === 'Hindi') {
    return items.join(' और ');
  }
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function decodeRawPCMToAudioBuffer(ctx: AudioContext, bytes: Uint8Array, sampleRate = 24000): AudioBuffer {
  // If bytes contain a WAV header (RIFF), strip the 44-byte header
  let offset = 0;
  if (bytes.length > 44 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    offset = 44;
  }
  const pcmBytes = bytes.subarray(offset);
  const numSamples = Math.floor(pcmBytes.byteLength / 2);
  const int16Array = new Int16Array(pcmBytes.buffer, pcmBytes.byteOffset, numSamples);
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < numSamples; i++) {
    channel[i] = int16Array[i] / 32768.0;
  }
  return buffer;
}

// Preload and cache browser voices as soon as module loads so natural voices are ready immediately
let cachedBrowserVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedBrowserVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    try {
      cachedBrowserVoices = window.speechSynthesis.getVoices();
    } catch {}
  };
}

class ReelAudioEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private voiceoverGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private voiceoverSource: AudioBufferSourceNode | null = null;
  private activeOscillators: (OscillatorNode | AudioBufferSourceNode)[] = [];
  private loopTimer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private currentTrackId = 'royal-sitar';
  private isMuted = false;
  private volume = 0.85;
  private enableVoiceover = true;
  private language = 'English';
  private voiceName = 'Charon'; // 'Charon' (Deep, Calm, Soothing Male Documentary Narrator)
  private voiceDuckRatio = 0.18; // Music volume drops smoothly while narrator speaks
  private cachedReelData: ReelAudioData | null = null;
  private audioBufferCache: Map<string, AudioBuffer> = new Map();
  private pendingFetches: Map<string, Promise<AudioBuffer | null>> = new Map();
  private aiScriptCache: Map<string, string> = new Map();
  private duckTimer: NodeJS.Timeout | null = null;
  private speechTimer: NodeJS.Timeout | null = null;
  private currentSpeechSession = 0;
  public onAudioReady?: () => void;

  constructor() {}

  public initAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock() {
    const ctx = this.initAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  public getAudioStreamDestination(): MediaStream | null {
    if (!this.ctx || !this.masterGain) return null;
    try {
      const streamDest = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(streamDest);
      return streamDest.stream;
    } catch {
      return null;
    }
  }

  public setConfig(options: {
    trackId?: string;
    isMuted?: boolean;
    volume?: number;
    enableVoiceover?: boolean;
    language?: string;
    voiceName?: string;
  }) {
    if (options.trackId !== undefined && options.trackId !== this.currentTrackId) {
      this.currentTrackId = options.trackId;
      if (this.isRunning) {
        this.restartSoundtrack();
      }
    }
    if (options.isMuted !== undefined) {
      this.isMuted = options.isMuted;
      this.applyVolumes();
    }
    if (options.volume !== undefined) {
      this.volume = options.volume;
      this.applyVolumes();
    }
    if (options.language !== undefined && options.language !== this.language) {
      this.language = options.language;
      if (this.isRunning && this.cachedReelData) {
        this.scheduleNarrations(this.cachedReelData);
      }
    }
    if (options.voiceName !== undefined && options.voiceName !== this.voiceName) {
      this.voiceName = options.voiceName;
      if (this.isRunning && this.cachedReelData) {
        this.scheduleNarrations(this.cachedReelData);
      }
    }
    if (options.enableVoiceover !== undefined) {
      this.enableVoiceover = options.enableVoiceover;
      if (!this.enableVoiceover) {
        this.stopSpeech();
      } else if (this.isRunning && this.cachedReelData) {
        this.scheduleNarrations(this.cachedReelData);
      }
    }
  }

  /**
   * Restarts the background soundtrack seamlessly without crashing or affecting voiceover
   */
  private restartSoundtrack() {
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];
    if (this.ctx && this.musicGain && this.isRunning) {
      this.startTrack(this.currentTrackId, this.ctx.currentTime);
    }
  }

  public getVoiceName(): string {
    return this.voiceName;
  }

  private applyVolumes(ducking = false) {
    if (!this.masterGain || !this.musicGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    const targetMaster = this.isMuted ? 0 : this.volume;
    const targetMusic = ducking ? this.voiceDuckRatio : 1.0;

    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(targetMaster, now + 0.15);

    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.linearRampToValueAtTime(targetMusic, now + 0.25);
  }

  /**
   * Loads and decodes voiceover directly from base64 string stored in DB / document
   */
  public async loadDirectVoiceover(audioBase64: string, script?: string, language?: string): Promise<AudioBuffer | null> {
    if (!audioBase64 || typeof window === 'undefined') return null;
    const lang = language || this.language || 'English';
    const voice = this.voiceName || 'Charon';
    const cacheKey = script ? `${voice}_${lang}_${script}` : `direct_${lang}_${audioBase64.slice(0, 32)}`;

    if (this.audioBufferCache.has(cacheKey)) {
      return this.audioBufferCache.get(cacheKey)!;
    }

    try {
      const binaryString = window.atob(audioBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const ctx = this.initAudioContext();
      if (ctx) {
        let audioBuffer: AudioBuffer;
        try {
          audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
        } catch {
          audioBuffer = decodeRawPCMToAudioBuffer(ctx, bytes, 22050);
        }
        this.audioBufferCache.set(cacheKey, audioBuffer);
        if (script) {
          setStoredAudioBase64(cacheKey, audioBase64);
        }
        return audioBuffer;
      }
    } catch (err) {
      console.warn('loadDirectVoiceover decoding note:', err);
    }
    return null;
  }

  /**
   * Pre-fetches, resolves, and decodes the voiceover audio buffer so it is 100% ready before playback starts
   */
  public async prepareVoiceover(reelData: ReelAudioData): Promise<AudioBuffer | null> {
    if (!reelData || !this.enableVoiceover) return null;
    const lang = reelData.language || this.language || 'English';

    // 1. Direct Base64 from DB
    if (reelData.voiceoverAudioBase64) {
      const buffer = await this.loadDirectVoiceover(reelData.voiceoverAudioBase64, reelData.voiceoverScript, lang);
      if (buffer) return buffer;
    }

    // 2. Resolve script
    const script = reelData.voiceoverScript || (await this.resolveNarrationScript(reelData));
    const voice = this.voiceName || 'Charon';

    // 3. Fetch/decode TTS buffer
    const buffer = await this.fetchTTSAudioBuffer(script, voice, lang);
    return buffer;
  }

  /**
   * Start playing background soundtrack & voiceover narration in perfect synchronized lockstep
   */
  public async start(reelData?: ReelAudioData) {
    this.stop();
    if (reelData) {
      this.cachedReelData = reelData;
      if (reelData.language) this.language = reelData.language;
    }

    const ctx = this.initAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

    this.isRunning = true;

    // Master audio graph
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, ctx.currentTime);
    this.masterGain.connect(ctx.destination);

    // Initial music gain
    this.musicGain = ctx.createGain();
    this.musicGain.gain.setValueAtTime(1.0, ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.voiceoverGain = ctx.createGain();
    this.voiceoverGain.gain.setValueAtTime(1.30, ctx.currentTime);
    this.voiceoverGain.connect(this.masterGain);

    const startTime = ctx.currentTime;

    // 1. Check if voiceover buffer is ready
    let targetBuffer: AudioBuffer | null = null;
    let targetScript = '';

    if (this.enableVoiceover && this.cachedReelData) {
      const lang = this.cachedReelData.language || this.language || 'English';
      const voice = this.voiceName || 'Charon';
      targetScript = this.cachedReelData.voiceoverScript || (await this.resolveNarrationScript(this.cachedReelData));
      const cacheKey = `${voice}_${lang}_${targetScript}`;

      if (this.cachedReelData.voiceoverAudioBase64) {
        targetBuffer = await this.loadDirectVoiceover(
          this.cachedReelData.voiceoverAudioBase64,
          this.cachedReelData.voiceoverScript,
          lang
        );
      }

      if (!targetBuffer && this.audioBufferCache.has(cacheKey)) {
        targetBuffer = this.audioBufferCache.get(cacheKey)!;
      }

      if (!targetBuffer) {
        targetBuffer = await this.fetchTTSAudioBuffer(targetScript, voice, lang);
      }
    }

    // 2. START SOUNDTRACK & VOICEOVER AT THE EXACT SAME TIMESTAMP
    this.startTrack(this.currentTrackId, startTime);

    if (this.enableVoiceover && this.cachedReelData) {
      if (targetBuffer) {
        this.playStudioAudioBuffer(targetBuffer, startTime);
      } else if (targetScript) {
        this.speakWebSpeechFallback(targetScript, this.language);
      }
    }

    if (this.onAudioReady) {
      this.onAudioReady();
    }
  }

  /**
   * Pre-fetches and decodes the voiceover audio for a product/hook in advance
   */
  public async prefetchVoiceover(reelData: ReelAudioData) {
    if (!reelData) return;
    if (reelData.voiceoverAudioBase64) {
      await this.loadDirectVoiceover(reelData.voiceoverAudioBase64, reelData.voiceoverScript, reelData.language || this.language);
      return;
    }
    const script = await this.resolveNarrationScript(reelData);
    await this.fetchTTSAudioBuffer(script, this.voiceName, this.language);
  }

  /**
   * Resolves the highest fidelity AI-generated or structured documentary script
   */
  public async resolveNarrationScript(reelData: ReelAudioData): Promise<string> {
    const lang = reelData.language || this.language || 'English';
    const cacheKey = `${lang}_${reelData.productName}_${reelData.craftType || ''}_${reelData.materials || ''}_${reelData.region || ''}_${reelData.hookTitle || ''}`.toLowerCase();

    if (this.aiScriptCache.has(cacheKey)) {
      return this.aiScriptCache.get(cacheKey)!;
    }

    // Try AI Script generation endpoint with fast timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch('/api/generate-reel-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: reelData.productName,
          craftType: reelData.craftType,
          materials: reelData.materials,
          region: reelData.region,
          artisanName: reelData.artisanName,
          story: reelData.story,
          language: lang,
          hookTitle: reelData.hookTitle,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.script && json.script.trim().length > 15) {
          const aiScript = json.script.trim();
          this.aiScriptCache.set(cacheKey, aiScript);
          return aiScript;
        }
      }
    } catch {}

    // Fallback to beautifully polished, zero-repetition rule engine
    const fallbackScript = this.buildNarrationScript(reelData);
    this.aiScriptCache.set(cacheKey, fallbackScript);
    return fallbackScript;
  }

  /**
   * Called when Remotion Player loops back to frame 0
   */
  public handleVideoLoop() {
    if (this.isRunning && this.cachedReelData) {
      this.stopSpeech();
      this.restartSoundtrack();
      if (this.enableVoiceover) {
        this.scheduleNarrations(this.cachedReelData);
      }
    }
  }

  public stop() {
    this.isRunning = false;
    this.stopSpeech();

    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }

    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];

    if (this.ctx && this.musicGain) {
      try {
        this.musicGain.disconnect();
      } catch {}
      this.musicGain = null;
    }
  }

  public pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
      } catch {}
    }
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch {}
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private stopSpeech() {
    this.currentSpeechSession++;
    if (this.duckTimer) {
      clearTimeout(this.duckTimer);
      this.duckTimer = null;
    }
    if (this.speechTimer) {
      clearTimeout(this.speechTimer);
      this.speechTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    if (this.voiceoverSource) {
      try {
        this.voiceoverSource.stop();
        this.voiceoverSource.disconnect();
      } catch {}
      this.voiceoverSource = null;
    }
    this.applyVolumes(false);
  }

  // =========================================================================
  // MULTILINGUAL HERITAGE NARRATION BUILDER (STRICT ZERO-REPETITION)
  // =========================================================================

  public buildNarrationScript(reelData: ReelAudioData): string {
    const product = cleanProductTitle(reelData.productName);
    const region = reelData.region?.trim();
    const spokenMaterials = formatMaterialsSpoken(reelData.materials, this.language);
    const rawArtisan = reelData.artisanName?.trim();
    const hasArtisan = Boolean(
      rawArtisan &&
      !rawArtisan.toLowerCase().includes('master craftsman') &&
      rawArtisan.toLowerCase() !== 'unknown'
    );
    const artisan = rawArtisan;
    const rawHook = reelData.hookTitle?.trim();
    const hook = rawHook && rawHook.length > 0 ? rawHook : null;
    const lang = this.language || 'English';

    if (lang === 'Hindi') {
      const parts: string[] = [];
      if (region) {
        parts.push(`${region} की समृद्ध परंपरा से, प्रस्तुत है ${product}।`);
      } else if (hook) {
        parts.push(`${hook}। प्रस्तुत है ${product}।`);
      } else {
        parts.push(`प्रस्तुत है ${product}।`);
      }

      if (spokenMaterials) {
        parts.push(`${spokenMaterials} से निर्मित, इसका प्रत्येक पहलू कलात्मक उत्कृष्टता दर्शाता है।`);
      }

      parts.push(`भारतीय सांस्कृतिक धरोहर और पारंपरिक कला का एक अनुपम प्रतीक।`);
      return parts.join(' ');
    }

    if (lang === 'Tamil') {
      const parts: string[] = [];
      if (region) {
        parts.push(`${region} பகுதியின் பாரம்பரியத்தில் உருவான ${product}.`);
      } else {
        parts.push(`அறிமுகமாகிறது ${product}.`);
      }
      if (spokenMaterials) {
        parts.push(`${spokenMaterials} கொண்டு உருவாக்கப்பட்ட இந்த படைப்பு சிறந்த நுட்பத்தை வெளிப்படுத்துகிறது.`);
      }
      parts.push(`பாரம்பரிய கலை நயத்தின் அழகிய அடையாளம்.`);
      return parts.join(' ');
    }

    if (lang === 'Bengali') {
      const parts: string[] = [];
      if (region) {
        parts.push(`${region}-এর ঐতিহ্য থেকে নিবেদন ${product}।`);
      } else {
        parts.push(`নিবেদন ${product}।`);
      }
      if (spokenMaterials) {
        parts.push(`${spokenMaterials} দিয়ে যত্ন সহকারে নির্মিত।`);
      }
      parts.push(`ভারতীয় শিল্পের এক অনন্য নিদর্শন ও ঐতিহ্যবাহী সৃষ্টি।`);
      return parts.join(' ');
    }

    if (lang === 'Marathi') {
      const parts: string[] = [];
      if (region) {
        parts.push(`${region} च्या समृद्ध परंपरेतून सादर आहे ${product}।`);
      } else {
        parts.push(`सादर आहे ${product}।`);
      }
      if (spokenMaterials) {
        parts.push(`${spokenMaterials} ने साकारलेली ही कलाकृती अत्यंत देखणी आहे।`);
      }
      parts.push(`भारतीय संस्कृती आणि समृद्ध परंपरेचा एक सुंदर वारसा।`);
      return parts.join(' ');
    }

    if (lang === 'Gujarati') {
      const parts: string[] = [];
      if (region) {
        parts.push(`${region} ની સમૃદ્ધ વિરાસતમાંથી પ્રસ્તુત છે ${product}।`);
      } else {
        parts.push(`પ્રસ્તુત છે ${product}।`);
      }
      if (spokenMaterials) {
        parts.push(`${spokenMaterials} માંથી તૈયાર કરેલી આ સુંદર કૃતિ છે।`);
      }
      parts.push(`ભારતીય સંસ્કૃતિ અને પ્રાચીન વારસાની અનોખી પહેચાન।`);
      return parts.join(' ');
    }

    if (lang === 'Telugu') {
      const parts: string[] = [];
      if (region) {
        parts.push(`${region} కళా సంస్కృతి నుండి, ${product}.`);
      } else {
        parts.push(`ప్రత్యేకంగా మీ కోసం, ${product}.`);
      }
      if (spokenMaterials) {
        parts.push(`${spokenMaterials} తో నైపుణ್ಯంగా తీర్చిదిద్దబడింది.`);
      }
      parts.push(`భారతీయ సాంప్రదాయ కళా నైపుణ్యానికి ఒక విశిష్ట ప్రతీక.`);
      return parts.join(' ');
    }

    if (lang === 'Kannada') {
      const parts: string[] = [];
      if (region) {
        parts.push(`${region} ರ ಕಲಾ ಪರಂಪರೆಯಿಂದ, ${product}.`);
      } else {
        parts.push(`ಪರಿಚಯಿಸುತ್ತಿದ್ದೇವೆ ${product}.`);
      }
      if (spokenMaterials) {
        parts.push(`${spokenMaterials} ಬಳಸಿ ಸೊಗಸಾಗಿ ತಯಾರಿಸಲಾಗಿದೆ.`);
      }
      parts.push(`ಭಾರತೀಯ ಕಲಾ ವೈಭವ ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ಪರಂಪರೆಯ ಸುಂದರ ಕೃತಿ.`);
      return parts.join(' ');
    }

    if (lang === 'Malayalam') {
      const parts: string[] = [];
      if (region) {
        parts.push(`${region} ൻ്റെ പാരമ്പര്യത്തിൽ നിന്ന്, ${product}.`);
      } else {
        parts.push(`പരിചയപ്പെടുത്തുന്നു ${product}.`);
      }
      if (spokenMaterials) {
        parts.push(`${spokenMaterials} ഉപയോഗിച്ച് സൂಕ್ಷ്മമായി നിർമ്മിച്ചത്.`);
      }
      parts.push(`ഭാരതീയ സംസ്കാരത്തിന്റെയും പാരമ്പര്യ കലയുടെയും അമൂല്യമായ അടയാളം.`);
      return parts.join(' ');
    }

    if (lang === 'Punjabi') {
      const parts: string[] = [];
      if (region) {
        parts.push(`${region} ਦੀ ਵਿਰਾਸਤੀ ਪਰੰਪਰਾ ਤੋਂ ਪੇਸ਼ ਹੈ ${product}।`);
      } else {
        parts.push(`ਪੇਸ਼ ਹੈ ${product}।`);
      }
      if (spokenMaterials) {
        parts.push(`${spokenMaterials} ਨਾਲ ਖੂਬਸੂਰਤੀ ਨਾਲ ਤਿਆਰ ਕੀਤਾ ਗਿਆ।`);
      }
      parts.push(`ਸਾਡੀ ਅਮੀਰ ਵਿਰਾਸਤ ਅਤੇ ਕਲਾਕਾਰੀ ਦੀ ਇੱਕ ਸ਼ਾਨਦਾਰ ਮਿਸਾਲ।`);
      return parts.join(' ');
    }

    // Natural, Non-Repetitive English Documentary Narration
    const fullText = `${product} ${reelData.craftType || ''} ${spokenMaterials} ${reelData.story || ''}`.toLowerCase();
    const isTextile = /saree|sari|silk|shawl|weave|woven|fabric|textile|dupatta|scarf|stole|embroidery|chikankari|cotton|pashmina/i.test(fullText);
    const isMetal = /metal|brass|bronze|copper|iron|dhokra|dokra|silver|alloy|bell metal/i.test(fullText);
    const isPottery = /pottery|clay|ceramic|terracotta|blue pottery/i.test(fullText);
    const isWood = /wood|carv|sandalwood|teak|sheesham/i.test(fullText);

    const craftVerb = isTextile ? 'Woven' : isMetal ? 'Cast' : isPottery ? 'Molded' : isWood ? 'Carved' : 'Formed';

    const parts: string[] = [];
    
    // Sentence 1: Clean, confident introduction
    if (region) {
      parts.push(`From the rich artisan traditions of ${region}, this is the ${product}.`);
    } else {
      parts.push(`Presenting the ${product}.`);
    }

    // Sentence 2: Specific materials & craft technique (No repeating 'handcrafted')
    if (spokenMaterials) {
      parts.push(`${craftVerb} from ${spokenMaterials}, every line captures meticulous human devotion.`);
    } else if (reelData.craftType) {
      parts.push(`Rooted in the timeless technique of ${reelData.craftType}.`);
    }

    // Sentence 3: Poetic cultural tribute (No awkward username mentions)
    parts.push(`A timeless celebration of enduring Indian artistic culture.`);

    return parts.join(' ');
  }

  // =========================================================================
  // STUDIO-GRADE AI NARRATION DISPATCHER (DEDUPLICATED & ZERO LATENCY)
  // =========================================================================

  private async fetchTTSAudioBuffer(script: string, voiceName: string, language: string): Promise<AudioBuffer | null> {
    const cacheKey = `${voiceName}_${language}_${script}`;

    // Memory cache hit -> return instantly
    if (this.audioBufferCache.has(cacheKey)) {
      return this.audioBufferCache.get(cacheKey)!;
    }

    // Persistent IndexedDB / LocalStorage cache hit -> decode and return instantly
    try {
      const storedBase64 = (await getStoredAudioBase64(cacheKey)) ||
        (typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(`tts_cache_${cacheKey}`) : null);

      if (storedBase64) {
        const binaryString = window.atob(storedBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const ctx = this.initAudioContext();
        if (ctx) {
          let audioBuffer: AudioBuffer;
          try {
            audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
          } catch {
            audioBuffer = decodeRawPCMToAudioBuffer(ctx, bytes, 24000);
          }
          this.audioBufferCache.set(cacheKey, audioBuffer);
          return audioBuffer;
        }
      }
    } catch {}

    // Inflight request exists -> deduplicate and reuse same promise
    if (this.pendingFetches.has(cacheKey)) {
      return this.pendingFetches.get(cacheKey)!;
    }

    const fetchPromise = (async () => {
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: script,
            voiceName,
            language,
            style:
              language === 'Hindi'
                ? 'डिस्कवरी चैनल और नेशनल ज्योग्राफिक जैसा आत्मीय, गहरा, शांत और सौम्य भारतीय वृत्तचित्र वाचक। स्वाभाविक मानवीय सांस, सहज विराम, गरिमामयी ठहराव और मखमली स्वर।'
                : 'Warm, deep, and captivating Discovery Channel documentary narrator. Speaks in a calm, relaxed, intimate cadence with natural human warmth, gentle pauses, and rich resonant depth. Unhurried, poetic, and soothing. Never robotic, brisk, or synthetic.',
          }),
        });

        if (!response.ok) return null;
        const data = await response.json();
        if (!data.audioBase64) return null;

        // Save to IndexedDB and LocalStorage for unlimited persistent cache across reloads
        try {
          await setStoredAudioBase64(cacheKey, data.audioBase64);
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(`tts_cache_${cacheKey}`, data.audioBase64);
          }
        } catch {}

        const binaryString = window.atob(data.audioBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const ctx = this.initAudioContext();
        if (!ctx) return null;

        let audioBuffer: AudioBuffer;
        try {
          audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
        } catch {
          audioBuffer = decodeRawPCMToAudioBuffer(ctx, bytes, 24000);
        }
        this.audioBufferCache.set(cacheKey, audioBuffer);
        return audioBuffer;
      } catch (err) {
        console.warn('AI TTS fetch warning:', err);
        return null;
      } finally {
        this.pendingFetches.delete(cacheKey);
      }
    })();

    this.pendingFetches.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  public buildSceneScripts(reelData: ReelAudioData): { scene1: string; scene2: string; scene3: string; scene4: string } {
    const product = cleanProductTitle(reelData.productName);
    const region = reelData.region?.trim();
    const spokenMaterials = formatMaterialsSpoken(reelData.materials, this.language);
    const rawArtisan = reelData.artisanName?.trim();
    const hasArtisan = Boolean(
      rawArtisan &&
      !rawArtisan.toLowerCase().includes('master craftsman') &&
      rawArtisan.toLowerCase() !== 'unknown'
    );
    const artisan = rawArtisan;
    const rawHook = reelData.hookTitle?.trim();
    const hook = rawHook && rawHook.length > 0 ? rawHook : null;
    const lang = this.language || 'English';
    const price = reelData.price;

    if (lang === 'Hindi') {
      return {
        scene1: hook ? `${hook}...` : 'भारत की अनमोल हस्तकला धरोहर...',
        scene2: region ? `${region} की जीवंत कला परंपरा... प्रस्तुत है ${product}` : `प्रस्तुत है अनमोल कृति... ${product}`,
        scene3: spokenMaterials ? `${spokenMaterials} से रची गई कलाकृति...` : (hasArtisan ? `मास्टर कारीगर ${artisan} की अमर साधना` : 'शुद्ध हस्त निर्मित कला'),
        scene4: price ? `विशेष मूल्य ₹${price}... ऑर्डर करने के लिए अभी क्लिक करें।` : 'विरासत पर अभी उपलब्ध।',
      };
    }

    if (lang === 'Tamil') {
      return {
        scene1: hook ? `${hook}...` : 'இந்திய பாரம்பரியத்தின் அரிய கைவினை...',
        scene2: region ? `${region} பிராந்தியத்தின் ${product}` : `அரிய கைவினைப் படைப்பு... ${product}`,
        scene3: spokenMaterials ? `${spokenMaterials} கொண்டு செதுக்கப்பட்ட படைப்பு...` : (hasArtisan ? `கைவினைஞர் ${artisan} படைப்பு` : 'பாரம்பரிய கைவினை'),
        scene4: price ? `சிறப்பு விலை ₹${price}... இப்போது ஆர்டர் செய்யுங்கள்.` : 'இப்போது ஆர்டர் செய்யுங்கள்.',
      };
    }

    if (lang === 'Bengali') {
      return {
        scene1: hook ? `${hook}...` : 'ভারতের অনন্য কারুশিল্প ঐতিহ্য...',
        scene2: region ? `${region}-এর ঐতিহ্য থেকে... ${product}` : `অনন্য হস্তশিল্পের সৃষ্টি... ${product}`,
        scene3: spokenMaterials ? `${spokenMaterials} দিয়ে তৈরি শিল্পকর্ম...` : (hasArtisan ? `শিল্পী ${artisan}-এর সাধনা` : 'ঐতিহ্যবাহী কারুকাজ'),
        scene4: price ? `বিশেষ মূল্য ₹${price}... এখনই অর্ডার করুন।` : 'এখনই অর্ডার করুন।',
      };
    }

    return {
      scene1: hook ? `${hook}...` : 'Discover pure Indian craft heritage...',
      scene2: region ? `Born in the craft traditions of ${region}... behold the ${product}.` : `Behold this handcrafted masterpiece... the ${product}.`,
      scene3: spokenMaterials ? `Sculpted from ${spokenMaterials}...` : 'A timeless masterpiece of authentic Indian craft.',
      scene4: price ? `Special price ₹${price}... tap link to order now.` : 'Available now on Virasya Heritage.',
    };
  }

  private async scheduleNarrations(reelData: ReelAudioData) {
    if (!this.isRunning || !this.enableVoiceover || !this.ctx) return;

    this.stopSpeech();
    const session = this.currentSpeechSession;

    const script = this.buildNarrationScript(reelData);
    const audioBuffer = await this.fetchTTSAudioBuffer(script, this.voiceName, this.language);

    if (this.currentSpeechSession !== session || !this.isRunning || !this.enableVoiceover || !this.ctx) {
      return;
    }

    if (audioBuffer) {
      this.playStudioAudioBuffer(audioBuffer, this.ctx.currentTime);
    } else {
      this.speakWebSpeechFallback(script, this.language);
    }

    if (this.onAudioReady) {
      this.onAudioReady();
    }
  }

  private speakWebSpeechFallback(text: string, language: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();

      // Clean text into soft, conversational phrases for soothing documentary cadence
      const cleanedText = text
        .replace(/\.\.\./g, ', ')
        .replace(/—/g, ', ')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      const bcpMap: Record<string, string> = {
        Hindi: 'hi-IN',
        Tamil: 'ta-IN',
        Bengali: 'bn-IN',
        Marathi: 'mr-IN',
        Gujarati: 'gu-IN',
        Telugu: 'te-IN',
        Kannada: 'kn-IN',
        Malayalam: 'ml-IN',
        Punjabi: 'pa-IN',
        English: 'en-US', // Unlocks high-definition neural documentary voices across modern browsers
      };
      const targetLang = bcpMap[language] || 'en-US';
      utterance.lang = targetLang;
      utterance.rate = 0.92; // Natural, measured human documentary pace
      utterance.pitch = 1.0; // Pure natural voice formant (prevents metallic synthesizer distortion)

      // Select top-tier Neural / Natural / Premium male documentary storytelling voice
      const voices = (cachedBrowserVoices.length > 0 ? cachedBrowserVoices : window.speechSynthesis.getVoices()) || [];
      if (voices && voices.length > 0) {
        // Exclude mechanical / female voices when looking for male documentary narrator
        const isNotMechanicalOrFemale = (v: SpeechSynthesisVoice) =>
          !/female|zira|samantha|victoria|karen|siri female|google us english\b/i.test(v.name);

        const candidates = voices.filter(isNotMechanicalOrFemale);
        const pool = candidates.length > 0 ? candidates : voices;

        // Tier 1: Celebrated Neural / Natural Male Narrators
        const tier1Male = pool.find(
          (v) =>
            v.name.includes('Guy') ||
            v.name.includes('Ryan') ||
            v.name.includes('Christopher') ||
            v.name.includes('Daniel') ||
            v.name.includes('Google UK English Male') ||
            ((v.name.includes('Natural') || v.name.includes('Neural')) && !v.name.includes('Female'))
        );

        // Tier 2: Established Male Voices
        const tier2Male = pool.find(
          (v) =>
            v.name.includes('Oliver') ||
            v.name.includes('Arthur') ||
            v.name.includes('George') ||
            v.name.includes('Rishi') ||
            v.name.includes('Alex') ||
            v.name.includes('David') ||
            v.name.includes('Male')
        );

        const fallback =
          pool.find((v) => v.lang.startsWith(targetLang.slice(0, 2))) ||
          pool.find((v) => v.lang.startsWith('en')) ||
          pool[0];

        const selectedVoice = tier1Male || tier2Male || fallback;
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onstart = () => {
        this.applyVolumes(true);
      };

      utterance.onend = () => {
        this.applyVolumes(false);
      };

      utterance.onerror = () => {
        this.applyVolumes(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Web Speech API fallback error:', e);
      this.applyVolumes(false);
    }
  }

  private playStudioAudioBuffer(audioBuffer: AudioBuffer, atTime?: number) {
    if (!this.ctx || !this.isRunning || !this.enableVoiceover) return;

    try {
      this.stopSpeech();

      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;

      if (!this.voiceoverGain) {
        this.voiceoverGain = this.ctx.createGain();
        this.voiceoverGain.gain.setValueAtTime(1.30, this.ctx.currentTime);
        this.voiceoverGain.connect(this.masterGain || this.ctx.destination);
      }

      source.connect(this.voiceoverGain);

      // Smooth music volume ducking scheduled right when speech begins
      if (atTime && atTime > this.ctx.currentTime + 0.1) {
        const duckDelay = (atTime - this.ctx.currentTime) * 1000;
        this.duckTimer = setTimeout(() => {
          if (this.isRunning && this.enableVoiceover) {
            this.applyVolumes(true);
          }
        }, Math.max(0, duckDelay - 50));
      } else {
        this.applyVolumes(true);
      }

      source.onended = () => {
        // Gently restore music volume when narrator finishes
        this.applyVolumes(false);
      };

      const startTime = atTime !== undefined ? atTime : this.ctx.currentTime;
      source.start(startTime);
      this.voiceoverSource = source;
    } catch (e) {
      console.error('Error playing studio audio buffer:', e);
      this.applyVolumes(false);
    }
  }

  // =========================================================================
  // PROCEDURAL SOUNDTRACK GENERATORS (BANSURI, SITAR, TANPURA, LOFI)
  // =========================================================================

  private startTrack(trackId: string, atTime?: number) {
    if (!this.ctx || !this.musicGain) return;
    const time = atTime !== undefined ? atTime : this.ctx.currentTime;

    if (trackId === 'royal-sitar') {
      this.playRoyalSitar(time);
    } else if (trackId === 'bansuri-folk') {
      this.playBansuriFolk(time);
    } else if (trackId === 'temple-tanpura') {
      this.playTempleTanpura(time);
    } else if (trackId === 'heritage-lofi') {
      this.playHeritageLofi(time);
    }
  }

  // 1. Warm Bansuri Flute & Tambura Folk
  private playBansuriFolk(startTime?: number) {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;
    const startAt = startTime !== undefined ? startTime : ctx.currentTime;

    const sa = 146.83; // D3
    const pa = 220.0; // A3

    const droneSa = ctx.createOscillator();
    droneSa.type = 'sawtooth';
    droneSa.frequency.setValueAtTime(sa, startAt);

    const dronePa = ctx.createOscillator();
    dronePa.type = 'triangle';
    dronePa.frequency.setValueAtTime(pa, startAt);

    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(420, startAt);

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.12, startAt);

    droneSa.connect(droneFilter);
    dronePa.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.musicGain);

    droneSa.start(startAt);
    dronePa.start(startAt);

    this.activeOscillators.push(droneSa, dronePa);

    const scale = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33];
    let noteIdx = 0;

    this.loopTimer = setInterval(() => {
      if (!this.isRunning || !this.ctx || !this.musicGain) return;

      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sine';
      const freq = scale[noteIdx % scale.length];
      noteIdx = (noteIdx + Math.floor(Math.random() * 3) + 1) % scale.length;

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        scale[(noteIdx + 1) % scale.length],
        ctx.currentTime + 1.8
      );

      const now = ctx.currentTime;
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.18, now + 0.4);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

      osc.connect(noteGain);
      noteGain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 2.3);
    }, 2400);
  }

  // 2. Royal Sitar Folk (Starts IMMEDIATELY from the very first frame)
  private playRoyalSitar(startTime?: number) {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;
    const startAt = startTime !== undefined ? startTime : ctx.currentTime;

    // A. CONTINUOUS TANPURA & SITAR RESONANCE DRONE (Sa-Pa Harmony)
    // Starts immediately at frame 0 with warm acoustic presence
    const droneSa1 = ctx.createOscillator();
    droneSa1.type = 'sawtooth';
    droneSa1.frequency.setValueAtTime(146.83, startAt); // D3 Sa

    const dronePa = ctx.createOscillator();
    dronePa.type = 'triangle';
    dronePa.frequency.setValueAtTime(220.0, startAt); // A3 Pa

    const droneSa2 = ctx.createOscillator();
    droneSa2.type = 'sine';
    droneSa2.frequency.setValueAtTime(293.66, startAt); // D4 High Sa

    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(450, startAt);

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0, startAt);
    droneGain.gain.linearRampToValueAtTime(0.14, startAt + 0.1);

    droneSa1.connect(droneFilter);
    dronePa.connect(droneFilter);
    droneSa2.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.musicGain);

    droneSa1.start(startAt);
    dronePa.start(startAt);
    droneSa2.start(startAt);

    this.activeOscillators.push(droneSa1, dronePa, droneSa2);

    // B. AUTHENTIC SITAR PLUCK SYNTHESIZER WITH JAWARI OVERTONES
    const pluckSitar = (
      freq: number,
      pluckTime: number,
      gainValue = 0.28,
      duration = 1.6,
      bendToFreq?: number
    ) => {
      if (!this.isRunning || !this.ctx || !this.musicGain) return;
      const osc = ctx.createOscillator();
      const sitarGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Sitar strings produce rich triangle/buzz harmonics (Jawari bridge)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, pluckTime);

      if (bendToFreq && bendToFreq !== freq) {
        // Authentic Sitar Meend (smooth microtonal string pull)
        osc.frequency.exponentialRampToValueAtTime(bendToFreq, pluckTime + duration * 0.65);
      }

      // Resonant filter for the metallic sitar gourd resonance
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.8, pluckTime);
      filter.Q.setValueAtTime(3.2, pluckTime);

      // Sitar envelope: crisp tactile attack + long ringing shimmer decay
      sitarGain.gain.setValueAtTime(0, pluckTime);
      sitarGain.gain.linearRampToValueAtTime(gainValue, pluckTime + 0.015);
      sitarGain.gain.exponentialRampToValueAtTime(0.001, pluckTime + duration);

      osc.connect(filter);
      filter.connect(sitarGain);
      sitarGain.connect(this.musicGain);

      osc.start(pluckTime);
      osc.stop(pluckTime + duration + 0.05);
      this.activeOscillators.push(osc);
    };

    // C. IMMEDIATE OPENING SITAR MOTIF (PLUCKS AT FRAME 0 FROM THE VERY STARTING)
    pluckSitar(293.66, startAt + 0.00, 0.32, 1.8);                  // D4 (Opening Sa)
    pluckSitar(329.63, startAt + 0.40, 0.24, 1.4);                  // E4 (Re)
    pluckSitar(369.99, startAt + 0.78, 0.26, 1.6, 440.0);           // F#4 to A4 (Ga-Pa Meend)
    pluckSitar(440.00, startAt + 1.30, 0.30, 1.7);                  // A4 (Pa)
    pluckSitar(587.33, startAt + 1.80, 0.34, 2.2);                  // D5 (High Sa' ringing)

    // D. CONTINUOUS RAJASTHANI SITAR FOLK PATTERN
    // Raag Bhupali & Desh Folk Scale
    const folkScale = [293.66, 329.63, 369.99, 440.0, 493.88, 554.37, 587.33, 659.25];
    let noteIndex = 0;

    this.loopTimer = setInterval(() => {
      if (!this.isRunning || !this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;
      const baseFreq = folkScale[noteIndex % folkScale.length];
      const nextFreq = folkScale[(noteIndex + 1) % folkScale.length];

      // Play with natural human touch & occasional subtle string bend
      const hasBend = noteIndex % 3 === 0;
      pluckSitar(baseFreq, now, 0.24, 1.5, hasBend ? nextFreq : undefined);

      noteIndex = (noteIndex + Math.floor(Math.random() * 2) + 1) % folkScale.length;
    }, 950);
  }

  // 3. Temple Tanpura
  private playTempleTanpura(startTime?: number) {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;

    const baseFrequencies = [110.0, 164.81, 220.0, 293.66];
    let stringIdx = 0;

    this.loopTimer = setInterval(() => {
      if (!this.isRunning || !this.ctx || !this.musicGain) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFrequencies[stringIdx], ctx.currentTime);
      stringIdx = (stringIdx + 1) % baseFrequencies.length;

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 4.0);
    }, 1800);
  }

  // 4. Heritage Lofi
  private playHeritageLofi() {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;

    const lofiChords = [
      [220.0, 261.63, 329.63],
      [174.61, 220.0, 261.63],
      [196.0, 246.94, 293.66],
      [164.81, 207.65, 246.94],
    ];
    let chordIdx = 0;

    this.loopTimer = setInterval(() => {
      if (!this.isRunning || !this.ctx || !this.musicGain) return;

      const chord = lofiChords[chordIdx % lofiChords.length];
      chordIdx++;

      chord.forEach((freq) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 3.2);
      });
    }, 3200);
  }
}

export const reelAudioEngine = new ReelAudioEngine();
