import { FilterType, Photo, Sticker, TextOverlay, TemplateTheme } from '@/types/photobooth';
import { TEMPLATE_CONFIGS } from '@/constants/templates';
import { FrameConfig } from '@/constants/frames';

export const getFilterStyles = (filter: FilterType): string => {
  switch (filter) {
    case 'bw':
      return 'grayscale(100%)';
    case 'sepia':
      return 'sepia(80%) saturate(120%)';
    case 'vintage':
      return 'sepia(30%) contrast(110%) saturate(80%) brightness(105%)';
    case 'pop-art':
      return 'contrast(150%) saturate(200%) brightness(110%)';
    case 'cool':
      return 'saturate(80%) hue-rotate(10deg) brightness(105%)';
    case 'warm':
      return 'saturate(110%) sepia(15%) brightness(105%)';
    case 'cyberpunk':
      return 'contrast(130%) saturate(150%) hue-rotate(300deg) brightness(95%)';
    case 'neon':
      return 'contrast(120%) saturate(200%) brightness(110%) hue-rotate(330deg)';
    case 'vaporwave':
      return 'saturate(180%) hue-rotate(260deg) contrast(90%) brightness(110%)';
    case 'noir':
      return 'grayscale(100%) contrast(140%) brightness(90%)';
    case 'dreamy':
      return 'blur(0.5px) saturate(130%) brightness(115%) contrast(90%)';
    case 'electric':
      return 'saturate(250%) contrast(130%) hue-rotate(180deg) brightness(105%)';
    case 'blur':
      return 'blur(2px) brightness(105%)';
    default:
      return 'none';
  }
};

export const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
};

export const applyFilterToCanvas = async (
  photo: Photo,
  width: number,
  height: number
): Promise<HTMLCanvasElement> => {
  const img = await loadImage(photo.dataUrl);
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');

  if (tempCtx) {
    tempCtx.filter = getFilterStyles(photo.filter);
    const imgAspect = img.width / img.height;
    const targetAspect = width / height;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;

    if (imgAspect > targetAspect) {
      sw = img.height * targetAspect;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / targetAspect;
      sy = (img.height - sh) / 2;
    }

    tempCtx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
  }
  return tempCanvas;
};

