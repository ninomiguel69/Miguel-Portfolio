/**
 * Canvas View (MVCR - View Layer)
 * Hardware-accelerated canvas renderer with golden-ratio athlete focal snapping
 */

export function getFrameUrl(index) {
  const padded = String(index).padStart(3, '0');
  return `frames/frame-${padded}.webp`;
}

export function getBestFrame(frameImages, index, totalFrames = 300) {
  const target = frameImages[index];
  if (target && target.complete && target.naturalWidth > 0) {
    return target;
  }
  for (let i = index - 1; i >= 0; i--) {
    const f = frameImages[i];
    if (f && f.complete && f.naturalWidth > 0) return f;
  }
  for (let i = index + 1; i < totalFrames; i++) {
    const f = frameImages[i];
    if (f && f.complete && f.naturalWidth > 0) return f;
  }
  return null;
}

export function getCurrentFrameIndex(currentProgress, totalFrames = 300) {
  return Math.min(
    totalFrames - 1,
    Math.max(0, Math.round(currentProgress * (totalFrames - 1)))
  );
}

export function resizeCanvas(canvas, ctx) {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = document.documentElement.clientWidth || window.innerWidth;
  const height = window.innerHeight;

  const targetWidth = Math.round(width * dpr);
  const targetHeight = Math.round(height * dpr);

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
}

export function drawFrame(canvas, ctx, frameImages, frameIdx, totalFrames = 300) {
  if (!canvas || !ctx) return;
  const img = getBestFrame(frameImages, frameIdx, totalFrames);
  if (!img) return;

  const cw = canvas.width;
  const ch = canvas.height;
  const iw = img.naturalWidth || 1280;
  const ih = img.naturalHeight || 720;

  const scale = Math.max(cw / iw, ch / ih);
  const renderW = Math.round(iw * scale);
  const renderH = Math.round(ih * scale);
  const offsetX = Math.round((cw - renderW) * 0.5);
  const offsetY = Math.round((ch - renderH) * 0.35); // Golden-ratio athlete focal center

  ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
}
