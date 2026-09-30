import { PosterData } from '../types/poster';

/**
 * High-Resolution Canvas Renderer for Wanted Poster Export
 * Produces a pristine 1200 x 1740 (or 2400 x 3480) printable collector's poster.
 */

// Helper to format number with commas: 130000000 -> "130,000,000"
export function formatBountyNumber(num: number): string {
  if (isNaN(num)) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export async function renderPosterToCanvas(
  data: PosterData,
  parchmentImgSrc?: string,
  targetWidth = 1200,
  targetHeight = 1740
): Promise<HTMLCanvasElement> {
  // Ensure custom web fonts are loaded
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading check error', e);
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2d context');

  const W = targetWidth;
  const H = targetHeight;

  // If Full AI Poster is available, render the generated poster directly
  if (data.fullPosterImageUrl) {
    try {
      const fullImg = await loadImage(data.fullPosterImageUrl);
      ctx.drawImage(fullImg, 0, 0, W, H);
      return canvas;
    } catch (e) {
      console.warn('Could not load full poster image, falling back to composite', e);
    }
  }

  // 1. Draw Parchment Background
  let bgDrawn = false;
  if (parchmentImgSrc) {
    try {
      const bgImg = await loadImage(parchmentImgSrc);
      ctx.drawImage(bgImg, 0, 0, W, H);
      bgDrawn = true;
    } catch {
      bgDrawn = false;
    }
  }

  if (!bgDrawn) {
    // Fallback procedural authentic aged parchment texture
    drawProceduralParchment(ctx, W, H, data.textureTone);
  } else {
    // Add subtle vintage grading overlay depending on tone
    applyToneOverlay(ctx, W, H, data.textureTone);
  }

  // 2. Draw Outer Weathered Border Vignette
  drawAgedBorderVignette(ctx, W, H);

  // 3. Top Title "WANTED"
  ctx.save();
  ctx.fillStyle = '#26170e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Authentic bold condensed serif font
  const wantedFontSize = W * 0.185; // ~222px on 1200w
  ctx.font = `900 ${wantedFontSize}px "Playfair Display", "Rye", "Cinzel Decorative", Georgia, serif`;

  // Draw WANTED with wide tracking
  const wantedText = 'WANTED';
  drawTextWithSpacing(ctx, wantedText, W / 2, H * 0.155, 12);
  ctx.restore();

  // 4. Photo Frame Box
  // Layout coordinates matching reference
  const photoMarginX = W * 0.11; // ~132px
  const photoW = W - photoMarginX * 2; // ~936px
  const photoH = H * 0.44; // ~765px (approx 4:3.2 ratio)
  const photoX = photoMarginX;
  const photoY = H * 0.185; // starts under WANTED

  // Draw Photo Outer Borders
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#26170e';
  ctx.strokeRect(photoX - 4, photoY - 4, photoW + 8, photoH + 8);

  ctx.lineWidth = 2;
  ctx.strokeRect(photoX, photoY, photoW, photoH);
  ctx.restore();

  // Draw Photo Content (User / Preset / AI image)
  if (data.photoUrl) {
    try {
      const photoImg = await loadImage(data.photoUrl);

      ctx.save();
      // Clip inside photo rectangle
      ctx.beginPath();
      ctx.rect(photoX, photoY, photoW, photoH);
      ctx.clip();

      // Apply photo pan, zoom, and rotation
      const centerX = photoX + photoW / 2 + (data.photoPanX / 100) * (photoW / 2);
      const centerY = photoY + photoH / 2 + (data.photoPanY / 100) * (photoH / 2);
      const scale = Math.max(0.2, data.photoScale || 1);

      ctx.translate(centerX, centerY);
      if (data.photoRotate) {
        ctx.rotate((data.photoRotate * Math.PI) / 180);
      }

      // Calculate aspect fill
      const imgAspect = photoImg.width / photoImg.height;
      const boxAspect = photoW / photoH;
      let drawW = photoW * scale;
      let drawH = photoH * scale;

      if (imgAspect > boxAspect) {
        drawW = drawH * imgAspect;
      } else {
        drawH = drawW / imgAspect;
      }

      // Draw photo
      ctx.drawImage(photoImg, -drawW / 2, -drawH / 2, drawW, drawH);

      // Apply Filter effect in Canvas
      applyCanvasPhotoFilter(ctx, -drawW / 2, -drawH / 2, drawW, drawH, data.photoFilter);

      // Subtle vintage film grain overlay on photo
      drawFilmGrainOnArea(ctx, -drawW / 2, -drawH / 2, drawW, drawH);

      ctx.restore();
    } catch (err) {
      console.error('Failed to draw photo on canvas', err);
    }
  } else {
    // Empty photo placeholder
    ctx.save();
    ctx.fillStyle = '#dfcca8';
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.fillStyle = '#6b4f3b';
    ctx.font = '600 32px serif';
    ctx.textAlign = 'center';
    ctx.fillText('NO IMAGE', photoX + photoW / 2, photoY + photoH / 2);
    ctx.restore();
  }

  // Inner shadow vignette inside photo frame
  ctx.save();
  const photoVignette = ctx.createRadialGradient(
    photoX + photoW / 2,
    photoY + photoH / 2,
    photoW * 0.35,
    photoX + photoW / 2,
    photoY + photoH / 2,
    photoW * 0.7
  );
  photoVignette.addColorStop(0, 'rgba(40, 20, 10, 0)');
  photoVignette.addColorStop(1, 'rgba(30, 15, 8, 0.28)');
  ctx.fillStyle = photoVignette;
  ctx.fillRect(photoX, photoY, photoW, photoH);
  ctx.restore();

  // 5. "DEAD OR ALIVE" Banner Section
  const deadOrAliveY = photoY + photoH + H * 0.045; // ~778px + 78px = 856px
  ctx.save();
  ctx.fillStyle = '#26170e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${W * 0.052}px "Playfair Display", "Cinzel", Georgia, serif`;

  // Draw "DEAD OR ALIVE" with classic spacing
  const deadText = 'DEAD OR ALIVE';
  drawTextWithSpacing(ctx, deadText, W / 2, deadOrAliveY, 8);

  // Draw left and right ornamental flourishes flanking "DEAD OR ALIVE"
  drawDeadOrAliveFlourishes(ctx, W / 2, deadOrAliveY, W * 0.32);
  ctx.restore();

  // 6. Character Name ("Nama Karakter")
  // In the reference, large woodblock serif, perfectly centered
  const nameY = deadOrAliveY + H * 0.088; // ~H * 0.73
  ctx.save();
  ctx.fillStyle = '#24140b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const charName = (data.characterName || 'UNKNOWN').toUpperCase();
  // Dynamically shrink font size if name is long
  let nameFontSize = W * 0.095; // ~114px for typical names like NICO ROBIN
  if (charName.length > 12) {
    nameFontSize = (W * 0.095 * 12) / charName.length;
  }
  ctx.font = `900 ${nameFontSize}px "Playfair Display", "Cinzel Decorative", "Rye", Georgia, serif`;
  drawTextWithSpacing(ctx, charName, W / 2, nameY, 6);
  ctx.restore();

  // 7. Character Epithet ("Gelar Karakter") - NEW REQUIREMENT!
  // Placed directly below Character Name
  const epithetY = nameY + H * 0.052; // ~H * 0.78
  if (data.epithet && data.epithet.trim()) {
    ctx.save();
    ctx.fillStyle = '#3a2114';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const epithetText = `« ${data.epithet.toUpperCase().trim()} »`;
    let epFontSize = W * 0.038; // ~45px
    if (epithetText.length > 25) {
      epFontSize = (W * 0.038 * 25) / epithetText.length;
    }
    ctx.font = `700 italic ${epFontSize}px "Cinzel", "Playfair Display", Georgia, serif`;
    drawTextWithSpacing(ctx, epithetText, W / 2, epithetY, 4);
    ctx.restore();
  }

  // 8. Bounty Section (Berry Symbol + Formatted Number + Hyphen "-")
  const bountyY = epithetY + H * 0.075; // ~H * 0.86
  ctx.save();
  ctx.fillStyle = '#26170e';
  ctx.textBaseline = 'middle';

  const formattedBounty = `${formatBountyNumber(data.bounty || 0)}-`;

  // Measure text to center Berry symbol + text together
  ctx.font = `900 ${W * 0.082}px "Rye", "Playfair Display", Georgia, serif`;
  const bountyTextWidth = ctx.measureText(formattedBounty).width;
  const berrySymbolWidth = W * 0.058;
  const totalBountyWidth = berrySymbolWidth + 14 + bountyTextWidth;
  const startBountyX = (W - totalBountyWidth) / 2;

  // Draw Berry symbol
  drawBerrySymbolCanvas(ctx, startBountyX, bountyY - berrySymbolWidth * 0.7, berrySymbolWidth, berrySymbolWidth * 1.4);

  // Draw bounty number
  ctx.textAlign = 'left';
  drawTextWithSpacing(ctx, formattedBounty, startBountyX + berrySymbolWidth + 16, bountyY, 4);
  ctx.restore();

  // 9. Side Ornate Filigree Vines (Framing lower half of poster)
  drawSideFiligreeCanvas(ctx, W * 0.07, H * 0.64, W * 0.05, H * 0.28, false); // Left
  drawSideFiligreeCanvas(ctx, W * 0.93, H * 0.64, W * 0.05, H * 0.28, true); // Right (mirrored)

  // 10. Bottom Footer: Notice text on left & "MARINE" label on right
  drawPosterFooter(
    ctx,
    W,
    H,
    data.bottomNotice || 'Bapack-bapack deadstar',
    data.marineText || 'MARINE'
  );

  return canvas;
}

// Draw authentic bottom footer: small disclaimer on left, bold "MARINE" on right
export function drawPosterFooter(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  bottomNotice = 'Bapack-bapack deadstar',
  marineText = 'MARINE'
) {
  ctx.save();

  // 1. Right corner: "MARINE" in bold woodblock serif
  const marineStr = (marineText || 'MARINE').toUpperCase();
  ctx.fillStyle = '#26170e';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  const marineFontSize = W * 0.054;
  ctx.font = `900 ${marineFontSize}px "Playfair Display", "Cinzel Decorative", "Rye", Georgia, serif`;

  const marineRightX = W * 0.92;
  const marineBottomY = H * 0.956;
  drawTextWithSpacing(ctx, marineStr, marineRightX - (marineStr.length * 3.5), marineBottomY, 3);

  // 2. Left corner: 3 lines of small vintage disclaimer text replaced with Bapack-bapack deadstar
  const noticeStr = (bottomNotice || 'Bapack-bapack deadstar').toUpperCase();
  ctx.fillStyle = '#26170e';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const noticeFontSize = W * 0.013;
  ctx.font = `700 ${noticeFontSize}px "Playfair Display", "Cinzel", Georgia, serif`;

  const noticeX = W * 0.082;
  const lineSpacing = noticeFontSize * 1.35;
  const line3Y = H * 0.952;
  const line2Y = line3Y - lineSpacing;
  const line1Y = line2Y - lineSpacing;

  ctx.fillText('IF YOU HAVE ANY INFORMATION CONCERNING THIS PERSON PLEASE CONTACT YOUR LOCAL', noticeX, line1Y);
  ctx.fillText(`${noticeStr} OR CONTACT US VIA DEN DEN MUSHI ☎ 011-81-53-7544-2324`, noticeX, line2Y);
  ctx.fillText(`CAUTION: ANY INDIVIDUAL FEATURED ON ${noticeStr} IS CONSIDERED DANGEROUS`, noticeX, line3Y);

  ctx.restore();
}

// Draw spaced text for woodblock typography
function drawTextWithSpacing(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number
) {
  const characters = text.split('');
  let totalWidth = 0;
  const widths: number[] = [];

  for (let i = 0; i < characters.length; i++) {
    const w = ctx.measureText(characters[i]).width;
    widths.push(w);
    totalWidth += w;
    if (i < characters.length - 1) {
      totalWidth += spacing;
    }
  }

  let currentX = x - totalWidth / 2;
  for (let i = 0; i < characters.length; i++) {
    ctx.fillText(characters[i], currentX + widths[i] / 2, y);
    currentX += widths[i] + spacing;
  }
}

// Procedural aged parchment texture generator
function drawProceduralParchment(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  tone: string
) {
  // Base parchment gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  if (tone === 'dark-weathered') {
    bgGrad.addColorStop(0, '#d2b998');
    bgGrad.addColorStop(0.5, '#c5a782');
    bgGrad.addColorStop(1, '#b6976f');
  } else if (tone === 'golden-papyrus') {
    bgGrad.addColorStop(0, '#f2e0bd');
    bgGrad.addColorStop(0.5, '#e4cd9f');
    bgGrad.addColorStop(1, '#d8bc88');
  } else {
    // authentic Robin reference tone
    bgGrad.addColorStop(0, '#e5d1b7');
    bgGrad.addColorStop(0.5, '#ddc5a4');
    bgGrad.addColorStop(1, '#d0b38c');
  }

  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Add subtle aged watercolor grunge spots
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  for (let i = 0; i < 45; i++) {
    const spotX = (Math.sin(i * 123.4) * 0.5 + 0.5) * W;
    const spotY = (Math.cos(i * 87.2) * 0.5 + 0.5) * H;
    const radius = 60 + (i % 7) * 45;
    const spotGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, radius);
    spotGrad.addColorStop(0, 'rgba(180, 140, 95, 0.12)');
    spotGrad.addColorStop(0.8, 'rgba(180, 140, 95, 0.03)');
    spotGrad.addColorStop(1, 'rgba(180, 140, 95, 0)');
    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.arc(spotX, spotY, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function applyToneOverlay(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  tone: string
) {
  ctx.save();
  if (tone === 'dark-weathered') {
    ctx.fillStyle = 'rgba(70, 45, 25, 0.18)';
    ctx.fillRect(0, 0, W, H);
  } else if (tone === 'golden-papyrus') {
    ctx.fillStyle = 'rgba(235, 180, 80, 0.1)';
    ctx.fillRect(0, 0, W, H);
  } else if (tone === 'aged-sepia') {
    ctx.fillStyle = 'rgba(140, 90, 50, 0.12)';
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

// Aged border vignette
function drawAgedBorderVignette(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.save();
  const vignette = ctx.createRadialGradient(
    W / 2,
    H / 2,
    Math.min(W, H) * 0.45,
    W / 2,
    H / 2,
    Math.max(W, H) * 0.72
  );
  vignette.addColorStop(0, 'rgba(60, 35, 18, 0)');
  vignette.addColorStop(0.7, 'rgba(60, 35, 18, 0.18)');
  vignette.addColorStop(1, 'rgba(40, 20, 10, 0.45)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Flourishes flanking "DEAD OR ALIVE"
function drawDeadOrAliveFlourishes(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  offset: number
) {
  ctx.save();
  ctx.strokeStyle = '#26170e';
  ctx.fillStyle = '#26170e';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';

  // Left flourish
  const leftX = centerX - offset;
  ctx.beginPath();
  ctx.moveTo(leftX, centerY);
  ctx.bezierCurveTo(leftX - 30, centerY - 15, leftX - 60, centerY + 20, leftX - 90, centerY - 5);
  ctx.bezierCurveTo(leftX - 105, centerY - 18, leftX - 120, centerY, leftX - 110, centerY + 15);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(leftX - 110, centerY + 15, 4, 0, Math.PI * 2);
  ctx.fill();

  // Right flourish (mirror)
  const rightX = centerX + offset;
  ctx.beginPath();
  ctx.moveTo(rightX, centerY);
  ctx.bezierCurveTo(rightX + 30, centerY - 15, rightX + 60, centerY + 20, rightX + 90, centerY - 5);
  ctx.bezierCurveTo(rightX + 105, centerY - 18, rightX + 120, centerY, rightX + 110, centerY + 15);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(rightX + 110, centerY + 15, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Berry Symbol drawing
function drawBerrySymbolCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.fillStyle = '#26170e';
  ctx.strokeStyle = '#26170e';

  // Two vertical strokes
  const strokeW = Math.max(2, w * 0.09);
  ctx.fillRect(x + w * 0.35, y, strokeW, h);
  ctx.fillRect(x + w * 0.52, y, strokeW, h);

  // Capital B with serif
  ctx.lineWidth = Math.max(3, w * 0.16);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Main vertical spine
  ctx.beginPath();
  ctx.moveTo(x + w * 0.22, y + h * 0.12);
  ctx.lineTo(x + w * 0.22, y + h * 0.88);
  ctx.stroke();

  // Top loop
  ctx.beginPath();
  ctx.moveTo(x + w * 0.22, y + h * 0.18);
  ctx.bezierCurveTo(x + w * 0.75, y + h * 0.18, x + w * 0.75, y + h * 0.48, x + w * 0.22, y + h * 0.48);
  ctx.stroke();

  // Bottom loop
  ctx.beginPath();
  ctx.moveTo(x + w * 0.22, y + h * 0.48);
  ctx.bezierCurveTo(x + w * 0.85, y + h * 0.48, x + w * 0.85, y + h * 0.82, x + w * 0.22, y + h * 0.82);
  ctx.stroke();

  ctx.restore();
}

// Side ornate filigree
function drawSideFiligreeCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  isMirrored: boolean
) {
  ctx.save();
  ctx.translate(x, y);
  if (isMirrored) {
    ctx.scale(-1, 1);
  }

  ctx.strokeStyle = '#26170e';
  ctx.fillStyle = '#26170e';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-w * 0.8, h * 0.2, w * 0.8, h * 0.5, -w * 0.4, h * 0.8);
  ctx.bezierCurveTo(-w * 0.9, h * 0.9, -w * 0.2, h * 0.98, -w * 0.5, h);
  ctx.stroke();

  // Decorative curl terminals
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(-w * 0.5, h, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Photo filter simulator on canvas
function applyCanvasPhotoFilter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  filter: string
) {
  if (filter === 'none') return;

  ctx.save();
  if (filter === 'vintage-sepia') {
    // Matches Robin reference image
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = 'rgba(165, 125, 85, 0.42)';
    ctx.fillRect(x, y, w, h);

    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(230, 210, 180, 0.3)';
    ctx.fillRect(x, y, w, h);
  } else if (filter === 'anime-cel') {
    // Vibrant with bold cel contrast
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255, 230, 190, 0.25)';
    ctx.fillRect(x, y, w, h);
  } else if (filter === 'manga-sketch') {
    // High contrast monochrome sketch
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = 'hsl(0, 0%, 0%)';
    ctx.fillRect(x, y, w, h);

    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(80, 80, 80, 0.35)';
    ctx.fillRect(x, y, w, h);
  } else if (filter === 'faded-sun') {
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(240, 200, 150, 0.18)';
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}

// Film grain on photo
function drawFilmGrainOnArea(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = 'rgba(100, 70, 40, 0.08)';
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// Image loader utility
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}
