import { useState, useEffect, useCallback } from 'react';
import { Camera, RotateCcw, AlertCircle, SwitchCamera, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/useCamera';
import { Photo } from '@/types/photobooth';

interface CameraViewProps {
  onPhotosComplete: (photos: Photo[]) => void;
  onBack: () => void;
}

const MAX_PHOTOS = 4;
const TIMER_OPTIONS = [0, 3, 5, 10];

export const CameraView = ({ onPhotosComplete, onBack }: CameraViewProps) => {
  const { videoRef, canvasRef, isStreaming, error, facingMode, startCamera, stopCamera, capturePhoto, flipCamera } = useCamera();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState(3);
  const [showTimerOptions, setShowTimerOptions] = useState(false);
  const [ejectingPhoto, setEjectingPhoto] = useState<string | null>(null);

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
    setShowTimerOptions(false);

    // Instant capture when timer is 0
    if (selectedTimer === 0) {
      triggerFlash();
      const dataUrl = capturePhoto();
      
      if (dataUrl) {
        // Show ejecting photo animation
        setEjectingPhoto(dataUrl);
        setTimeout(() => setEjectingPhoto(null), 1200);
        
        const newPhoto: Photo = {
          id: crypto.randomUUID(),
          dataUrl,
          filter: 'none',
          timestamp: Date.now(),
          stickers: [],
          textOverlays: [],
        };
        
        setPhotos((prev) => {
          const updated = [...prev, newPhoto];
          if (updated.length >= MAX_PHOTOS) {
            setTimeout(() => onPhotosComplete(updated), 800);
          }
          return updated;
        });
      }
      
      setIsCapturing(false);
      return;
    }

    // Countdown capture
    let count = selectedTimer;
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
          // Show ejecting photo animation
          setEjectingPhoto(dataUrl);
          setTimeout(() => setEjectingPhoto(null), 1200);
          
          const newPhoto: Photo = {
            id: crypto.randomUUID(),
            dataUrl,
            filter: 'none',
            timestamp: Date.now(),
            stickers: [],
            textOverlays: [],
          };
          
          setPhotos((prev) => {
            const updated = [...prev, newPhoto];
            if (updated.length >= MAX_PHOTOS) {
              setTimeout(() => onPhotosComplete(updated), 800);
            }
            return updated;
          });
        }
        
        setIsCapturing(false);
      }
    }, 1000);
  }, [capturePhoto, isCapturing, onPhotosComplete, photos.length, triggerFlash, selectedTimer]);

  const handleRetake = () => {
    setPhotos([]);
  };

  const remainingPhotos = MAX_PHOTOS - photos.length;

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 pt-4 sm:pt-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-3 sm:mb-6 animate-slide-up">
          <h2 className="font-display text-lg sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">
            {photos.length === 0 ? "Strike a Pose!" : `${remainingPhotos} photo${remainingPhotos !== 1 ? 's' : ''} left`}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-base">
            {photos.length === 0 
              ? "Click the shutter to start capturing" 
              : "Keep going! Show us your best angles"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center justify-center">
          {/* Camera body */}
          <div className="camera-body p-2 sm:p-4 animate-fade-scale-in w-full max-w-md lg:max-w-none relative">
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-foreground/10">
              {/* Video feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto aspect-[4/3] object-cover transform scale-x-[-1]"
              />
              
              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Flash overlay */}
              {showFlash && (
                <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />
              )}

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
                  <span 
                    key={countdown}
                    className="font-display text-7xl sm:text-9xl font-bold text-white drop-shadow-lg"
                    style={{
                      animation: 'countdown-number 1s ease-out forwards',
                      textShadow: '0 4px 20px rgba(0,0,0,0.4)'
                    }}
                  >
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

            {/* Ejecting Photo Animation */}
            {ejectingPhoto && (
              <div className="absolute bottom-8 right-0 sm:right-2 z-20 animate-photo-eject-right">
                <div className="w-20 h-24 sm:w-28 sm:h-32 bg-white rounded-sm shadow-photo p-1.5 sm:p-2 rotate-[6deg]">
                  <img 
                    src={ejectingPhoto} 
                    alt="Captured" 
                    className="w-full h-[75%] object-cover rounded-sm transform scale-x-[-1]"
                  />
                  <div className="h-[25%] flex items-center justify-center">
                    <span className="text-[8px] sm:text-[10px] text-foreground/40 font-medium">just now ✨</span>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 mt-4 sm:mt-6">
              <Button
                variant="secondary"
                size="icon"
                onClick={onBack}
                className="h-10 w-10 sm:h-12 sm:w-12"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>

              {/* Timer selector */}
              <div className="relative">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setShowTimerOptions(!showTimerOptions)}
                  className="h-10 w-10 sm:h-12 sm:w-12"
                  disabled={isCapturing}
                >
                  <Timer className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {selectedTimer === 0 ? '⚡' : selectedTimer}
                  </span>
                </Button>
                {showTimerOptions && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-card rounded-xl shadow-card p-2 flex gap-1">
                    {TIMER_OPTIONS.map((time) => (
                      <button
                        key={time}
                        onClick={() => {
                          setSelectedTimer(time);
                          setShowTimerOptions(false);
                        }}
                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                          selectedTimer === time
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary hover:bg-secondary/80 text-foreground'
                        }`}
                      >
                        {time === 0 ? '⚡' : `${time}s`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleCapture}
                disabled={!isStreaming || isCapturing || photos.length >= MAX_PHOTOS}
                className="shutter-button w-14 h-14 sm:w-20 sm:h-20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
              </button>

              {/* Flip camera */}
              <Button
                variant="secondary"
                size="icon"
                onClick={flipCamera}
                disabled={isCapturing}
                className="h-10 w-10 sm:h-12 sm:w-12"
                title={facingMode === 'user' ? 'Switch to back camera' : 'Switch to front camera'}
              >
                <SwitchCamera className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>

              <Button
                variant="secondary"
                size="icon"
                onClick={handleRetake}
                disabled={photos.length === 0}
                className="h-10 w-10 sm:h-12 sm:w-12"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          {/* Photo strip preview */}
          <div className="photo-strip w-full sm:w-40 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0">
              {[...Array(MAX_PHOTOS)].map((_, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 w-20 h-16 sm:w-full sm:h-auto sm:aspect-[4/3] rounded-lg overflow-hidden transition-all duration-300 ${
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
            <div className="mt-2 sm:mt-3 text-center">
              <p className="text-xs text-muted-foreground font-medium">Photo Strip</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
