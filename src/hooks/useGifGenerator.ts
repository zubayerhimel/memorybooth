import { useState, useCallback } from 'react';
import GIF from 'gif.js';
import { Photo, GifTransition } from '@/types/photobooth';
import { applyFilterToCanvas, drawStickersForGif, drawTextOverlaysForGif } from '@/lib/canvas-utils';

interface UseGifGeneratorProps {
  photos: Photo[];
  selectedGifTransition: GifTransition;
  gifDelay: number;
}

export const useGifGenerator = ({
  photos,
  selectedGifTransition,
  gifDelay,
}: UseGifGeneratorProps) => {
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [gifDataUrl, setGifDataUrl] = useState<string | null>(null);

  const generateAnimatedGif = useCallback(async () => {
    if (photos.length === 0) return;
    
    setIsGeneratingGif(true);
    setGifDataUrl(null);

    const photoWidth = 400;
    const photoHeight = 300;

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
          drawStickersForGif(frameCtx, photo.stickers, photoWidth, photoHeight);
          drawTextOverlaysForGif(frameCtx, photo.textOverlays, photoWidth, photoHeight);
          
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
                    transitionCtx.globalAlpha = 1 - progress;
                    transitionCtx.drawImage(filteredCanvas, 0, 0);
                    drawStickersForGif(transitionCtx, photo.stickers, photoWidth, photoHeight);
                    drawTextOverlaysForGif(transitionCtx, photo.textOverlays, photoWidth, photoHeight);
                    transitionCtx.globalAlpha = progress;
                    transitionCtx.drawImage(nextFilteredCanvas, 0, 0);
                    drawStickersForGif(transitionCtx, nextPhoto.stickers, photoWidth, photoHeight);
                    drawTextOverlaysForGif(transitionCtx, nextPhoto.textOverlays, photoWidth, photoHeight);
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

  return {
    isGeneratingGif,
    gifDataUrl,
    generateAnimatedGif,
  };
};
