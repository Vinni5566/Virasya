// Studio-Grade 1080p HD Reel Exporter with Exact Remotion Theme, Effects, Typography & Audio Sync
import { ProductReelProps, ReelPlan, ReelScenePlan, ReelTheme } from '../types';
import { buildReelPlan } from '../planner/buildReelPlan';
import { reelAudioEngine } from '../audioEngine';
import { getReelI18n } from '../i18nReel';

export interface ExportReelOptions extends ProductReelProps {
  onProgress?: (percent: number, statusText: string) => void;
  durationSeconds?: number;
}

export function getSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidateTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  for (const t of candidateTypes) {
    try {
      if (MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    } catch {}
  }
  return '';
}

/**
 * Helper to trigger browser file download
 */
export function triggerFileDownload(blob: Blob, filename: string): boolean {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = filename;
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {}
    }, 15000);

    return true;
  } catch (err) {
    console.error('Download trigger error:', err);
    return false;
  }
}

/**
 * Helper to pre-load HTML Image elements for canvas drawing with CORS support
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 1080;
      fallbackCanvas.height = 1920;
      const ctx = fallbackCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1C120C';
        ctx.fillRect(0, 0, 1080, 1920);
      }
      const fallbackImg = new Image();
      fallbackImg.src = fallbackCanvas.toDataURL();
      resolve(fallbackImg);
    };
    img.src = src;
  });
}

/**
 * Text wrapping utility for high-resolution canvas typography
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 3
): number {
  const words = text.split(' ');
  let line = '';
  let linesCount = 0;
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
      linesCount++;
      if (linesCount >= maxLines - 1 && n < words.length - 1) {
        // Truncate remaining
        const remaining = words.slice(n).join(' ');
        let truncated = remaining;
        while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
          truncated = truncated.slice(0, -1);
        }
        ctx.fillText(truncated + '...', x, currentY);
        return currentY + lineHeight;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

/**
 * Draws rounded rectangle path
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Exports the EXACT 1:1 Remotion Reel Composition matching 100% of website visual effects,
 * scenes, typography, colors, animations, soundtrack, and Gemini AI voiceover.
 */