export const drawStickers = (
  ctx: CanvasRenderingContext2D,
  stickers: Sticker[],
  photoX: number,
  photoY: number,
  photoWidth: number,
  photoHeight: number
) => {
  stickers.forEach((sticker) => {
    const stickerX = photoX + (sticker.x / 100) * photoWidth;
    const stickerY = photoY + (sticker.y / 100) * photoHeight;
    
    ctx.save();
    ctx.translate(stickerX, stickerY);
    ctx.rotate((sticker.rotation * Math.PI) / 180);
    ctx.font = `${sticker.size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sticker.emoji, 0, 0);
    ctx.restore();
  });
};

export const drawTextOverlays = (
  ctx: CanvasRenderingContext2D,
  textOverlays: TextOverlay[],
  photoX: number,
  photoY: number,
  photoWidth: number,
  photoHeight: number
) => {
  textOverlays.forEach((textOverlay) => {
    const textX = photoX + (textOverlay.x / 100) * photoWidth;
    const textY = photoY + (textOverlay.y / 100) * photoHeight;
    
    ctx.save();
    ctx.translate(textX, textY);
    ctx.rotate((textOverlay.rotation * Math.PI) / 180);
    ctx.font = `bold ${textOverlay.fontSize}px ${textOverlay.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw text shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    ctx.fillStyle = textOverlay.color;
    ctx.fillText(textOverlay.text, 0, 0);
    ctx.restore();
  });
};

export const drawTemplateDecorations = (
  ctx: CanvasRenderingContext2D,
  selectedTemplate: TemplateTheme,
  totalWidth: number,
  totalHeight: number
) => {
  if (selectedTemplate === 'none') return;
  
  const config = TEMPLATE_CONFIGS[selectedTemplate];
  config.decorations.forEach((decoration) => {
    decoration.positions.forEach((pos) => {
      const x = (pos.x / 100) * totalWidth;
      const y = (pos.y / 100) * totalHeight;
      
      ctx.save();
      ctx.translate(x, y);
      if (pos.rotation) {
        ctx.rotate((pos.rotation * Math.PI) / 180);
      }
      ctx.font = `${pos.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(decoration.emoji, 0, 0);
      ctx.restore();
    });
  });
};

export const drawPhotoWithBorder = (
  ctx: CanvasRenderingContext2D,
  filteredCanvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
  frameConfig: FrameConfig,
  selectedFrame: string
) => {
  const { borderTop, borderSide, borderBottom, cornerRadius } = frameConfig;
  const totalWidth = width + borderSide * 2;
  const totalHeight = height + borderTop + borderBottom;
  
  ctx.save();
  
  // Draw white/cream border background
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  
  if (cornerRadius > 0) {
    // Rounded rectangle
    ctx.beginPath();
    ctx.roundRect(x - borderSide, y - borderTop, totalWidth, totalHeight, cornerRadius);
    ctx.fill();
  } else {
    ctx.fillRect(x - borderSide, y - borderTop, totalWidth, totalHeight);
  }
  
  ctx.shadowColor = 'transparent';
  
  // Draw the photo
  if (cornerRadius > 0) {
    // Clip to rounded rectangle for photo
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, Math.max(0, cornerRadius - borderSide));
    ctx.clip();
  }
  ctx.drawImage(filteredCanvas, x, y);
  ctx.restore();
  
  // Add decorative elements based on frame type
  if (selectedFrame === 'vintage') {
    // Corner decorations
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    const cornerSize = 15;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(x - borderSide + 5, y - borderTop + cornerSize + 5);
    ctx.lineTo(x - borderSide + 5, y - borderTop + 5);
    ctx.lineTo(x - borderSide + cornerSize + 5, y - borderTop + 5);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(x + width + borderSide - cornerSize - 5, y - borderTop + 5);
    ctx.lineTo(x + width + borderSide - 5, y - borderTop + 5);
    ctx.lineTo(x + width + borderSide - 5, y - borderTop + cornerSize + 5);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(x - borderSide + 5, y + height + borderBottom - cornerSize - 5);
    ctx.lineTo(x - borderSide + 5, y + height + borderBottom - 5);
    ctx.lineTo(x - borderSide + cornerSize + 5, y + height + borderBottom - 5);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(x + width + borderSide - cornerSize - 5, y + height + borderBottom - 5);
    ctx.lineTo(x + width + borderSide - 5, y + height + borderBottom - 5);
    ctx.lineTo(x + width + borderSide - 5, y + height + borderBottom - cornerSize - 5);
    ctx.stroke();
  }
  
  if (selectedFrame === 'wedding') {
    // Elegant gold line
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - borderSide + 4, y - borderTop + 4, totalWidth - 8, totalHeight - 8);
  }
  
  if (selectedFrame === 'birthday') {
    // Confetti dots
    const colors = ['#FF69B4', '#FFD700', '#00CED1', '#FF6347', '#9370DB'];
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      const dotX = x - borderSide + 6 + (i * (totalWidth - 12) / 7);
      ctx.arc(dotX, y - borderTop + 6, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(dotX, y + height + borderBottom - 6, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

// Draw stickers for GIF frames (without photo offset)
export const drawStickersForGif = (
  ctx: CanvasRenderingContext2D,
  stickers: Sticker[],
  photoWidth: number,
  photoHeight: number
) => {
  stickers.forEach((sticker) => {
    const stickerX = (sticker.x / 100) * photoWidth;
    const stickerY = (sticker.y / 100) * photoHeight;
    
    ctx.save();
    ctx.translate(stickerX, stickerY);
    ctx.rotate((sticker.rotation * Math.PI) / 180);
    ctx.font = `${sticker.size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sticker.emoji, 0, 0);
    ctx.restore();
  });
};

// Draw text overlays for GIF frames (without photo offset)
export const drawTextOverlaysForGif = (
  ctx: CanvasRenderingContext2D,
  textOverlays: TextOverlay[],
  photoWidth: number,
  photoHeight: number
) => {
  textOverlays.forEach((textOverlay) => {
    const textX = (textOverlay.x / 100) * photoWidth;
    const textY = (textOverlay.y / 100) * photoHeight;
    
    ctx.save();
    ctx.translate(textX, textY);
    ctx.rotate((textOverlay.rotation * Math.PI) / 180);
    ctx.font = `bold ${textOverlay.fontSize}px ${textOverlay.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = textOverlay.color;
    ctx.fillText(textOverlay.text, 0, 0);
    ctx.restore();
  });
};
