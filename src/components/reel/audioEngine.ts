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

class ReelAudioEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private voiceoverGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private voiceoverSource: AudioBufferSourceNode | null = null;
  private activeOscillators: (OscillatorNode | AudioBufferSourceNode)[] = [];
  private loopTimer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private currentTrackId = 'bansuri-folk';
  private isMuted = false;
  private volume = 0.85;
  private enableVoiceover = true;
  private language = 'English';
  private voiceName = 'Charon'; // 'Charon' (Deep Male), 'Kore' (Warm Female), 'Fenrir' (Deep Storyteller)
  private voiceDuckRatio = 0.18; // Music volume drops smoothly while narrator speaks
  private cachedReelData: ReelAudioData | null = null;
  private audioBufferCache: Map<string, AudioBuffer> = new Map();
  private pendingFetches: Map<string, Promise<AudioBuffer | null>> = new Map();

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
   * Start playing background soundtrack & voiceover narration immediately
   */
  public start(reelData?: ReelAudioData) {
    this.stop();
    if (reelData) {
      this.cachedReelData = reelData;
      if (reelData.language) this.language = reelData.language;
    }

    const ctx = this.initAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    this.isRunning = true;

    // Master audio graph
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, ctx.currentTime);
    this.masterGain.connect(ctx.destination);

    // Initial music gain ducked if voiceover is active
    this.musicGain = ctx.createGain();
    const initialMusicGain = (this.enableVoiceover && this.cachedReelData) ? this.voiceDuckRatio : 1.0;
    this.musicGain.gain.setValueAtTime(initialMusicGain, ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.voiceoverGain = ctx.createGain();
    this.voiceoverGain.gain.setValueAtTime(1.30, ctx.currentTime);
    this.voiceoverGain.connect(this.masterGain);

    // Start background soundtrack generator
    this.startTrack(this.currentTrackId);

    // Start studio voiceover narration immediately
    if (this.enableVoiceover && this.cachedReelData) {
      this.scheduleNarrations(this.cachedReelData);
    }
  }

  /**
   * Pre-fetches and decodes the voiceover audio for a product/hook in advance
   */
  public async prefetchVoiceover(reelData: ReelAudioData) {
    if (!reelData) return;
    const script = this.buildNarrationScript(reelData);
    await this.fetchTTSAudioBuffer(script, this.voiceName, this.language);
  }

  /**
   * Called when Remotion Player loops back to frame 0
   */
  public handleVideoLoop() {
    if (this.isRunning && this.enableVoiceover && this.cachedReelData) {
      this.stopSpeech();
      this.scheduleNarrations(this.cachedReelData);
    }
  }

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
    this.startTrack(this.currentTrackId);
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
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private stopSpeech() {
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
  // MULTILINGUAL HERITAGE NARRATION BUILDER
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
      if (hook) {
        parts.push(`${hook}।`);
      }
      if (region) {
        parts.push(`${region} की समृद्ध कला परम्परा से निर्मित, प्रस्तुत है ${product}।`);
      } else {
        parts.push(`प्रस्तुत है हस्तशिल्प की अनुपम कृति, ${product}।`);
      }
      if (spokenMaterials) {
        parts.push(`${spokenMaterials} से रची गई यह कलाकृति धैर्य और निष्ठा का प्रतीक है।`);
      }
      if (hasArtisan) {
        parts.push(`कारीगर ${artisan} की पीढ़ी-दर-पीढ़ी जीवंत विरासत।`);
      }
      return parts.join(' ');
    }

    if (lang === 'Tamil') {
      const parts: string[] = [];
      if (hook) {
        parts.push(`${hook}.`);
      }
      if (region) {
        parts.push(`${region} பாரம்பரியத்தின் அரிய படைப்பு, ${product}.`);
      } else {
        parts.push(`பார்ப்போரை மயக்கும் கைவினைப் படைப்பு, ${product}.`);
      }
      if (spokenMaterials) {
        parts.push(`${spokenMaterials} கொண்டு செதுக்கப்பட்ட அபூர்வக் கலை நுட்பம்.`);
      }
      if (hasArtisan) {
        parts.push(`கைவினைஞர் ${artisan} அவர்களின் தலைசிறந்த கலைப் பாரம்பரியம்.`);
      }
      return parts.join(' ');
    }

    if (lang === 'Bengali') {
      const parts: string[] = [];
      if (hook) {
        parts.push(`${hook}।`);
      }
      if (region) {
        parts.push(`${region}-এর ঐতিহ্যবাহী কারুশিল্প থেকে, নিবেদন ${product}।`);
      } else {
        parts.push(`নিবেদন হস্তশিল্পের অনন্য সৃষ্টি, ${product}।`);
      }
      if (spokenMaterials) {
        parts.push(`${spokenMaterials} দিয়ে তৈরি এই অনুপম শিল্পকর্ম।`);
      }
      if (hasArtisan) {
        parts.push(`শিল্পী ${artisan}-এর বংশানুক্রমিক সাধনা ও কারুকাজ।`);
      }
      return parts.join(' ');
    }

    if (lang === 'Marathi') {
      const parts: string[] = [];
      if (hook) {
        parts.push(`${hook}।`);
      }
      if (region) {
        parts.push(`${region} च्या समृद्ध परंपरेतून, सादर आहे ${product}।`);
      } else {
        parts.push(`सादर आहे हस्तकलेची अप्रतिम निर्मिती, ${product}।`);
      }
      if (spokenMaterials) {
        parts.push(`${spokenMaterials} ने घडवलेली ही कलाकृती।`);
      }
      if (hasArtisan) {
        parts.push(`कारागीर ${artisan} यांचा समृद्ध हस्तकला वारसा।`);
      }
      return parts.join(' ');
    }

    if (lang === 'Gujarati') {
      const parts: string[] = [];
      if (hook) {
        parts.push(`${hook}।`);
      }
      if (region) {
        parts.push(`${region} ની પ્રાચીન વિરાસતમાંથી, પ્રસ્તુત છે ${product}।`);
      } else {
        parts.push(`પ્રસ્તુત છે હસ્તકલાની અનન્ય કૃતિ, ${product}।`);
      }
      if (spokenMaterials) {
        parts.push(`${spokenMaterials} થી તૈયાર કરેલી અદભુત કારીગરી।`);
      }
      if (hasArtisan) {
        parts.push(`કારીગર ${artisan} નું વારસાગત મૌલિક કૌશલ્ય।`);
      }
      return parts.join(' ');
    }

    if (lang === 'Telugu') {
      const parts: string[] = [];
      if (hook) {
        parts.push(`${hook}.`);
      }
      if (region) {
        parts.push(`${region} విశిష్ట కళా సాంప్రదాయం నుండి, ${product}.`);
      } else {
        parts.push(`అద్భుతమైన హస్తకళా రూపం, ${product}.`);
      }
      if (spokenMaterials) {
        parts.push(`${spokenMaterials} తో తీర్చిదిద్దిన మనోహర శిల్పం.`);
      }
      if (hasArtisan) {
        parts.push(`కళాకారుడు ${artisan} పరంపరాగత నైపుణ్యానికి సాక్ష్యం.`);
      }
      return parts.join(' ');
    }

    if (lang === 'Kannada') {
      const parts: string[] = [];
      if (hook) {
        parts.push(`${hook}.`);
      }
      if (region) {
        parts.push(`${region} ರ ಪರಂಪರೆಯ ವಿಶೇಷ ಹಸ್ತಕೃತಿ, ${product}.`);
      } else {
        parts.push(`ವಿಶಿಷ್ಟ ಹಸ್ತಕಲೆಯ ನಿರ್ಮಿತಿ, ${product}.`);
      }
      if (spokenMaterials) {
        parts.push(`${spokenMaterials} ನಿಂದ ತಯಾರಿಸಿದ ಸುಂದರ ಕಲಾಕೃತಿ.`);
      }
      if (hasArtisan) {
        parts.push(`ಕುಶಲಕರ್ಮಿ ${artisan} ರ ಸಾಂಪ್ರದಾಯಿಕ ಕಲಾ ಸಿದ್ಧಿ.`);
      }
      return parts.join(' ');
    }

    if (lang === 'Malayalam') {
      const parts: string[] = [];
      if (hook) {
        parts.push(`${hook}.`);
      }
      if (region) {
        parts.push(`${region} ൻ്റെ പാരമ്പര്യ നിർമ്മിതി, ${product}.`);
      } else {
        parts.push(`മനോഹരമായ കരകൗശല സൃഷ്ടി, ${product}.`);
      }
      if (spokenMaterials) {
        parts.push(`${spokenMaterials} ഉപയോഗിച്ച് തീർത്ത അപൂർവ നിർമ്മിതി.`);
      }
      if (hasArtisan) {
        parts.push(`കരകൗശല വിദഗ്ദ്ധൻ ${artisan} ൻ്റെ പാരമ്പര്യ സിദ്ധി.`);
      }
      return parts.join(' ');
    }

    if (lang === 'Punjabi') {
      const parts: string[] = [];
      if (hook) {
        parts.push(`${hook}।`);
      }
      if (region) {
        parts.push(`${region} ਦੀ ਵਿਰਾਸਤੀ ਪਰੰਪਰਾ ਤੋਂ, ਪੇਸ਼ ਹੈ ${product}।`);
      } else {
        parts.push(`ਪੇਸ਼ ਹੈ ਹੱਥ-ਕਲਾ ਦੀ ਅਨੋਖੀ ਮਿਸਾਲ, ${product}।`);
      }
      if (spokenMaterials) {
        parts.push(`${spokenMaterials} ਨਾਲ ਤਿਆਰ ਕੀਤੀ ਅਨੋਖੀ ਕਲਾਕ੍ਰਿਤੀ।`);
      }
      if (hasArtisan) {
        parts.push(`ਕਾਰੀਗਰ ${artisan} ਦੀ ਪੀੜ੍ਹੀ-ਦਰ-ਪੀੜ੍ਹੀ ਮਹਾਰਤ।`);
      }
      return parts.join(' ');
    }

    // High-Impact English Craft Documentary
    const parts: string[] = [];
    if (hook) {
      parts.push(`${hook}.`);
    }
    if (region) {
      parts.push(`Sourced from the craft traditions of ${region}, behold the ${product}.`);
    } else {
      parts.push(`Behold this handcrafted masterpiece, the ${product}.`);
    }

    if (spokenMaterials) {
      parts.push(`Meticulously created using ${spokenMaterials}.`);
    }

    if (hasArtisan) {
      parts.push(`A living tribute to the mastery of artisan ${artisan}.`);
    } else {
      parts.push(`Celebrating centuries of living craft heritage.`);
    }

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

    // Persistent LocalStorage cache hit -> decode and return instantly
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedBase64 = localStorage.getItem(`tts_cache_${cacheKey}`);
        if (storedBase64) {
          const binaryString = window.atob(storedBase64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const ctx = this.initAudioContext();
          if (ctx) {
            const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
            this.audioBufferCache.set(cacheKey, audioBuffer);
            return audioBuffer;
          }
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
                ? 'आत्मीय, गंभीर, शांत भारतीय हस्तशिल्प वृत्तचित्र वाचक।'
                : 'Warm, dignified, calm artisanal documentary narrator.',
          }),
        });

        if (!response.ok) return null;
        const data = await response.json();
        if (!data.audioBase64) return null;

        // Save to LocalStorage for zero-cost repeat playback across reloads
        try {
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

        const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
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

  private async scheduleNarrations(reelData: ReelAudioData) {
    if (!this.isRunning || !this.enableVoiceover) return;

    this.stopSpeech();

    const script = this.buildNarrationScript(reelData);
    const audioBuffer = await this.fetchTTSAudioBuffer(script, this.voiceName, this.language);

    if (audioBuffer && this.isRunning && this.enableVoiceover) {
      this.playStudioAudioBuffer(audioBuffer);
    }
  }

  private playStudioAudioBuffer(audioBuffer: AudioBuffer) {
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

      // Smooth music volume ducking while narrator speaks
      this.applyVolumes(true);

      source.onended = () => {
        // Gently restore music volume when narrator finishes
        this.applyVolumes(false);
      };

      // Play INSTANTLY at 0ms delay
      const startTime = this.ctx.currentTime;
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

  private startTrack(trackId: string) {
    if (!this.ctx || !this.musicGain) return;

    if (trackId === 'bansuri-folk') {
      this.playBansuriFolk();
    } else if (trackId === 'royal-sitar') {
      this.playRoyalSitar();
    } else if (trackId === 'temple-tanpura') {
      this.playTempleTanpura();
    } else if (trackId === 'heritage-lofi') {
      this.playHeritageLofi();
    }
  }

  // 1. Warm Bansuri Flute & Tambura Folk
  private playBansuriFolk() {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;

    const sa = 146.83; // D3
    const pa = 220.0; // A3

    const droneSa = ctx.createOscillator();
    droneSa.type = 'sawtooth';
    droneSa.frequency.setValueAtTime(sa, ctx.currentTime);

    const dronePa = ctx.createOscillator();
    dronePa.type = 'triangle';
    dronePa.frequency.setValueAtTime(pa, ctx.currentTime);

    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(420, ctx.currentTime);

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.12, ctx.currentTime);

    droneSa.connect(droneFilter);
    dronePa.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.musicGain);

    droneSa.start();
    dronePa.start();

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

  // 2. Royal Sitar Plucks
  private playRoyalSitar() {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;

    const sitarScale = [293.66, 329.63, 369.99, 415.3, 440.0, 493.88, 554.37, 587.33];
    let step = 0;

    this.loopTimer = setInterval(() => {
      if (!this.isRunning || !this.ctx || !this.musicGain) return;

      const osc = ctx.createOscillator();
      const sitarGain = ctx.createGain();

      osc.type = 'triangle';
      const freq = sitarScale[step % sitarScale.length];
      step = (step + 1) % sitarScale.length;

      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const now = ctx.currentTime;
      sitarGain.gain.setValueAtTime(0.3, now);
      sitarGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.connect(sitarGain);
      sitarGain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 1.5);
    }, 1200);
  }

  // 3. Temple Tanpura
  private playTempleTanpura() {
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
