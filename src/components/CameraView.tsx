import { useState, useEffect, useCallback } from 'react';
import { Camera, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/useCamera';
import { Photo } from '@/types/photobooth';

interface CameraViewProps {
  onPhotosComplete: (photos: Photo[]) => void;
  onBack: () => void;
}

const MAX_PHOTOS = 4;
const COUNTDOWN_SECONDS = 3;

export const CameraView = ({ onPhotosComplete, onBack }: CameraViewProps) => {
  const { videoRef, canvasRef, isStreaming, error, startCamera, stopCamera, capturePhoto } = useCamera();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const triggerFlash = useCallback(() => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);
  }, []);

  const handleCapture = useCallback(() => {
    if (isCapturing || photos.length >= MAX_PHOTOS) return;

    setIsCapturing(true);
    let count = COUNTDOWN_SECONDS;
    setCountdown(count);

    const countdownInterval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countdownInterval);
        setCountdown(null);
        
        // Capture the photo
        triggerFlash();
        const dataUrl = capturePhoto();
        
        if (dataUrl) {
          const newPhoto: Photo = {
            id: crypto.randomUUID(),
            dataUrl,
            filter: 'none',
            timestamp: Date.now(),
          };
          
          setPhotos((prev) => {
            const updated = [...prev, newPhoto];
            if (updated.length >= MAX_PHOTOS) {
              setTimeout(() => onPhotosComplete(updated), 500);
            }
            return updated;
          });
        }
        
        setIsCapturing(false);
      }
    }, 1000);
  }, [capturePhoto, isCapturing, onPhotosComplete, photos.length, triggerFlash]);

  const handleRetake = () => {
    setPhotos([]);
  };

  const remainingPhotos = MAX_PHOTOS - photos.length;

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 animate-slide-up">
          <h2 className="font-display text-2xl font-bold text-foreground mb-1">
            {photos.length === 0 ? "Strike a Pose!" : `${remainingPhotos} photo${remainingPhotos !== 1 ? 's' : ''} left`}
          </h2>
          <p className="text-muted-foreground">
            {photos.length === 0 
              ? "Click the shutter to start capturing" 
              : "Keep going! Show us your best angles"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
          {/* Camera body */}
          <div className="camera-body p-4 animate-fade-scale-in">
            <div className="relative rounded-2xl overflow-hidden bg-foreground/10">
              {/* Video feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto max-w-lg aspect-[4/3] object-cover transform scale-x-[-1]"
              />
              
              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Flash overlay */}
              {showFlash && (
                <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />
              )}

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                  <span className="font-display text-8xl font-bold text-card animate-countdown">
                    {countdown}
                  </span>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/90 p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                  <p className="font-medium text-foreground mb-2">Camera Access Required</p>
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  <Button onClick={startCamera} size="sm">
                    Try Again
                  </Button>
                </div>
              )}

              {/* Loading state */}
              {!isStreaming && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="secondary"
                size="icon"
                onClick={onBack}
                className="h-12 w-12"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>

              <button
                onClick={handleCapture}
                disabled={!isStreaming || isCapturing || photos.length >= MAX_PHOTOS}
                className="shutter-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-8 h-8 text-primary-foreground" />
              </button>

              <Button
                variant="secondary"
                size="icon"
                onClick={handleRetake}
                disabled={photos.length === 0}
                className="h-12 w-12"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Photo strip preview */}
          <div className="photo-strip w-40 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col gap-2">
              {[...Array(MAX_PHOTOS)].map((_, index) => (
                <div
                  key={index}
                  className={`aspect-[4/3] rounded-lg overflow-hidden transition-all duration-300 ${
                    photos[index] 
                      ? 'shadow-soft' 
                      : 'bg-muted border-2 border-dashed border-border'
                  }`}
                >
                  {photos[index] ? (
                    <img
                      src={photos[index].dataUrl}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover animate-fade-scale-in"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-muted-foreground font-medium text-sm">
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs text-muted-foreground font-medium">Photo Strip</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
