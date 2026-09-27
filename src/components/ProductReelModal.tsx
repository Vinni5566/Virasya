"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import {
  REEL_THEMES,
  inferReelTheme,
} from './reel/themePresets';
import {
  getReelI18n,
  generateLocalizedReelHooks,
} from './reel/i18nReel';
import { ProductReelComposition } from './reel/ProductReelComposition';
import { reelAudioEngine } from './reel/audioEngine';
import { exportReelVideo } from './reel/export/exportReelVideo';
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  Instagram,
  Palette,
  Eye,
  Smartphone,
  Music,
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Download,
  Loader2,
} from 'lucide-react';
import type { PlayerRef } from '@remotion/player';

// Dynamically import Remotion Player to avoid SSR hydration issues
const Player = dynamic(
  () => import('@remotion/player').then((mod) => mod.Player),
  { ssr: false }
);

interface ProductReelModalProps {
  product: Product;
  artisanName?: string;
  artisanPhoto?: string;
  isOpen: boolean;
  onClose: () => void;
}

const AUDIO_TRACKS = [
  {
    id: 'bansuri-folk',
    name: 'Bansuri Flute',
    vibe: 'Warm Acoustic Folk',
    icon: '🪈',
  },
  {
    id: 'royal-sitar',
    name: 'Royal Sitar',
    vibe: 'Palace Santoor & Strings',
    icon: '🪕',
  },
  {
    id: 'temple-tanpura',
    name: 'Temple Bells',
    vibe: 'Meditative Tanpura',
    icon: '🔔',
  },
  {
    id: 'heritage-lofi',
    name: 'Heritage Lo-Fi',
    vibe: 'Classical Chillhop',
    icon: '🎧',
  },
];

const AI_VOICES = [
  { id: 'Charon', name: 'Charon', role: 'Heritage Doc' },
  { id: 'Kore', name: 'Kore', role: 'Warm Female' },
  { id: 'Fenrir', name: 'Fenrir', role: 'Deep Story' },
  { id: 'Zephyr', name: 'Zephyr', role: 'Calm Poetic' },
];

