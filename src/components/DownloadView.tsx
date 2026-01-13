import { useRef, useEffect, useState } from 'react';
import { Download, RotateCcw, Heart, Sparkles, Grid2X2, LayoutList, Film, Rows3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Photo, FilterType, Sticker } from '@/types/photobooth';

interface DownloadViewProps {
  photos: Photo[];
  onStartOver: () => void;
}

type LayoutType = 'vertical' | 'grid' | 'horizontal' | 'filmstrip';

interface LayoutOption {
  id: LayoutType;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const LAYOUTS: LayoutOption[] = [
  { id: 'vertical', name: 'Classic Strip', icon: <LayoutList className="w-5 h-5" />, description: 'Traditional photo booth style' },
  { id: 'grid', name: '2×2 Grid', icon: <Grid2X2 className="w-5 h-5" />, description: 'Square collage layout' },
  { id: 'horizontal', name: 'Horizontal', icon: <Rows3 className="w-5 h-5 rotate-90" />, description: 'Side by side strip' },
  { id: 'filmstrip', name: 'Film Strip', icon: <Film className="w-5 h-5" />, description: 'Retro cinema style' },
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
    default:
      return 'none';
  }
};

export const DownloadView = ({ photos, onStartOver }: DownloadViewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [stripDataUrl, setStripDataUrl] = useState<string | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('vertical');

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

      const drawPhotoWithBorder = (
        ctx: CanvasRenderingContext2D,
        filteredCanvas: HTMLCanvasElement,
        x: number,
        y: number,
        width: number,
        height: number,
        borderSize: number = 8
      ) => {
        // White border
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        ctx.fillRect(x - borderSize, y - borderSize, width + borderSize * 2, height + borderSize * 2);
        ctx.shadowColor = 'transparent';
        ctx.drawImage(filteredCanvas, x, y);
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

        ctx.fillStyle = '#FAF7F2';
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        ctx.fillStyle = '#E8837B';
        ctx.font = 'bold 24px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✨ Photo Booth ✨', totalWidth / 2, stripPadding + 35);

        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          const filteredCanvas = await applyFilterToCanvas(photo, photoWidth, photoHeight);
          const x = stripPadding;
          const y = headerHeight + stripPadding + i * (photoHeight + padding);
          drawPhotoWithBorder(ctx, filteredCanvas, x, y, photoWidth, photoHeight);
          drawStickers(ctx, photo.stickers, x, y, photoWidth, photoHeight);
        }

        const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '14px Quicksand, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(date, totalWidth / 2, totalHeight - stripPadding - 30);
        ctx.fillStyle = '#E8837B';
        ctx.font = '18px sans-serif';
        ctx.fillText('♥', totalWidth / 2, totalHeight - stripPadding - 8);

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

        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, totalWidth, totalHeight);
        gradient.addColorStop(0, '#FFF5F3');
        gradient.addColorStop(1, '#F0FDF9');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        ctx.fillStyle = '#E8837B';
        ctx.font = 'bold 28px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📸 Memories', totalWidth / 2, stripPadding + 40);

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
          drawPhotoWithBorder(ctx, filteredCanvas, x, y, photoSize, photoSize, 10);
          drawStickers(ctx, photo.stickers, x, y, photoSize, photoSize);
        }

        const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '16px Quicksand, sans-serif';
        ctx.fillText(date, totalWidth / 2, totalHeight - stripPadding - 15);

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

        ctx.fillStyle = '#FAF7F2';
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        ctx.fillStyle = '#E8837B';
        ctx.font = 'bold 22px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✨ Photo Booth ✨', totalWidth / 2, stripPadding + 30);

        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          const filteredCanvas = await applyFilterToCanvas(photo, photoWidth, photoHeight);
          const x = stripPadding + i * (photoWidth + padding);
          const y = headerHeight + stripPadding;
          drawPhotoWithBorder(ctx, filteredCanvas, x, y, photoWidth, photoHeight);
          drawStickers(ctx, photo.stickers, x, y, photoWidth, photoHeight);
        }

        const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '14px Quicksand, sans-serif';
        ctx.fillText(date + '  ♥', totalWidth / 2, totalHeight - stripPadding - 15);

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
        }

        // Film text
        ctx.fillStyle = '#E8837B';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        ctx.fillText(`PHOTO BOOTH • ${date}`, totalWidth / 2, totalHeight - sprocketHeight / 2 + 5);
      }

      setStripDataUrl(canvas.toDataURL('image/png', 1.0));
      setIsGenerating(false);
    };

    generatePhotoStrip();
  }, [photos, selectedLayout]);

  const handleDownload = () => {
    if (!stripDataUrl) return;

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    link.download = `photo-booth-${selectedLayout}-${timestamp}.png`;
    link.href = stripDataUrl;
    link.click();
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-6">
      {/* Decorative elements */}
      <div className="absolute top-16 left-16 animate-bounce-soft">
        <Heart className="w-8 h-8 text-primary fill-primary" />
      </div>
      <div className="absolute top-24 right-24 animate-bounce-soft" style={{ animationDelay: '0.3s' }}>
        <Sparkles className="w-10 h-10 text-yellow" />
      </div>
      <div className="absolute bottom-20 left-24 animate-bounce-soft" style={{ animationDelay: '0.6s' }}>
        <Sparkles className="w-6 h-6 text-accent" />
      </div>

      <div className="text-center mb-6 animate-slide-up">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          Choose Your Layout 🎨
        </h2>
        <p className="text-muted-foreground">
          Pick a style and download your memories
        </p>
      </div>

      {/* Layout selector */}
      <div className="flex flex-wrap justify-center gap-3 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {LAYOUTS.map((layout) => (
          <button
            key={layout.id}
            onClick={() => setSelectedLayout(layout.id)}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-200 ${
              selectedLayout === layout.id
                ? 'bg-primary text-primary-foreground shadow-button scale-105'
                : 'bg-card text-foreground hover:bg-secondary shadow-soft hover:scale-102'
            }`}
          >
            {layout.icon}
            <div className="text-left">
              <div className="font-semibold text-sm">{layout.name}</div>
              <div className={`text-xs ${selectedLayout === layout.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {layout.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="relative animate-fade-scale-in">
        {/* Photo strip display */}
        <div className="photo-strip p-6 shadow-photo max-h-[55vh] overflow-auto">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto rounded-lg"
            style={{ maxHeight: '50vh' }}
          />

          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-2xl">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="font-medium text-foreground">Creating your photo strip...</p>
              </div>
            </div>
          )}
        </div>

        {/* Decorative tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow/80 rotate-2 rounded-sm" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 mt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <Button
          variant="secondary"
          size="lg"
          onClick={onStartOver}
          className="font-display"
        >
          <RotateCcw className="w-5 h-5" />
          Take New Photos
        </Button>
        <Button
          size="lg"
          onClick={handleDownload}
          disabled={isGenerating}
          className="font-display"
        >
          <Download className="w-5 h-5" />
          Download Strip
        </Button>
      </div>

      <p className="mt-6 text-xs text-muted-foreground animate-slide-up" style={{ animationDelay: '0.5s' }}>
        High-quality PNG • Ready for printing or sharing
      </p>
    </div>
  );
};
