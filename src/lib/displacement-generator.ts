/**
 * Render text or image to a grayscale canvas for use as a displacement map.
 * Returns both the canvas pixel data and a data URL for use as a texture.
 */
export async function generateDisplacementMap({
  text,
  image,
  width = 256,
  height = 256,
  font = 'bold 96px Arial',
  gradient = false,
}: {
  text?: string;
  image?: HTMLImageElement | File | string;
  width?: number;
  height?: number;
  font?: string;
  gradient?: boolean;
}): Promise<{ dataUrl: string; pixels: Uint8ClampedArray }> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Fill background black (engraving = white is high, black is deep)
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  if (gradient && !text && !image) {
    // Draw a radial white-to-black gradient (center = white, edge = black)
    const grad = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.min(width, height) / 2
    );
    grad.addColorStop(0, '#fff');
    grad.addColorStop(1, '#000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (text) {
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(text, width / 2, height / 2);
  } else if (image) {
    let img: HTMLImageElement;
    if (typeof image === 'string') {
      img = new window.Image();
      img.src = image;
      await new Promise((resolve) => { img.onload = resolve; });
    } else if (image instanceof File) {
      img = new window.Image();
      img.src = URL.createObjectURL(image);
      await new Promise((resolve) => { img.onload = resolve; });
    } else {
      img = image;
    }
    // Draw image centered
    const aspect = img.width / img.height;
    let drawWidth = width, drawHeight = height;
    if (aspect > 1) {
      drawHeight = width / aspect;
    } else {
      drawWidth = height * aspect;
    }
    ctx.drawImage(img, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    // Convert to grayscale
    const imgData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const avg = (imgData.data[i] + imgData.data[i+1] + imgData.data[i+2]) / 3;
      imgData.data[i] = imgData.data[i+1] = imgData.data[i+2] = avg;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const pixels = ctx.getImageData(0, 0, width, height).data;
  const dataUrl = canvas.toDataURL('image/png');
  return { dataUrl, pixels };
} 