export function ProductReelModal({
  product,
  artisanName,
  isOpen,
  onClose,
}: ProductReelModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const playerRef = useRef<PlayerRef>(null);

  // Active language state (synced with global translator & product)
  const initialProductLang = (product as any).language || 'English';
  const [activeLang, setActiveLang] = useState<string>(initialProductLang);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const m = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    const codeMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      ta: 'Tamil',
      bn: 'Bengali',
      mr: 'Marathi',
      gu: 'Gujarati',
      te: 'Telugu',
      kn: 'Kannada',
      ml: 'Malayalam',
      pa: 'Punjabi',
    };
    if (m && m[1] && codeMap[m[1]]) {
      setActiveLang(codeMap[m[1]]);
    }

    const handler = (e: Event) => {
      const languageName = (e as CustomEvent).detail?.languageName;
      if (languageName) {
        setActiveLang(languageName);
      }
    };
    window.addEventListener('virasya:languageChange', handler);
    return () => window.removeEventListener('virasya:languageChange', handler);
  }, []);

  // Audio State
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.85);
  const [selectedAudioId, setSelectedAudioId] = useState<string>('bansuri-folk');
  const [enableVoiceover, setEnableVoiceover] = useState(false);

  // Extract saved language and localized field values
  const savedLang = activeLang || (product as any).language || 'English';
  const trans = (product as any).translations?.[savedLang];

  const resolvedProductName =
    savedLang !== 'English' && trans?.title
      ? trans.title
      : (product as any).productNameRegional || product.productName;

  const resolvedDescription =
    savedLang !== 'English' && trans?.description
      ? trans.description
      : product.description;

  const resolvedStory =
    savedLang !== 'English' && trans?.story
      ? trans.story
      : (product as any).storyRegional || product.story;

  const resolvedCraftType =
    savedLang !== 'English' && trans?.category
      ? trans.category
      : product.craftType;

  const resolvedMaterials =
    savedLang !== 'English' && trans?.materials
      ? trans.materials
      : product.materials;

  const resolvedCraftStyle =
    savedLang !== 'English' && trans?.style
      ? trans.style
      : product.craftStyle;

  const resolvedRegion =
    savedLang !== 'English' && trans?.region
      ? trans.region
      : product.region;

  const i18n = useMemo(() => getReelI18n(savedLang), [savedLang]);

  // Intelligent adaptive theme inference based on materials
  const initialTheme = useMemo(() => {
    return inferReelTheme(
      resolvedCraftType,
      resolvedProductName,
      resolvedMaterials,
      resolvedStory || resolvedDescription
    );
  }, [resolvedCraftType, resolvedProductName, resolvedMaterials, resolvedStory, resolvedDescription]);

  const [selectedThemeId, setSelectedThemeId] = useState<string>(initialTheme.id);

  // Localized AI Hook generation
  const hookOptions = useMemo(() => {
    return generateLocalizedReelHooks({
      productName: resolvedProductName,
      artisanName: artisanName || product.artisanName,
      craftType: resolvedCraftType,
      region: resolvedRegion,
      materials: resolvedMaterials,
      language: savedLang,
    });
  }, [resolvedProductName, artisanName, product.artisanName, resolvedCraftType, resolvedRegion, resolvedMaterials, savedLang]);

  const [selectedHookIndex, setSelectedHookIndex] = useState(0);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reel Video Export State
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [exportProgressText, setExportProgressText] = useState('');
  const [exportPercent, setExportPercent] = useState(0);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleShareInstagramReel = async () => {
    // 1. Auto-copy localized caption & hashtags to clipboard
    try {
      await navigator.clipboard.writeText(instagramCaption);
      setCopiedCaption(true);
    } catch {}

    setIsExportingVideo(true);
    setExportNotice(null);
    setExportProgressText('Rendering 1080p HD Reel & Audio...');
    setExportPercent(5);

    try {
      const res = await exportReelVideo({
        productName: resolvedProductName,
        artisanName: artisanName || product.artisanName,
        craftType: resolvedCraftType,
        craftStyle: resolvedCraftStyle,
        region: resolvedRegion,
        materials: resolvedMaterials,
        price: product.price,
        imageUrl: (product.images && product.images[0]) || (product as any).imageUrl || '',
        images: (product.images && product.images.length > 0) ? product.images : ((product as any).imageUrl ? [(product as any).imageUrl] : []),
        themeId: selectedThemeId,
        hookTitle: currentHook.title,
        hookSubtext: currentHook.subtext,
        language: savedLang,
        story: resolvedStory,
        culturalNote: product.culturalNote,
        variantSalt: `hook_${selectedHookIndex}`,
        durationSeconds: 15,
        onProgress: (percent, statusText) => {
          setExportPercent(percent);
          setExportProgressText(statusText);
        },
      });

      setExportNotice(
        `✓ 1080p Reel downloaded to Gallery! Caption copied to clipboard. Opening Instagram...`
      );

      // Open Instagram Reel creator
      setTimeout(() => {
        const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = 'instagram://reels_share';
          setTimeout(() => {
            window.open('https://www.instagram.com/reels/create/', '_blank', 'noopener,noreferrer');
          }, 1500);
        } else {
          window.open('https://www.instagram.com/reels/create/', '_blank', 'noopener,noreferrer');
        }
      }, 1500);
    } catch (err: any) {
      console.error('Reel export error:', err);
      setExportNotice('✓ Caption copied to clipboard! Opening Instagram...');
      setTimeout(() => {
        window.open('https://www.instagram.com/reels/create/', '_blank', 'noopener,noreferrer');
      }, 1200);
    } finally {
      setIsExportingVideo(false);
    }
  };

  const currentHook = hookOptions[selectedHookIndex] || hookOptions[0];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (initialTheme?.id) {
      setSelectedThemeId(initialTheme.id);
    }
  }, [initialTheme]);

  // Start / restart audio engine with synchronized storytelling & soundtrack
  const triggerAudioPlayback = useCallback(() => {
    reelAudioEngine.setConfig({
      trackId: selectedAudioId,
      isMuted: isMuted,
      volume: audioVolume,
      enableVoiceover: enableVoiceover,
      language: savedLang,
    });

    reelAudioEngine.start({
      productName: resolvedProductName,
      artisanName: artisanName || product.artisanName || i18n.masterCraftsman,
      craftType: resolvedCraftType,
      region: resolvedRegion,
      materials: resolvedMaterials,
      price: product.price,
      story: resolvedStory || resolvedDescription,
      hookTitle: currentHook.title,
      language: savedLang,
    });

    setIsPlayingAudio(true);
  }, [
    selectedAudioId,
    isMuted,
    audioVolume,
    enableVoiceover,
    savedLang,
    resolvedProductName,
    artisanName,
    product.artisanName,
    i18n.masterCraftsman,
    resolvedCraftType,
    resolvedRegion,
    resolvedMaterials,
    product.price,
    resolvedStory,
    resolvedDescription,
    currentHook.title,
  ]);

  // Manage Audio Engine Lifecycle & Hook Changes when modal opens or selected hook updates
  useEffect(() => {
    if (isOpen) {
      reelAudioEngine.unlock();
      triggerAudioPlayback();
      return () => {
        reelAudioEngine.stop();
      };
    } else {
      reelAudioEngine.stop();
    }
  }, [isOpen, selectedHookIndex, selectedAudioId, enableVoiceover, savedLang, triggerAudioPlayback]);

  // Prefetch voiceovers for all hook options when modal opens or language changes
  useEffect(() => {
    if (isOpen && enableVoiceover) {
      hookOptions.forEach((hook) => {
        reelAudioEngine.prefetchVoiceover({
          productName: resolvedProductName,
          artisanName: artisanName || product.artisanName || i18n.masterCraftsman,
          craftType: resolvedCraftType,
          region: resolvedRegion,
          materials: resolvedMaterials,
          price: product.price,
          story: resolvedStory || resolvedDescription,
          hookTitle: hook.title,
          language: savedLang,
        });
      });
    }
  }, [isOpen, enableVoiceover, hookOptions, resolvedProductName, artisanName, product.artisanName, i18n.masterCraftsman, resolvedCraftType, resolvedRegion, resolvedMaterials, product.price, resolvedStory, resolvedDescription, savedLang]);

  // Synchronize Voiceover with Player Loop
  const lastFrameRef = useRef<number>(0);
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isOpen) return;

    const handleFrameUpdate = (e: any) => {
      const currentFrame = e.detail?.frame ?? 0;
      if (lastFrameRef.current > 400 && currentFrame < 25) {
        // Video looped back to frame 0 -> replay voiceover
        reelAudioEngine.handleVideoLoop();
      }
      lastFrameRef.current = currentFrame;
    };

    player.addEventListener('frameupdate', handleFrameUpdate);
    return () => {
      player.removeEventListener('frameupdate', handleFrameUpdate);
    };
  }, [isMounted, isOpen]);

  // Handle Track Selection Change
  const handleSelectTrack = (trackId: string) => {
    setSelectedAudioId(trackId);
    reelAudioEngine.setConfig({ trackId });
    triggerAudioPlayback();
  };

  // Handle Mute Toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    reelAudioEngine.setConfig({ isMuted: nextMuted });
  };

  // Handle Play / Pause Toggle
  const handleTogglePlayPause = () => {
    if (isPlayingAudio) {
      reelAudioEngine.pause();
      if (playerRef.current) {
        playerRef.current.pause();
      }
      setIsPlayingAudio(false);
    } else {
      reelAudioEngine.resume();
      if (playerRef.current) {
        playerRef.current.play();
      }
      setIsPlayingAudio(true);
    }
  };

  // Instagram Caption formatted with verified localized content
  const instagramCaption = useMemo(() => {
    const rawMaker = artisanName || product.artisanName;
    const makerPart = rawMaker ? ` • ${rawMaker}` : '';
    const cleanCraft = (resolvedCraftType || 'Craft').replace(/\s+/g, '');
    const cleanRegion = (resolvedRegion || 'India').replace(/\s+/g, '');
    const matPart = resolvedMaterials ? `✦ ${resolvedMaterials}` : '';
    const regPart = resolvedRegion ? ` | ${resolvedRegion}` : '';
    const scarcityPart =
      product.availableQuantity && product.availableQuantity > 0
        ? ` | ⚡ ${i18n.onlyRemaining(product.availableQuantity)}`
        : '';

    return `✨ ${resolvedProductName}${makerPart}\n\n` +
      `${matPart}${regPart}\n` +
      (resolvedStory ? `"${resolvedStory.slice(0, 160)}..."\n\n` : '\n') +
      `💰 ₹${product.price}${scarcityPart}\n` +
      `👉 ${i18n.tapLinkInBio}\n\n` +
      `#Virasya #HandmadeInIndia #ArtisanCraft #IndianHandicrafts #SlowLuxury #${cleanCraft} #${cleanRegion} #VocalForLocal`;
  }, [resolvedProductName, resolvedMaterials, resolvedRegion, resolvedStory, product.price, product.availableQuantity, artisanName, product.artisanName, resolvedCraftType, i18n]);

  // WhatsApp Message formatted with verified localized content
  const whatsappMessage = useMemo(() => {
    const rawMaker = artisanName || product.artisanName;
    const productUrl = typeof window !== 'undefined' ? window.location.href : '';
    const lines: string[] = [`✨ *${resolvedProductName} • Virasya* ✨\n`];

    if (rawMaker) {
      lines.push(`👨‍🎨 *${i18n.masterCraftsman}*: ${rawMaker}${resolvedRegion ? ` (${resolvedRegion})` : ''}`);
    } else if (resolvedRegion) {
      lines.push(`📍 *Region*: ${resolvedRegion}`);
    }

    if (resolvedCraftType || resolvedMaterials) {
      lines.push(`💎 *${i18n.craftTradition}*: ${[resolvedCraftType, resolvedMaterials].filter(Boolean).join(' • ')}`);
    }

    lines.push(`💰 *${i18n.artisanalPrice}*: ₹${product.price}`);

    if (product.availableQuantity && product.availableQuantity > 0) {
      lines.push(`⚡ *${i18n.onlyRemaining(product.availableQuantity)}*`);
    }

    if (resolvedStory) {
      lines.push(`\n📖 "${resolvedStory.slice(0, 140)}..."`);
    }

    lines.push(`\n🛍️ *${i18n.orderHeritage}*:\n${productUrl}`);
    return lines.join('\n');
  }, [resolvedProductName, artisanName, product.artisanName, resolvedRegion, resolvedCraftType, resolvedMaterials, product.price, product.availableQuantity, resolvedStory, i18n]);

  // Handle Share to WhatsApp
  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappMessage);
    const url = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Handle Copy Instagram Caption
  const handleCopyCaption = () => {
    navigator.clipboard.writeText(instagramCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 3000);
  };

  // Handle Copy Direct Link
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Native Mobile Web Share
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${resolvedProductName} • Virasya Heritage Reel`,
          text: whatsappMessage,
          url: window.location.href,
        });
      } catch {
        handleShareWhatsApp();
      }
    } else {
      handleShareWhatsApp();
    }
  };

  const compositionProps = {
    productName: resolvedProductName,
    artisanName: artisanName || product.artisanName,
    craftType: resolvedCraftType,
    craftStyle: resolvedCraftStyle,
    region: resolvedRegion,
    materials: resolvedMaterials,
    price: product.price,
    availableQuantity: product.availableQuantity,
    imageUrl: (product.images && product.images[0]) || (product as any).imageUrl || '',
    images: (product.images && product.images.length > 0) ? product.images : ((product as any).imageUrl ? [(product as any).imageUrl] : []),
    story: resolvedStory,
    culturalNote: product.culturalNote,
    themeId: selectedThemeId,
    hookTitle: currentHook.title,
    hookSubtext: currentHook.subtext,
    language: savedLang,
    audioTrackId: selectedAudioId,
    enableVoiceover: enableVoiceover,
    variantSalt: `hook_${selectedHookIndex}`,
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] sm:w-full p-0 overflow-hidden bg-[#FDFBF7] text-foreground rounded-[24px] sm:rounded-[40px] shadow-2xl border border-amber-900/15 max-h-[92vh] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
          {/* Left Column: Remotion 9:16 Video Player Preview inside Luxury Phone Frame */}
          <div className="lg:col-span-5 bg-gradient-to-b from-amber-950/10 via-amber-900/5 to-amber-950/10 flex flex-col items-center justify-center p-4 sm:p-8 border-b lg:border-b-0 lg:border-r border-amber-900/10 relative">
            {/* Phone Bezel Frame */}
            <div className="w-full max-w-[220px] sm:max-w-[280px] aspect-[9/16] rounded-[28px] sm:rounded-[38px] overflow-hidden shadow-[0_20px_50px_rgba(40,20,10,0.25)] border-[4px] sm:border-[5px] border-amber-900/30 relative bg-black group ring-1 ring-amber-500/20">
              {/* Speaker notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-1.5 bg-zinc-800 rounded-full z-40" />

              {isMounted ? (
                <div id="virasya-remotion-player" className="w-full h-full">
                  <Player
                    ref={playerRef}
                    component={ProductReelComposition as any}
                    inputProps={compositionProps}
                    durationInFrames={450}
                    compositionWidth={1080}
                    compositionHeight={1920}
                    fps={30}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    controls
                    autoPlay
                    loop
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-800 text-sm">
                  Loading Remotion Studio...
                </div>
              )}

              {/* Resolution & Mode Indicator */}
              <div className="absolute top-4 left-4 pointer-events-none z-30">
                <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-400/30 shadow-md">
                  9:16 • 30FPS Editorial
                </span>
              </div>

              {/* Quick Sound Control Overlay on Video */}
              <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5">
                <button
                  onClick={handleToggleMute}
                  title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                  className={`p-1.5 rounded-full backdrop-blur-md border shadow-md transition-all ${
                    isMuted
                      ? 'bg-rose-500/80 text-white border-rose-400/40'
                      : 'bg-black/70 text-amber-300 border-amber-400/40 hover:bg-black/90'
                  }`}
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Tactile Audio Status & Playback Controller */}
            <div className="mt-3 flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-900/10 shadow-xs">
              <button
                onClick={handleTogglePlayPause}
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-amber-700 transition-colors"
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="h-3.5 w-3.5 text-amber-600" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 text-amber-600" />
                    <span>Play Audio</span>
                  </>
                )}
              </button>

              <div className="h-3 w-[1px] bg-amber-900/20" />

              <button
                onClick={handleToggleMute}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 transition-colors"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-rose-600" />
                    <span className="text-rose-600">Unmute</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Sound Live</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-amber-900/70 mt-2 text-center font-bold flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-primary" />
              {i18n.fidelityBadge}
            </p>
          </div>

          {/* Right Column: Customization, AI Hooks, Audio, & Instant Social Share Hub */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh] bg-[#FDFBF7]">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                      {i18n.studioTitle}
                    </span>
                    {savedLang !== 'English' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {savedLang}
                      </span>
                    )}
                  </div>
                  <DialogTitle className="text-2xl sm:text-3xl font-bold font-headline text-primary tracking-tight">
                    {i18n.studioHeading}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-sm mt-1">
                    Silky cinematic pan & sliding motion, rotating heritage mandalas, and matched soundscapes.
                  </DialogDescription>
                </div>
              </div>

              {/* 1. Localized Story Hook Selector */}
              <div className="mb-5 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  {i18n.selectHook}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {hookOptions.map((hook, idx) => (
                    <button
                      key={hook.id}
                      onClick={() => setSelectedHookIndex(idx)}
                      className={`text-left p-3 rounded-2xl border transition-all text-xs ${
                        selectedHookIndex === idx
                          ? 'bg-primary/10 border-primary text-primary shadow-md font-medium'
                          : 'bg-white border-amber-900/10 text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                      }`}
                    >
                      <p className="font-bold text-foreground mb-0.5 line-clamp-1">{hook.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{hook.subtext}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Audio Mood Soundtrack */}
              <div className="mb-5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Music className="h-3.5 w-3.5 text-amber-600" />
                    {i18n.audioSoundtrack}
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AUDIO_TRACKS.map((track) => {
                    const isSelected = selectedAudioId === track.id;
                    return (
                      <button
                        key={track.id}
                        onClick={() => handleSelectTrack(track.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm ring-1 ring-amber-500/30'
                            : 'bg-white border-amber-900/10 text-muted-foreground hover:bg-secondary/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base">{track.icon}</span>
                          {isSelected && <Volume2 className="h-3 w-3 text-amber-600 animate-pulse" />}
                        </div>
                        <p className="text-[11px] font-bold text-foreground line-clamp-1">{track.name}</p>
                        <p className="text-[9px] text-muted-foreground line-clamp-1">{track.vibe}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Adaptive Cinematic Theme Switcher */}
              <div className="mb-5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Palette className="h-3.5 w-3.5 text-amber-600" />
                    {i18n.cinematicAtmosphere}
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    {i18n.autoMatched}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {Object.values(REEL_THEMES).map((theme) => {
                    const isSelected = selectedThemeId === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedThemeId(theme.id)}
                        className={`flex flex-col items-center p-2 rounded-2xl border transition-all text-center ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20'
                            : 'border-amber-900/10 bg-white hover:bg-secondary/40'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full mb-1 shadow-inner border border-black/10"
                          style={{
                            background: `linear-gradient(135deg, ${theme.accentColor}, ${theme.gradientFrom})`,
                          }}
                        />
                        <span className="text-[10px] font-bold text-foreground line-clamp-1">
                          {theme.name.split('&')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Instagram Caption & Hashtags Preview */}
              <div className="p-3.5 rounded-2xl bg-white border border-amber-900/10 mb-4 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Instagram className="h-3.5 w-3.5 text-pink-600" />
                    {i18n.readyToPost}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyCaption}
                    className="h-7 px-2.5 text-xs text-primary hover:text-primary hover:bg-primary/10 rounded-lg gap-1.5"
                  >
                    {copiedCaption ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">{i18n.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>{i18n.copyCaption}</span>
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed bg-secondary/30 p-2.5 rounded-xl border border-primary/5 font-sans">
                  {instagramCaption}
                </p>
              </div>
            </div>

            {/* Bottom Actions: Share Instagram Reel & WhatsApp */}
            <div className="space-y-2.5 pt-1">
              {/* Progress & Notice Banner */}
              {isExportingVideo && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-amber-700" />
                      {exportProgressText}
                    </span>
                    <span>{exportPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-amber-900/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-600 transition-all duration-300"
                      style={{ width: `${exportPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {exportNotice && !isExportingVideo && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{exportNotice}</span>
                </div>
              )}

              {/* Main Action Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Primary Instagram Reel Button */}
                <Button
                  onClick={handleShareInstagramReel}
                  disabled={isExportingVideo}
                  className="h-12 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:from-purple-700 hover:via-pink-700 hover:to-amber-700 text-white font-bold text-sm shadow-md gap-2"
                >
                  <Instagram className="h-4 w-4" />
                  <span>Share Instagram Reel</span>
                </Button>

                {/* 2. WhatsApp Share Button */}
                <Button
                  onClick={handleShareWhatsApp}
                  disabled={isExportingVideo}
                  className="h-12 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-md gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>{i18n.shareWhatsApp}</span>
                </Button>
              </div>

              {/* Secondary Utility Row */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="text-xs text-muted-foreground hover:text-foreground rounded-full gap-1.5"
                >
                  {copiedLink ? (
                    <span className="text-emerald-600 font-bold">{i18n.linkCopied}</span>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-primary" />
                      {i18n.copyProductLink}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
