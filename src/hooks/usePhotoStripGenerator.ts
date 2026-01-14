import { useRef, useEffect, useState, useMemo } from 'react';
import { Photo, TemplateTheme } from '@/types/photobooth';
import { LayoutType } from '@/constants/layouts';
import { FrameStyle, FrameConfig, getFrameConfig } from '@/constants/frames';
import { TEMPLATE_CONFIGS } from '@/constants/templates';
import {
  applyFilterToCanvas,
  drawStickers,
  drawTextOverlays,
  drawTemplateDecorations,
  drawPhotoWithBorder,
} from '@/lib/canvas-utils';

interface UsePhotoStripGeneratorProps {
  photos: Photo[];
  selectedLayout: LayoutType;
  selectedFrame: FrameStyle;
  selectedTemplate: TemplateTheme;
  debouncedHeaderText: string;
  debouncedFooterText: string;
}

export const usePhotoStripGenerator = ({
  photos,
  selectedLayout,
  selectedFrame,
  selectedTemplate,
  debouncedHeaderText,
  debouncedFooterText,
}: UsePhotoStripGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [stripDataUrl, setStripDataUrl] = useState<string | null>(null);

  const templateConfig = TEMPLATE_CONFIGS[selectedTemplate];

  // Memoize frame config to prevent infinite re-renders
  const frameConfig: FrameConfig = useMemo(() => getFrameConfig(
    selectedFrame,
    selectedTemplate !== 'none' ? templateConfig.bgColor : undefined,
    selectedTemplate !== 'none' ? templateConfig.accentColor : undefined
  ), [selectedFrame, selectedTemplate, templateConfig.bgColor, templateConfig.accentColor]);

  // Memoize header text
  const headerText = useMemo(() => {
    if (debouncedHeaderText.trim()) {
      return debouncedHeaderText.trim();
    }
    if (selectedTemplate !== 'none') {
      return templateConfig.headerText;
    }
    return '✨ Photo Booth ✨';
  }, [debouncedHeaderText, selectedTemplate, templateConfig.headerText]);

  // Memoize footer text
  const footerText = useMemo(() => {
    if (debouncedFooterText.trim()) {
      return debouncedFooterText.trim();
    }
    if (selectedTemplate !== 'none' && templateConfig.footerText) {
      return templateConfig.footerText;
    }
    return '';
  }, [debouncedFooterText, selectedTemplate, templateConfig.footerText]);

  // Memoize font
  const font = useMemo(() => {
    if (selectedTemplate !== 'none') {
      return templateConfig.font;
    }
    return 'Poppins, sans-serif';
  }, [selectedTemplate, templateConfig.font]);

  useEffect(() => {
    const generatePhotoStrip = async () => {
      setIsGenerating(true);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      // Layout configurations
      if (selectedLayout === 'vertical') {
        const photoWidth = 400;
        const photoHeight = 300;
        const padding = 20;
        const stripPadding = 40;
        const headerHeight = 60;
        const footerHeight = 80;

        const totalWidth = photoWidth + stripPadding * 2;
        const totalHeight = headerHeight + photos.length * photoHeight + (photos.length - 1) * padding + footerHeight + stripPadding * 2;

        canvas.width = totalWidth;
        canvas.height = totalHeight;

        ctx.fillStyle = frameConfig.bgColor;
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        drawTemplateDecorations(ctx, selectedTemplate, totalWidth, totalHeight);

        ctx.fillStyle = frameConfig.accentColor;
        ctx.font = `bold 24px ${font}`;
        ctx.textAlign = 'center';
        ctx.fillText(headerText, totalWidth / 2, stripPadding + 35);

        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          const filteredCanvas = await applyFilterToCanvas(photo, photoWidth, photoHeight);
          const x = stripPadding;
          const y = headerHeight + stripPadding + i * (photoHeight + padding);
          drawPhotoWithBorder(ctx, filteredCanvas, x, y, photoWidth, photoHeight, frameConfig, selectedFrame);
          drawStickers(ctx, photo.stickers, x, y, photoWidth, photoHeight);
          drawTextOverlays(ctx, photo.textOverlays, x, y, photoWidth, photoHeight);
        }

        if (footerText) {
          ctx.fillStyle = frameConfig.accentColor;
          ctx.font = `bold 16px ${font}`;
          ctx.textAlign = 'center';
          ctx.fillText(footerText, totalWidth / 2, totalHeight - stripPadding - 45);
        }
        
        ctx.fillStyle = '#6B7280';
        ctx.font = '14px Quicksand, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(date, totalWidth / 2, totalHeight - stripPadding - 20);
        ctx.fillStyle = frameConfig.accentColor;
        ctx.font = '18px sans-serif';
        ctx.fillText('♥', totalWidth / 2, totalHeight - stripPadding);

      } else if (selectedLayout === 'grid') {
        const photoSize = 350;
        const padding = 20;
        const stripPadding = 50;
        const headerHeight = 70;
        const footerHeight = 70;

        const totalWidth = photoSize * 2 + padding + stripPadding * 2;
        const totalHeight = headerHeight + photoSize * 2 + padding + footerHeight + stripPadding * 2;

        canvas.width = totalWidth;
        canvas.height = totalHeight;

        ctx.fillStyle = frameConfig.bgColor;
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        drawTemplateDecorations(ctx, selectedTemplate, totalWidth, totalHeight);

        ctx.fillStyle = frameConfig.accentColor;
        ctx.font = `bold 28px ${font}`;
        ctx.textAlign = 'center';
        ctx.fillText(headerText, totalWidth / 2, stripPadding + 40);

        const positions = [[0, 0], [1, 0], [0, 1], [1, 1]];

        for (let i = 0; i < Math.min(photos.length, 4); i++) {
          const photo = photos[i];
          const filteredCanvas = await applyFilterToCanvas(photo, photoSize, photoSize);
          const [col, row] = positions[i];
          const x = stripPadding + col * (photoSize + padding);
          const y = headerHeight + stripPadding + row * (photoSize + padding);
          drawPhotoWithBorder(ctx, filteredCanvas, x, y, photoSize, photoSize, frameConfig, selectedFrame);
          drawStickers(ctx, photo.stickers, x, y, photoSize, photoSize);
          drawTextOverlays(ctx, photo.textOverlays, x, y, photoSize, photoSize);
        }

        if (footerText) {
          ctx.fillStyle = frameConfig.accentColor;
          ctx.font = `bold 14px ${font}`;
          ctx.textAlign = 'center';
          ctx.fillText(footerText, totalWidth / 2, totalHeight - stripPadding - 32);
        }
        
        ctx.fillStyle = '#6B7280';
        ctx.font = '16px Quicksand, sans-serif';
        ctx.fillText(date, totalWidth / 2, totalHeight - stripPadding - 12);

      } else if (selectedLayout === 'horizontal') {
        const photoWidth = 300;
        const photoHeight = 225;
        const padding = 15;
        const stripPadding = 40;
        const headerHeight = 50;
        const footerHeight = 60;

        const totalWidth = photos.length * photoWidth + (photos.length - 1) * padding + stripPadding * 2;
        const totalHeight = headerHeight + photoHeight + footerHeight + stripPadding * 2;

        canvas.width = totalWidth;
        canvas.height = totalHeight;

        ctx.fillStyle = frameConfig.bgColor;
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        drawTemplateDecorations(ctx, selectedTemplate, totalWidth, totalHeight);

        ctx.fillStyle = frameConfig.accentColor;
        ctx.font = `bold 22px ${font}`;
        ctx.textAlign = 'center';
        ctx.fillText(headerText, totalWidth / 2, stripPadding + 30);

        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          const filteredCanvas = await applyFilterToCanvas(photo, photoWidth, photoHeight);
          const x = stripPadding + i * (photoWidth + padding);
          const y = headerHeight + stripPadding;
          drawPhotoWithBorder(ctx, filteredCanvas, x, y, photoWidth, photoHeight, frameConfig, selectedFrame);
          drawStickers(ctx, photo.stickers, x, y, photoWidth, photoHeight);
          drawTextOverlays(ctx, photo.textOverlays, x, y, photoWidth, photoHeight);
        }

        if (footerText) {
          ctx.fillStyle = frameConfig.accentColor;
          ctx.font = `bold 12px ${font}`;
          ctx.textAlign = 'center';
          ctx.fillText(footerText, totalWidth / 2, totalHeight - stripPadding - 30);
        }
        
        ctx.fillStyle = '#6B7280';
        ctx.font = '14px Quicksand, sans-serif';
        ctx.fillText(date + '  ♥', totalWidth / 2, totalHeight - stripPadding - 12);

      } else if (selectedLayout === 'filmstrip') {
        const photoWidth = 350;
        const photoHeight = 260;
        const padding = 25;
        const stripPadding = 30;
        const sprocketHeight = 40;

        const totalWidth = photoWidth + stripPadding * 2;
        const totalHeight = sprocketHeight * 2 + photos.length * photoHeight + (photos.length - 1) * padding + stripPadding * 2;

        canvas.width = totalWidth;
        canvas.height = totalHeight;

        // Film strip black background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        // Sprocket holes
        const sprocketSize = 20;
        const sprocketSpacing = 50;
        ctx.fillStyle = '#FAF7F2';
        
        for (let y = sprocketHeight / 2; y < totalHeight; y += sprocketSpacing) {
          ctx.beginPath();
          ctx.roundRect(8, y - sprocketSize / 2, sprocketSize, sprocketSize, 3);
          ctx.fill();
          ctx.beginPath();
          ctx.roundRect(totalWidth - 8 - sprocketSize, y - sprocketSize / 2, sprocketSize, sprocketSize, 3);
          ctx.fill();
        }

        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          const filteredCanvas = await applyFilterToCanvas(photo, photoWidth, photoHeight);
          const x = stripPadding;
          const y = sprocketHeight + stripPadding + i * (photoHeight + padding);
          
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x - 4, y - 4, photoWidth + 8, photoHeight + 8);
          
          ctx.drawImage(filteredCanvas, x, y);
          drawStickers(ctx, photo.stickers, x, y, photoWidth, photoHeight);
          drawTextOverlays(ctx, photo.textOverlays, x, y, photoWidth, photoHeight);
        }

        ctx.fillStyle = frameConfig.accentColor;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(footerText || `PHOTO BOOTH • ${date}`, totalWidth / 2, totalHeight - sprocketHeight / 2 + 5);
      }

      setStripDataUrl(canvas.toDataURL('image/png', 1.0));
      setIsGenerating(false); 
    };

    generatePhotoStrip();
  }, [photos, selectedLayout, selectedFrame, selectedTemplate, frameConfig, headerText, footerText, font]);

  return {
    canvasRef,
    isGenerating,
    stripDataUrl,
    templateConfig,
  };
};
