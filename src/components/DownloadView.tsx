import { useRef, useEffect, useState } from 'react';
import { Download, RotateCcw, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Photo, FilterType } from '@/types/photobooth';

interface DownloadViewProps {
  photos: Photo[];
  onStartOver: () => void;
}

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

  useEffect(() => {
    const generatePhotoStrip = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Photo strip dimensions
      const photoWidth = 400;
      const photoHeight = 300;
      const padding = 20;
      const stripPadding = 40;
      const headerHeight = 60;
      const footerHeight = 80;
      
      const totalWidth = photoWidth + stripPadding * 2;
      const totalHeight = 
        headerHeight + 
        photos.length * photoHeight + 
        (photos.length - 1) * padding + 
        footerHeight + 
        stripPadding * 2;

      canvas.width = totalWidth;
      canvas.height = totalHeight;

      // Background - cream color like photo paper
      ctx.fillStyle = '#FAF7F2';
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Draw decorative header
      ctx.fillStyle = '#E8837B';
      ctx.font = 'bold 24px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨ Photo Booth ✨', totalWidth / 2, stripPadding + 35);

      // Load and draw each photo
      const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = dataUrl;
        });
      };

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const img = await loadImage(photo.dataUrl);

        const x = stripPadding;
        const y = headerHeight + stripPadding + i * (photoHeight + padding);

        // Create a temporary canvas for the filter
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = photoWidth;
        tempCanvas.height = photoHeight;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          // Apply filter
          tempCtx.filter = getFilterStyles(photo.filter);
          
          // Calculate crop to fit aspect ratio
          const imgAspect = img.width / img.height;
          const targetAspect = photoWidth / photoHeight;
          
          let sx = 0, sy = 0, sw = img.width, sh = img.height;
          
          if (imgAspect > targetAspect) {
            sw = img.height * targetAspect;
            sx = (img.width - sw) / 2;
          } else {
            sh = img.width / targetAspect;
            sy = (img.height - sh) / 2;
          }

          tempCtx.drawImage(img, sx, sy, sw, sh, 0, 0, photoWidth, photoHeight);
          
          // Draw white border (Polaroid style)
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetY = 4;
          ctx.fillRect(x - 8, y - 8, photoWidth + 16, photoHeight + 16);
          ctx.shadowColor = 'transparent';
          
          // Draw the filtered photo
          ctx.drawImage(tempCanvas, x, y);
        }
      }

      // Draw footer with date
      const date = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '14px Quicksand, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(date, totalWidth / 2, totalHeight - stripPadding - 30);
      
      ctx.fillStyle = '#E8837B';
      ctx.font = '18px sans-serif';
      ctx.fillText('♥', totalWidth / 2, totalHeight - stripPadding - 8);

      setStripDataUrl(canvas.toDataURL('image/png', 1.0));
      setIsGenerating(false);
    };

    generatePhotoStrip();
  }, [photos]);

  const handleDownload = () => {
    if (!stripDataUrl) return;

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    link.download = `photo-booth-${timestamp}.png`;
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

      <div className="text-center mb-8 animate-slide-up">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          Your Photo Strip is Ready! 🎉
        </h2>
        <p className="text-muted-foreground">
          Download and share your memories
        </p>
      </div>

      <div className="relative animate-fade-scale-in">
        {/* Photo strip display */}
        <div className="photo-strip p-6 shadow-photo max-h-[70vh] overflow-hidden">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto rounded-lg"
            style={{ maxHeight: '60vh' }}
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
