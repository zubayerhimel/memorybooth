import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Download, RotateCcw, Grid2X2, LayoutList, Film, Rows3, Play, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Photo, FilterType, Sticker, TextOverlay, TemplateTheme, TemplateConfig, GifTransition } from '@/types/photobooth';
import GIF from 'gif.js';

interface DownloadViewProps {
  photos: Photo[];
  onStartOver: () => void;
}

type LayoutType = 'vertical' | 'grid' | 'horizontal' | 'filmstrip';
type FrameStyle = 'classic' | 'polaroid' | 'rounded' | 'vintage' | 'birthday' | 'wedding';

interface LayoutOption {
  id: LayoutType;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface FrameOption {
  id: FrameStyle;
  name: string;
  emoji: string;
}

const LAYOUTS: LayoutOption[] = [
  { id: 'vertical', name: 'Classic Strip', icon: <LayoutList className="w-5 h-5" />, description: 'Traditional photo booth style' },
  { id: 'grid', name: '2×2 Grid', icon: <Grid2X2 className="w-5 h-5" />, description: 'Square collage layout' },
  { id: 'horizontal', name: 'Horizontal', icon: <Rows3 className="w-5 h-5 rotate-90" />, description: 'Side by side strip' },
  { id: 'filmstrip', name: 'Film Strip', icon: <Film className="w-5 h-5" />, description: 'Retro cinema style' },
];

const FRAMES: FrameOption[] = [
  { id: 'classic', name: 'Classic', emoji: '🖼️' },
  { id: 'polaroid', name: 'Polaroid', emoji: '📷' },
  { id: 'rounded', name: 'Rounded', emoji: '⭕' },
  { id: 'vintage', name: 'Vintage', emoji: '🎞️' },
  { id: 'birthday', name: 'Birthday', emoji: '🎂' },
  { id: 'wedding', name: 'Wedding', emoji: '💒' },
];

// Themed Collage Templates
interface TemplateOption {
  id: TemplateTheme;
  name: string;
  emoji: string;
}

const TEMPLATES: TemplateOption[] = [
  { id: 'none', name: 'None', emoji: '✨' },
  { id: 'birthday', name: 'Birthday', emoji: '🎂' },
  { id: 'wedding', name: 'Wedding', emoji: '💍' },
  { id: 'graduation', name: 'Graduation', emoji: '🎓' },
  { id: 'christmas', name: 'Christmas', emoji: '🎄' },
  { id: 'halloween', name: 'Halloween', emoji: '🎃' },
  { id: 'valentines', name: 'Valentine\'s', emoji: '💕' },
  { id: 'newyear', name: 'New Year', emoji: '🎆' },
];

const TEMPLATE_CONFIGS: Record<TemplateTheme, TemplateConfig> = {
  none: {
    id: 'none',
    name: 'None',
    emoji: '✨',
    bgColor: '#FAF7F2',
    accentColor: '#E8837B',
    secondaryColor: '#333333',
    headerText: '✨ Photo Booth ✨',
    footerText: '',
    decorations: [],
    borderStyle: 'none',
    font: 'Poppins, sans-serif',
  },
  birthday: {
    id: 'birthday',
    name: 'Birthday',
    emoji: '🎂',
    bgColor: '#FFF0F5',
    accentColor: '#FF69B4',
    secondaryColor: '#FFD700',
    headerText: '🎉 Happy Birthday! 🎉',
    footerText: 'Make a Wish! 🎂',
    decorations: [
      { emoji: '🎈', positions: [{ x: 5, y: 10, size: 30 }, { x: 95, y: 15, size: 28 }, { x: 8, y: 85, size: 26 }, { x: 92, y: 80, size: 30 }] },
      { emoji: '🎁', positions: [{ x: 10, y: 50, size: 24 }, { x: 90, y: 45, size: 22 }] },
      { emoji: '⭐', positions: [{ x: 15, y: 25, size: 18 }, { x: 85, y: 30, size: 20 }, { x: 12, y: 70, size: 16 }, { x: 88, y: 65, size: 18 }] },
      { emoji: '🎊', positions: [{ x: 3, y: 40, size: 22 }, { x: 97, y: 55, size: 24 }] },
    ],
    borderStyle: 'dashed',
    font: 'Comic Sans MS, cursive',
  },
  wedding: {
    id: 'wedding',
    name: 'Wedding',
    emoji: '💍',
    bgColor: '#FFFAF0',
    accentColor: '#D4AF37',
    secondaryColor: '#8B4513',
    headerText: '💒 Forever & Always 💒',
    footerText: 'With Love 💕',
    decorations: [
      { emoji: '💐', positions: [{ x: 5, y: 15, size: 28 }, { x: 95, y: 15, size: 28 }] },
      { emoji: '💍', positions: [{ x: 8, y: 45, size: 22 }, { x: 92, y: 50, size: 22 }] },
      { emoji: '🕊️', positions: [{ x: 10, y: 80, size: 24 }, { x: 90, y: 85, size: 24 }] },
      { emoji: '✨', positions: [{ x: 15, y: 30, size: 16 }, { x: 85, y: 35, size: 18 }, { x: 12, y: 65, size: 14 }, { x: 88, y: 70, size: 16 }] },
    ],
    borderStyle: 'double',
    font: 'Georgia, serif',
  },
  graduation: {
    id: 'graduation',
    name: 'Graduation',
    emoji: '🎓',
    bgColor: '#F0F8FF',
    accentColor: '#1E3A8A',
    secondaryColor: '#FFD700',
    headerText: '🎓 Class of 2026! 🎓',
    footerText: 'The Future is Bright! ⭐',
    decorations: [
      { emoji: '🎓', positions: [{ x: 5, y: 12, size: 30, rotation: -15 }, { x: 95, y: 10, size: 28, rotation: 15 }] },
      { emoji: '📚', positions: [{ x: 8, y: 50, size: 24 }, { x: 92, y: 55, size: 22 }] },
      { emoji: '🏆', positions: [{ x: 6, y: 85, size: 26 }, { x: 94, y: 82, size: 24 }] },
      { emoji: '⭐', positions: [{ x: 15, y: 30, size: 18 }, { x: 85, y: 25, size: 20 }, { x: 12, y: 70, size: 16 }, { x: 88, y: 68, size: 18 }] },
    ],
    borderStyle: 'solid',
    font: 'Times New Roman, serif',
  },
  christmas: {
    id: 'christmas',
    name: 'Christmas',
    emoji: '🎄',
    bgColor: '#0F5132',
    accentColor: '#DC2626',
    secondaryColor: '#FFFFFF',
    headerText: '🎄 Merry Christmas! 🎄',
    footerText: 'Ho Ho Ho! 🎅',
    decorations: [
      { emoji: '🎄', positions: [{ x: 4, y: 15, size: 32 }, { x: 96, y: 12, size: 30 }] },
      { emoji: '🎅', positions: [{ x: 7, y: 50, size: 26 }, { x: 93, y: 48, size: 24 }] },
      { emoji: '❄️', positions: [{ x: 10, y: 25, size: 18 }, { x: 90, y: 30, size: 20 }, { x: 8, y: 75, size: 16 }, { x: 92, y: 70, size: 18 }] },
      { emoji: '🎁', positions: [{ x: 5, y: 85, size: 24 }, { x: 95, y: 88, size: 26 }] },
      { emoji: '⭐', positions: [{ x: 15, y: 8, size: 22 }, { x: 85, y: 6, size: 24 }] },
    ],
    borderStyle: 'solid',
    font: 'Georgia, serif',
  },
  halloween: {
    id: 'halloween',
    name: 'Halloween',
    emoji: '🎃',
    bgColor: '#1a1a2e',
    accentColor: '#FF6600',
    secondaryColor: '#9333EA',
    headerText: '🎃 Spooky Season! 👻',
    footerText: 'Trick or Treat! 🍬',
    decorations: [
      { emoji: '🎃', positions: [{ x: 5, y: 12, size: 32 }, { x: 95, y: 15, size: 30 }] },
      { emoji: '👻', positions: [{ x: 8, y: 45, size: 26 }, { x: 92, y: 50, size: 24 }] },
      { emoji: '🦇', positions: [{ x: 12, y: 25, size: 22 }, { x: 88, y: 28, size: 20 }] },
      { emoji: '🕷️', positions: [{ x: 6, y: 70, size: 20 }, { x: 94, y: 75, size: 22 }] },
      { emoji: '🌙', positions: [{ x: 10, y: 88, size: 24 }, { x: 90, y: 85, size: 26 }] },
    ],
    borderStyle: 'dashed',
    font: 'Creepster, cursive',
  },
  valentines: {
    id: 'valentines',
    name: 'Valentine\'s',
    emoji: '💕',
    bgColor: '#FFF0F5',
    accentColor: '#E11D48',
    secondaryColor: '#FB7185',
    headerText: '💕 Be My Valentine 💕',
    footerText: 'Love is in the Air ❤️',
    decorations: [
      { emoji: '❤️', positions: [{ x: 5, y: 15, size: 28 }, { x: 95, y: 12, size: 26 }, { x: 8, y: 85, size: 24 }, { x: 92, y: 88, size: 28 }] },
      { emoji: '💕', positions: [{ x: 10, y: 40, size: 22 }, { x: 90, y: 45, size: 24 }] },
      { emoji: '💘', positions: [{ x: 7, y: 65, size: 26 }, { x: 93, y: 60, size: 24 }] },
      { emoji: '🌹', positions: [{ x: 12, y: 28, size: 20 }, { x: 88, y: 75, size: 22 }] },
    ],
    borderStyle: 'none',
    font: 'Dancing Script, cursive',
  },
  newyear: {
    id: 'newyear',
    name: 'New Year',
    emoji: '🎆',
    bgColor: '#0f172a',
    accentColor: '#FFD700',
    secondaryColor: '#C0C0C0',
    headerText: '🎆 Happy New Year 2026! 🎆',
    footerText: 'Cheers to New Beginnings! 🥂',
    decorations: [
      { emoji: '🎆', positions: [{ x: 5, y: 10, size: 30 }, { x: 95, y: 12, size: 28 }] },
      { emoji: '🎇', positions: [{ x: 8, y: 45, size: 26 }, { x: 92, y: 48, size: 24 }] },
      { emoji: '🥂', positions: [{ x: 6, y: 80, size: 24 }, { x: 94, y: 85, size: 26 }] },
      { emoji: '✨', positions: [{ x: 12, y: 25, size: 18 }, { x: 88, y: 30, size: 20 }, { x: 10, y: 65, size: 16 }, { x: 90, y: 70, size: 18 }] },
      { emoji: '🎊', positions: [{ x: 15, y: 55, size: 20 }, { x: 85, y: 58, size: 22 }] },
    ],
    borderStyle: 'solid',
    font: 'Playfair Display, serif',
  },
};

// GIF Transition Options
interface GifOption {
  id: GifTransition;
  name: string;
  description: string;
}

const GIF_TRANSITIONS: GifOption[] = [
  { id: 'none', name: 'Simple', description: 'No transition' },
  { id: 'fade', name: 'Fade', description: 'Smooth fade' },
  { id: 'slide', name: 'Slide', description: 'Slide effect' },
  { id: 'zoom', name: 'Zoom', description: 'Zoom in/out' },
  { id: 'bounce', name: 'Bounce', description: 'Bouncy effect' },
];

const getFilterStyles = (filter: FilterType): string => {
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

export const DownloadView = ({ photos, onStartOver }: DownloadViewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [stripDataUrl, setStripDataUrl] = useState<string | null>(null);
  const [gifDataUrl, setGifDataUrl] = useState<string | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('vertical');
  const [selectedFrame, setSelectedFrame] = useState<FrameStyle>('classic');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateTheme>('none');
  const [selectedGifTransition, setSelectedGifTransition] = useState<GifTransition>('fade');
  const [gifDelay, setGifDelay] = useState(800);
  const [showGifOptions, setShowGifOptions] = useState(false);
  const [activeTab, setActiveTab] = useState<'layout' | 'template' | 'gif'>('layout');
  
  // Custom text for header and footer
  const [customHeaderText, setCustomHeaderText] = useState('');
  const [customFooterText, setCustomFooterText] = useState('');
  
  // Debounced versions - only update after user stops typing
  const [debouncedHeaderText, setDebouncedHeaderText] = useState('');
  const [debouncedFooterText, setDebouncedFooterText] = useState('');
  
  // Character limits
  const HEADER_MAX_CHARS = 30;
  const FOOTER_MAX_CHARS = 25;
  
  // Debounce the custom text inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHeaderText(customHeaderText);
    }, 500);
    return () => clearTimeout(timer);
  }, [customHeaderText]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFooterText(customFooterText);
    }, 500);
    return () => clearTimeout(timer);
  }, [customFooterText]);

  // Get the current template config
  const templateConfig = TEMPLATE_CONFIGS[selectedTemplate];

  // Frame-specific styling (combined with template)
  const getFrameConfig = () => {
    const baseBgColor = selectedTemplate !== 'none' ? templateConfig.bgColor : undefined;
    const baseAccentColor = selectedTemplate !== 'none' ? templateConfig.accentColor : undefined;
    
    switch (selectedFrame) {
      case 'polaroid':
        return { borderTop: 12, borderSide: 12, borderBottom: 45, cornerRadius: 0, bgColor: baseBgColor || '#FAFAFA', accentColor: baseAccentColor || '#333333' };
      case 'rounded':
        return { borderTop: 10, borderSide: 10, borderBottom: 10, cornerRadius: 20, bgColor: baseBgColor || '#FAF7F2', accentColor: baseAccentColor || '#E8837B' };
      case 'vintage':
        return { borderTop: 15, borderSide: 15, borderBottom: 15, cornerRadius: 0, bgColor: baseBgColor || '#F5E6D3', accentColor: baseAccentColor || '#8B4513' };
      case 'birthday':
        return { borderTop: 12, borderSide: 12, borderBottom: 12, cornerRadius: 8, bgColor: baseBgColor || '#FFF0F5', accentColor: baseAccentColor || '#FF69B4' };
      case 'wedding':
        return { borderTop: 14, borderSide: 14, borderBottom: 14, cornerRadius: 4, bgColor: baseBgColor || '#FFFAF0', accentColor: baseAccentColor || '#D4AF37' };
      default: // classic
        return { borderTop: 8, borderSide: 8, borderBottom: 8, cornerRadius: 0, bgColor: baseBgColor || '#FAF7F2', accentColor: baseAccentColor || '#E8837B' };
    }
  };

  const frameConfig = getFrameConfig();

  useEffect(() => {
    const generatePhotoStrip = async () => {
      setIsGenerating(true);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = dataUrl;
        });
      };

      const applyFilterToCanvas = async (
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

      const drawStickers = (
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

      const drawTextOverlays = (
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

      // Draw template decorations
      const drawTemplateDecorations = (
        ctx: CanvasRenderingContext2D,
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

      // Get header and footer text based on template or custom text
      const getHeaderText = () => {
        // Use debounced custom text if provided
        if (debouncedHeaderText.trim()) {
          return debouncedHeaderText.trim();
        }
        // Otherwise use template default
        if (selectedTemplate !== 'none') {
          return templateConfig.headerText;
        }
        return '✨ Photo Booth ✨';
      };

      const getFooterText = () => {
        // Use debounced custom text if provided
        if (debouncedFooterText.trim()) {
          return debouncedFooterText.trim();
        }
        // Otherwise use template default
        if (selectedTemplate !== 'none' && templateConfig.footerText) {
          return templateConfig.footerText;
        }
        return '';
      };

      const getFont = () => {
        if (selectedTemplate !== 'none') {
          return templateConfig.font;
        }
        return 'Poppins, sans-serif';
      };

      const drawPhotoWithBorder = (
        ctx: CanvasRenderingContext2D,
        filteredCanvas: HTMLCanvasElement,
        x: number,
        y: number,
        width: number,
        height: number
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

        // Draw template decorations first (behind photos)
        drawTemplateDecorations(ctx, totalWidth, totalHeight);

        ctx.fillStyle = frameConfig.accentColor;
        ctx.font = `bold 24px ${getFont()}`;
        ctx.textAlign = 'center';
        ctx.fillText(getHeaderText(), totalWidth / 2, stripPadding + 35);

        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          const filteredCanvas = await applyFilterToCanvas(photo, photoWidth, photoHeight);
          const x = stripPadding;
          const y = headerHeight + stripPadding + i * (photoHeight + padding);
          drawPhotoWithBorder(ctx, filteredCanvas, x, y, photoWidth, photoHeight);
          drawStickers(ctx, photo.stickers, x, y, photoWidth, photoHeight);
          drawTextOverlays(ctx, photo.textOverlays, x, y, photoWidth, photoHeight);
        }

        const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const footerText = getFooterText();
        
        if (footerText) {
          ctx.fillStyle = frameConfig.accentColor;
          ctx.font = `bold 16px ${getFont()}`;
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

        // Background with frame color
        ctx.fillStyle = frameConfig.bgColor;
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        // Draw template decorations first
        drawTemplateDecorations(ctx, totalWidth, totalHeight);

        ctx.fillStyle = frameConfig.accentColor;
        ctx.font = `bold 28px ${getFont()}`;
        ctx.textAlign = 'center';
        ctx.fillText(getHeaderText(), totalWidth / 2, stripPadding + 40);

        const positions = [
          [0, 0], [1, 0],
          [0, 1], [1, 1]
        ];

        for (let i = 0; i < Math.min(photos.length, 4); i++) {
          const photo = photos[i];
          const filteredCanvas = await applyFilterToCanvas(photo, photoSize, photoSize);
          const [col, row] = positions[i];
          const x = stripPadding + col * (photoSize + padding);
          const y = headerHeight + stripPadding + row * (photoSize + padding);
          drawPhotoWithBorder(ctx, filteredCanvas, x, y, photoSize, photoSize);
          drawStickers(ctx, photo.stickers, x, y, photoSize, photoSize);
          drawTextOverlays(ctx, photo.textOverlays, x, y, photoSize, photoSize);
        }

        const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const footerText = getFooterText();
        
        if (footerText) {
          ctx.fillStyle = frameConfig.accentColor;
          ctx.font = `bold 14px ${getFont()}`;
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

        // Draw template decorations first
        drawTemplateDecorations(ctx, totalWidth, totalHeight);

        ctx.fillStyle = frameConfig.accentColor;
        ctx.font = `bold 22px ${getFont()}`;
        ctx.textAlign = 'center';
        ctx.fillText(getHeaderText(), totalWidth / 2, stripPadding + 30);

        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          const filteredCanvas = await applyFilterToCanvas(photo, photoWidth, photoHeight);
          const x = stripPadding + i * (photoWidth + padding);
          const y = headerHeight + stripPadding;
          drawPhotoWithBorder(ctx, filteredCanvas, x, y, photoWidth, photoHeight);
          drawStickers(ctx, photo.stickers, x, y, photoWidth, photoHeight);
          drawTextOverlays(ctx, photo.textOverlays, x, y, photoWidth, photoHeight);
        }

        const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const footerText = getFooterText();
        
        if (footerText) {
          ctx.fillStyle = frameConfig.accentColor;
          ctx.font = `bold 12px ${getFont()}`;
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
          // Left sprocket
          ctx.beginPath();
          ctx.roundRect(8, y - sprocketSize / 2, sprocketSize, sprocketSize, 3);
          ctx.fill();
          // Right sprocket
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

        // Film text
        ctx.fillStyle = frameConfig.accentColor;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const footerText = getFooterText();
        ctx.fillText(footerText || `PHOTO BOOTH • ${date}`, totalWidth / 2, totalHeight - sprocketHeight / 2 + 5);
      }

      setStripDataUrl(canvas.toDataURL('image/png', 1.0));
      setIsGenerating(false); 
    };

    generatePhotoStrip();
  }, [photos, selectedLayout, selectedFrame, selectedTemplate, debouncedHeaderText, debouncedFooterText]);

  // GIF Generation Function
  const generateAnimatedGif = useCallback(async () => {
    if (photos.length === 0) return;
    
    setIsGeneratingGif(true);
    setGifDataUrl(null);

    const photoWidth = 400;
    const photoHeight = 300;
    
    // Helper to load image
    const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataUrl;
      });
    };

    // Apply filter and get canvas
    const applyFilterToCanvas = async (
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

    // Draw stickers on canvas
    const drawStickers = (
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

    // Draw text overlays
    const drawTextOverlays = (
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

    try {
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: photoWidth,
        height: photoHeight,
        workerScript: '/gif.worker.js',
      });

      // Generate frames based on transition type
      const transitionFrames = selectedGifTransition === 'none' ? 0 : 5;
      
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const filteredCanvas = await applyFilterToCanvas(photo, photoWidth, photoHeight);
        
        // Create main frame
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = photoWidth;
        frameCanvas.height = photoHeight;
        const frameCtx = frameCanvas.getContext('2d');
        
        if (frameCtx) {
          frameCtx.drawImage(filteredCanvas, 0, 0);
          drawStickers(frameCtx, photo.stickers, photoWidth, photoHeight);
          drawTextOverlays(frameCtx, photo.textOverlays, photoWidth, photoHeight);
          
          // Add main frame
          gif.addFrame(frameCanvas, { delay: gifDelay, copy: true });
          
          // Add transition frames if not the last photo
          if (i < photos.length - 1 && transitionFrames > 0) {
            const nextPhoto = photos[i + 1];
            const nextFilteredCanvas = await applyFilterToCanvas(nextPhoto, photoWidth, photoHeight);
            
            for (let t = 1; t <= transitionFrames; t++) {
              const progress = t / (transitionFrames + 1);
              const transitionCanvas = document.createElement('canvas');
              transitionCanvas.width = photoWidth;
              transitionCanvas.height = photoHeight;
              const transitionCtx = transitionCanvas.getContext('2d');
              
              if (transitionCtx) {
                switch (selectedGifTransition) {
                  case 'fade':
                    // Draw current frame
                    transitionCtx.globalAlpha = 1 - progress;
                    transitionCtx.drawImage(filteredCanvas, 0, 0);
                    drawStickers(transitionCtx, photo.stickers, photoWidth, photoHeight);
                    drawTextOverlays(transitionCtx, photo.textOverlays, photoWidth, photoHeight);
                    // Draw next frame on top
                    transitionCtx.globalAlpha = progress;
                    transitionCtx.drawImage(nextFilteredCanvas, 0, 0);
                    drawStickers(transitionCtx, nextPhoto.stickers, photoWidth, photoHeight);
                    drawTextOverlays(transitionCtx, nextPhoto.textOverlays, photoWidth, photoHeight);
                    transitionCtx.globalAlpha = 1;
                    break;
                    
                  case 'slide':
                    const slideOffset = progress * photoWidth;
                    transitionCtx.drawImage(filteredCanvas, -slideOffset, 0);
                    transitionCtx.drawImage(nextFilteredCanvas, photoWidth - slideOffset, 0);
                    break;
                    
                  case 'zoom':
                    const zoomScale = 1 - progress * 0.3;
                    const nextZoomScale = 0.7 + progress * 0.3;
                    const zoomOffset = (photoWidth * (1 - zoomScale)) / 2;
                    const nextZoomOffset = (photoWidth * (1 - nextZoomScale)) / 2;
                    
                    transitionCtx.globalAlpha = 1 - progress;
                    transitionCtx.drawImage(filteredCanvas, zoomOffset, zoomOffset, photoWidth * zoomScale, photoHeight * zoomScale);
                    transitionCtx.globalAlpha = progress;
                    transitionCtx.drawImage(nextFilteredCanvas, nextZoomOffset, nextZoomOffset, photoWidth * nextZoomScale, photoHeight * nextZoomScale);
                    transitionCtx.globalAlpha = 1;
                    break;
                    
                  case 'bounce':
                    const bounceY = Math.sin(progress * Math.PI) * 30;
                    transitionCtx.globalAlpha = 1 - progress;
                    transitionCtx.drawImage(filteredCanvas, 0, bounceY);
                    transitionCtx.globalAlpha = progress;
                    transitionCtx.drawImage(nextFilteredCanvas, 0, -bounceY + 30 * (1 - progress));
                    transitionCtx.globalAlpha = 1;
                    break;
                    
                  default:
                    transitionCtx.drawImage(filteredCanvas, 0, 0);
                }
                
                gif.addFrame(transitionCanvas, { delay: 100, copy: true });
              }
            }
          }
        }
      }

      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setGifDataUrl(url);
        setIsGeneratingGif(false);
      });

      gif.render();
    } catch (error) {
      console.error('Error generating GIF:', error);
      setIsGeneratingGif(false);
    }
  }, [photos, selectedGifTransition, gifDelay]);

  const handleDownload = () => {
    if (!stripDataUrl) return;

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    link.download = `photo-booth-${selectedLayout}-${selectedTemplate !== 'none' ? selectedTemplate + '-' : ''}${timestamp}.png`;
    link.href = stripDataUrl;
    link.click();
  };

  const handleDownloadGif = () => {
    if (!gifDataUrl) return;

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    link.download = `photo-booth-animated-${timestamp}.gif`;
    link.href = gifDataUrl;
    link.click();
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center p-3 sm:p-6 pt-4 sm:pt-6 overflow-auto">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6 animate-slide-up">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1">
          Your Photos Are Ready! ✨
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Customize your layout and download
        </p>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-4 lg:gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        
        {/* Left Side - Photo Preview */}
        <div className="lg:w-1/2 flex flex-col items-center">
          <div className="relative w-full flex justify-center">
            <div className="photo-strip p-3 sm:p-4 shadow-photo inline-block">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto rounded-lg mx-auto"
                style={{ maxHeight: '55vh' }}
              />

              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-2xl">
                  <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="font-medium text-foreground text-sm">Creating...</p>
                  </div>
                </div>
              )}
            </div>
            {/* Decorative tape */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 sm:w-14 h-3 sm:h-5 bg-yellow/80 rotate-2 rounded-sm" />
          </div>

          {/* Download Buttons - Below Preview */}
          <div className="flex gap-3 mt-4 w-full max-w-xs">
            <Button
              variant="secondary"
              size="default"
              onClick={onStartOver}
              className="flex-1 text-sm"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Retake
            </Button>
            <Button
              size="default"
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 text-sm"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Download
            </Button>
          </div>
        </div>

        {/* Right Side - Controls Panel */}
        <div className="lg:w-1/2">
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('layout')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-all ${
                  activeTab === 'layout'
                    ? 'bg-primary/10 text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                <LayoutList className="w-4 h-4" />
                <span>Layout</span>
              </button>
              <button
                onClick={() => setActiveTab('template')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-all ${
                  activeTab === 'template'
                    ? 'bg-primary/10 text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Theme</span>
              </button>
              <button
                onClick={() => setActiveTab('gif')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-all ${
                  activeTab === 'gif'
                    ? 'bg-primary/10 text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                <Play className="w-4 h-4" />
                <span>GIF</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {/* Layout Tab */}
              {activeTab === 'layout' && (
                <div className="space-y-4">
                  {/* Layout Options */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Layout Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {LAYOUTS.map((layout) => (
                        <button
                          key={layout.id}
                          onClick={() => setSelectedLayout(layout.id)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all ${
                            selectedLayout === layout.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary hover:bg-secondary/80 text-foreground'
                          }`}
                        >
                          {layout.icon}
                          <span className="text-sm font-medium">{layout.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Frame Options */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Border Style</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {FRAMES.map((frame) => (
                        <button
                          key={frame.id}
                          onClick={() => setSelectedFrame(frame.id)}
                          className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-sm transition-all ${
                            selectedFrame === frame.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary hover:bg-secondary/80'
                          }`}
                        >
                          <span>{frame.emoji}</span>
                          <span className="text-xs">{frame.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Template Tab */}
              {activeTab === 'template' && (
                <div className="space-y-4">
                  {/* Theme Selection */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Choose Theme</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all ${
                            selectedTemplate === template.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary hover:bg-secondary/80'
                          }`}
                        >
                          <span className="text-lg">{template.emoji}</span>
                          <span className="text-[10px] font-medium">{template.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Text */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    <label className="text-xs font-medium text-muted-foreground block">Custom Text</label>
                    <input
                      type="text"
                      value={customHeaderText}
                      onChange={(e) => setCustomHeaderText(e.target.value.slice(0, HEADER_MAX_CHARS))}
                      placeholder={selectedTemplate !== 'none' ? templateConfig.headerText : 'Header text...'}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      maxLength={HEADER_MAX_CHARS}
                    />
                    <input
                      type="text"
                      value={customFooterText}
                      onChange={(e) => setCustomFooterText(e.target.value.slice(0, FOOTER_MAX_CHARS))}
                      placeholder="Footer text..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      maxLength={FOOTER_MAX_CHARS}
                    />
                    {(customHeaderText || customFooterText) && (
                      <button
                        onClick={() => { 
                          setCustomHeaderText(''); 
                          setCustomFooterText(''); 
                          setDebouncedHeaderText('');
                          setDebouncedFooterText('');
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        ↩ Reset text
                      </button>
                    )}
                  </div>

                  {selectedTemplate !== 'none' && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 text-sm">
                      <span>{templateConfig.emoji}</span>
                      <span className="font-medium">{templateConfig.name} active</span>
                    </div>
                  )}
                </div>
              )}

              {/* GIF Tab */}
              {activeTab === 'gif' && (
                <div className="space-y-4">
                  {/* Transition Options */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Transition</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {GIF_TRANSITIONS.map((transition) => (
                        <button
                          key={transition.id}
                          onClick={() => setSelectedGifTransition(transition.id)}
                          className={`py-2 px-1 rounded-lg text-center transition-all ${
                            selectedGifTransition === transition.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary hover:bg-secondary/80'
                          }`}
                        >
                          <span className="text-xs font-medium">{transition.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Speed Slider */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Speed: {gifDelay}ms
                    </label>
                    <input
                      type="range"
                      min="300"
                      max="2000"
                      step="100"
                      value={gifDelay}
                      onChange={(e) => setGifDelay(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>Fast</span>
                      <span>Slow</span>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={generateAnimatedGif}
                    disabled={isGeneratingGif}
                    className="w-full"
                    size="default"
                  >
                    {isGeneratingGif ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Create GIF
                      </>
                    )}
                  </Button>

                  {/* GIF Preview */}
                  {gifDataUrl && (
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <img 
                        src={gifDataUrl} 
                        alt="Animated GIF" 
                        className="max-w-full h-auto rounded-lg mx-auto mb-2"
                        style={{ maxHeight: '120px' }}
                      />
                      <Button onClick={handleDownloadGif} className="w-full" variant="secondary" size="sm">
                        <Download className="w-4 h-4 mr-1.5" />
                        Download GIF
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <p className="mt-3 text-[11px] text-muted-foreground text-center">
            {selectedTemplate !== 'none' && <span className="mr-1">🎨 {templateConfig.name}</span>}
            High-quality PNG • Print ready
          </p>
        </div>
      </div>
    </div>
  );
};