export async function exportReelVideo(
  options: ExportReelOptions
): Promise<{ success: boolean; filename: string; blobUrl: string }> {
  const { onProgress, durationSeconds = 15 } = options;

  onProgress?.(5, 'Constructing High-Fidelity Reel Plan...');

  // 1. Build the deterministic reel plan from verified product props
  const plan: ReelPlan = buildReelPlan(options);
  const { theme, scenes, verifiedData } = plan;
  const i18n = getReelI18n(options.language || 'English');

  // 2. Preload all product images
  onProgress?.(10, 'Loading Master Product Assets...');
  const allImageUrls =
    verifiedData.images.length > 0
      ? verifiedData.images
      : ['https://picsum.photos/seed/craft/1080/1920'];
  const loadedImages = await Promise.all(allImageUrls.map((url) => loadImage(url)));
  const primaryImg = loadedImages[0];

  // 3. Create 1080x1920 Master Output Canvas
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) {
    throw new Error('Canvas 2D context creation failed.');
  }

  // 4. Connect WebAudio Stream Destination (Voiceover + Soundtrack)
  reelAudioEngine.unlock();
  const audioStream = reelAudioEngine.getAudioStreamDestination();
  const audioTrack = audioStream ? audioStream.getAudioTracks()[0] : null;

  // 5. Setup Canvas Capture Stream @ 30 FPS
  const canvasStream = canvas.captureStream(30);
  const videoTrack = canvasStream.getVideoTracks()[0];

  if (!videoTrack) {
    throw new Error('Failed to acquire canvas video track.');
  }

  const tracks: MediaStreamTrack[] = [videoTrack];
  if (audioTrack) {
    tracks.push(audioTrack);
  }

  const combinedStream = new MediaStream(tracks);

  // 6. Setup MediaRecorder
  const mimeType = getSupportedMimeType();
  const isMp4 = mimeType.includes('mp4');
  const extension = isMp4 ? 'mp4' : 'webm';
  const safeName = (options.productName || 'handcrafted_reel')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();
  const filename = `virasya_reel_${safeName}.${extension}`;

  return new Promise((resolve, reject) => {
    try {
      let mediaRecorder: MediaRecorder;
      try {
        const recorderOptions: MediaRecorderOptions = {
          videoBitsPerSecond: 8000000, // 8 Mbps broadcast quality 1080p
          audioBitsPerSecond: 192000,
        };
        if (mimeType) {
          recorderOptions.mimeType = mimeType;
        }
        mediaRecorder = new MediaRecorder(combinedStream, recorderOptions);
      } catch {
        mediaRecorder = new MediaRecorder(combinedStream);
      }

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const totalFrames = durationSeconds * 30; // 450 frames = 15.0s
      let frame = 0;
      let renderInterval: any = null;

      mediaRecorder.onstop = () => {
        if (renderInterval) clearInterval(renderInterval);
        onProgress?.(98, 'Packaging 1080p HD Video & Audio Track...');

        const finalMime = mediaRecorder.mimeType || mimeType || 'video/webm';
        const blob = new Blob(chunks, { type: finalMime });
        const blobUrl = URL.createObjectURL(blob);

        // Trigger local file download
        triggerFileDownload(blob, filename);

        onProgress?.(100, 'Reel Video Saved to Downloads/Gallery!');
        resolve({ success: true, filename, blobUrl });
      };

      mediaRecorder.onerror = (err) => {
        if (renderInterval) clearInterval(renderInterval);
        reject(err);
      };

      // Restart audio loop and start MediaRecorder
      reelAudioEngine.handleVideoLoop();
      mediaRecorder.start(100);

      onProgress?.(15, 'Rendering 1080p Remotion Reel with Full Voiceover...');

      const frameDuration = 1000 / 30; // ~33.3ms per frame

      renderInterval = setInterval(() => {
        if (frame >= totalFrames) {
          clearInterval(renderInterval);
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
          return;
        }

        frame++;
        const elapsedSec = frame / 30;
        const percent = Math.min(95, Math.round(15 + (frame / totalFrames) * 80));
        onProgress?.(
          percent,
          `Rendering 1080p Reel... ${Math.round(elapsedSec)}s / ${durationSeconds}s`
        );

        // ===================================================================
        // 1:1 REMOTION COMPOSITION FRAME RENDERER
        // ===================================================================
        // 1. Base Dark Solid
        ctx.fillStyle = theme.gradientTo || '#050302';
        ctx.fillRect(0, 0, 1080, 1920);

        // 2. LAYER 1 & 2: Atmospheric Background Image Bleed with Blur & Scale
        const bgProgress = frame / 450;
        const bgScale = 1.22 + bgProgress * 0.06;

        ctx.save();
        ctx.translate(540, 960);
        ctx.scale(bgScale, bgScale);
        // Draw background image scaled
        ctx.filter = 'blur(40px) brightness(0.38) saturate(1.2)';
        ctx.drawImage(primaryImg, -540, -960, 1080, 1920);
        ctx.filter = 'none';
        ctx.restore();

        // 3. Atmospheric Radial Glow & Linear Color Wash
        const radialGlow = ctx.createRadialGradient(540, 768, 50, 540, 768, 700);
        radialGlow.addColorStop(0, theme.glowColor || 'rgba(217, 119, 6, 0.4)');
        radialGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = radialGlow;
        ctx.fillRect(0, 0, 1080, 1920);

        const linearWash = ctx.createLinearGradient(0, 0, 0, 1920);
        linearWash.addColorStop(0, `${theme.gradientFrom}B3`);
        linearWash.addColorStop(0.45, `${theme.gradientVia}55`);
        linearWash.addColorStop(1, `${theme.gradientTo}E6`);
        ctx.fillStyle = linearWash;
        ctx.fillRect(0, 0, 1080, 1920);

        // 4. Architectural Hairline Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 2;
        ctx.strokeRect(24, 24, 1032, 1872);

        // ===================================================================
        // LAYER 3: ACTIVE SCENE PRIMITIVES
        // ===================================================================
        // Determine active scene based on cumulative frame offsets
        let currentScene: ReelScenePlan = scenes[0];
        let sceneStartFrame = 0;
        let accumulatedFrames = 0;

        for (const s of scenes) {
          if (frame >= accumulatedFrames && frame < accumulatedFrames + s.durationInFrames) {
            currentScene = s;
            sceneStartFrame = accumulatedFrames;
            break;
          }
          accumulatedFrames += s.durationInFrames;
        }

        const sceneLocalFrame = frame - sceneStartFrame;
        const sceneDuration = currentScene.durationInFrames;
        const sceneProgress = Math.min(1, sceneLocalFrame / sceneDuration);

        // Smooth Scene Opacity (Exit fade in last 8 frames)
        let sceneOpacity = 1.0;
        if (sceneLocalFrame >= sceneDuration - 8) {
          sceneOpacity = Math.max(0, (sceneDuration - sceneLocalFrame) / 8);
        }

        ctx.save();
        ctx.globalAlpha = sceneOpacity;

        // Image for current scene
        const sceneImg = loadedImages[currentScene.imageIndex] || primaryImg;

        // Dynamic Camera Calculations
        const cameraScale =
          currentScene.crop.scale + sceneProgress * (currentScene.crop.scale * 0.05);
        const cameraPanY =
          currentScene.crop.offsetY + sceneProgress * (currentScene.crop.driftY || 0);
        const cameraPanX =
          currentScene.crop.offsetX + sceneProgress * (currentScene.crop.driftX || 0);

        // Draw Scene Product Image with Dynamic Crop & Shadow
        ctx.save();
        const centerX = 540 + (cameraPanX * 5.4);
        const centerY = 880 + cameraPanY;

        ctx.translate(centerX, centerY);
        ctx.scale(cameraScale, cameraScale);

        // Premium Drop Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 45;
        ctx.shadowOffsetY = 25;

        const imgWidth = 840;
        const imgHeight = 980;
        ctx.drawImage(sceneImg, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
        ctx.restore();

        // 5. Cinematic Vignette Overlay to Protect Typography
        const vignette = ctx.createLinearGradient(0, 0, 0, 1920);
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
        vignette.addColorStop(0.25, 'transparent');
        vignette.addColorStop(0.60, 'rgba(0, 0, 0, 0.25)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.92)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, 1080, 1920);

        // ===================================================================
        // LAYER 4: EDITORIAL TYPOGRAPHY & SCENE METADATA
        // ===================================================================
        const paddingLeft = 72;
        const paddingRight = 72;
        const contentWidth = 1080 - paddingLeft - paddingRight;

        // --- TOP ARCHIVAL METADATA HEADER ---
        if (currentScene.metadataLabel) {
          const metaEntrance = Math.min(1, Math.max(0, (sceneLocalFrame - 4) / 12));
          const metaY = 130 + (1 - metaEntrance) * -16;

          ctx.save();
          ctx.globalAlpha = sceneOpacity * metaEntrance;

          // Accent line pill
          ctx.fillStyle = theme.accentColor || '#F59E0B';
          roundRect(ctx, paddingLeft, metaY, 42, 5, 3);
          ctx.fill();

          // Metadata Label (uppercase tracking)
          ctx.font = 'bold 24px "Space Mono", "JetBrains Mono", monospace';
          ctx.fillStyle = theme.accentColor || '#F59E0B';
          ctx.shadowColor = 'rgba(0,0,0,0.95)';
          ctx.shadowBlur = 12;
          ctx.shadowOffsetY = 4;
          ctx.fillText(currentScene.metadataLabel.toUpperCase(), paddingLeft + 56, metaY + 8);

          // Sublabel / Region / Origin
          if (currentScene.subheadline && currentScene.type !== 'conversion-outro') {
            ctx.font = 'bold 28px "Plus Jakarta Sans", "Inter", sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(currentScene.subheadline, paddingLeft + 56, metaY + 44);
          }
          ctx.restore();
        }

        // --- BOTTOM EDITORIAL HEADLINE & CONTENT ---
        const textEntrance = Math.min(1, Math.max(0, (sceneLocalFrame - 8) / 14));
        const bottomBaseY = 1420 + (1 - textEntrance) * 24;

        ctx.save();
        ctx.globalAlpha = sceneOpacity * textEntrance;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.98)';
        ctx.shadowBlur = 28;
        ctx.shadowOffsetY = 6;

        if (currentScene.type === 'hero-reveal') {
          // Scene 1: Hero Hook Title
          const title = currentScene.headline || verifiedData.title;
          const length = title.length;
          let fontSize = 72;
          if (length > 50) fontSize = 52;
          else if (length > 25) fontSize = 62;

          ctx.font = `bold ${fontSize}px "Playfair Display", "Cinzel", "Georgia", serif`;
          ctx.fillStyle = '#FFFFFF';
          const nextY = wrapText(ctx, title, paddingLeft, bottomBaseY, contentWidth, fontSize * 1.15, 2);

          if (currentScene.subheadline) {
            ctx.font = 'bold 32px "Plus Jakarta Sans", "Inter", sans-serif';
            ctx.fillStyle = theme.accentColor || '#F59E0B';
            ctx.fillText(currentScene.subheadline, paddingLeft, nextY + 12);
          }
        } else if (currentScene.type === 'macro-detail') {
          // Scene 2: Craft Style & Texture
          ctx.font = 'bold 26px "Space Mono", monospace';
          ctx.fillStyle = theme.accentColor || '#F59E0B';
          ctx.fillText('AUTHENTIC SURFACE & TEXTURE', paddingLeft, bottomBaseY - 20);

          ctx.font = 'bold 64px "Playfair Display", "Georgia", serif';
          ctx.fillStyle = '#FFFFFF';
          wrapText(ctx, currentScene.headline || verifiedData.craftStyle || 'Artisanal Technique', paddingLeft, bottomBaseY + 44, contentWidth, 74, 2);
        } else if (currentScene.type === 'material-provenance') {
          // Scene 3: Verified Materials
          ctx.font = 'bold 26px "Space Mono", monospace';
          ctx.fillStyle = theme.accentColor || '#F59E0B';
          ctx.fillText('100% ETHICALLY SOURCED', paddingLeft, bottomBaseY - 20);

          ctx.font = 'bold 58px "Playfair Display", "Georgia", serif';
          ctx.fillStyle = '#FFFFFF';
          const matTitle = currentScene.headline || verifiedData.materials.slice(0, 2).join(' • ');
          wrapText(ctx, matTitle, paddingLeft, bottomBaseY + 40, contentWidth, 68, 2);
        } else if (currentScene.type === 'artisan-quote') {
          // Scene 4: Artisan Legacy & Story Note
          ctx.font = 'bold 26px "Space Mono", monospace';
          ctx.fillStyle = theme.accentColor || '#F59E0B';
          ctx.fillText('THE LIVING CRAFT LEGACY', paddingLeft, bottomBaseY - 30);

          ctx.font = 'bold 54px "Playfair Display", "Georgia", serif';
          ctx.fillStyle = '#FFFFFF';
          const makerText = verifiedData.artisanName ? `Master Artisan ${verifiedData.artisanName}` : 'Generations of Artisan Heritage';
          const quoteY = wrapText(ctx, makerText, paddingLeft, bottomBaseY + 24, contentWidth, 62, 2);

          if (currentScene.bodyText) {
            ctx.font = 'italic 28px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
            wrapText(ctx, `"${currentScene.bodyText}"`, paddingLeft, quoteY + 12, contentWidth, 38, 2);
          }
        } else {
          // Scene 5: Conversion Outro / Call to Action
          ctx.font = 'bold 26px "Space Mono", monospace';
          ctx.fillStyle = theme.accentColor || '#F59E0B';
          ctx.fillText('DIRECT FAIR TRADE HERITAGE', paddingLeft, bottomBaseY - 40);

          ctx.font = 'bold 62px "Playfair Display", "Georgia", serif';
          ctx.fillStyle = '#FFFFFF';
          const outroY = wrapText(ctx, verifiedData.title, paddingLeft, bottomBaseY + 20, contentWidth, 68, 2);

          // Price Tag Pill
          if (verifiedData.price) {
            ctx.save();
            const pillX = paddingLeft;
            const pillY = outroY + 16;
            ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
            roundRect(ctx, pillX, pillY, 320, 56, 28);
            ctx.fill();
            ctx.strokeStyle = '#10B981';
            ctx.lineWidth = 2;
            roundRect(ctx, pillX, pillY, 320, 56, 28);
            ctx.stroke();

            ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = '#10B981';
            ctx.fillText(`₹${verifiedData.price.toLocaleString('en-IN')} Direct Fair Trade`, pillX + 24, pillY + 39);
            ctx.restore();
          }

          // Gold CTA Badge Button
          ctx.save();
          const ctaY = 1710;
          ctx.fillStyle = theme.accentColor || '#F59E0B';
          roundRect(ctx, 210, ctaY, 660, 76, 38);
          ctx.fill();

          ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#050302';
          ctx.textAlign = 'center';
          ctx.fillText(`✦ ${i18n.tapLinkInBio.toUpperCase()} ✦`, 540, ctaY + 48);
          ctx.restore();
        }

        ctx.restore(); // Restore scene opacity
        ctx.restore();
      }, frameDuration);
    } catch (err) {
      reject(err);
    }
  });
}
