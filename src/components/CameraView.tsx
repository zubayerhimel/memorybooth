import { useState, useEffect, useCallback } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { Photo } from '@/types/photobooth';
import { MAX_PHOTOS, DEFAULT_TIMER, FLASH_DURATION, EJECT_ANIMATION_DURATION, COUNTDOWN_INTERVAL } from '@/constants/camera';
import { CameraHeader, CameraBody, PhotoStripPreview } from './camera';

interface CameraViewProps {
  onPhotosComplete: (photos: Photo[]) => void;
  onBack: () => void;
}

export const CameraView = ({ onPhotosComplete, onBack }: CameraViewProps) => {
  const { videoRef, canvasRef, isStreaming, error, facingMode, startCamera, stopCamera, capturePhoto, flipCamera } = useCamera();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState(DEFAULT_TIMER);
  const [showTimerOptions, setShowTimerOptions] = useState(false);
  const [ejectingPhoto, setEjectingPhoto] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const triggerFlash = useCallback(() => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), FLASH_DURATION);
  }, []);

  const processCapture = useCallback((dataUrl: string) => {
    // Show ejecting photo animation
    setEjectingPhoto(dataUrl);
    setTimeout(() => setEjectingPhoto(null), EJECT_ANIMATION_DURATION);
    
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
  }, [onPhotosComplete]);

  const handleCapture = useCallback(() => {
    if (isCapturing || photos.length >= MAX_PHOTOS) return;

    setIsCapturing(true);
    setShowTimerOptions(false);

    // Instant capture when timer is 0
    if (selectedTimer === 0) {
      triggerFlash();
      const dataUrl = capturePhoto();
      
      if (dataUrl) {
        processCapture(dataUrl);
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
          processCapture(dataUrl);
        }
        
        setIsCapturing(false);
      }
    }, COUNTDOWN_INTERVAL);
  }, [capturePhoto, isCapturing, photos.length, triggerFlash, selectedTimer, processCapture]);

  const handleRetake = () => {
    setPhotos([]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTimerSelect = (time: number) => {
    setSelectedTimer(time);
    setShowTimerOptions(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 pt-4 sm:pt-6">
      <div className="w-full max-w-4xl">
        <CameraHeader photoCount={photos.length} />

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center justify-center">
          <CameraBody
            videoRef={videoRef as React.RefObject<HTMLVideoElement>}
            canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
            isStreaming={isStreaming}
            error={error}
            showFlash={showFlash}
            countdown={countdown}
            ejectingPhoto={ejectingPhoto}
            onStartCamera={startCamera}
            controlsProps={{
              onBack,
              onCapture: handleCapture,
              onFlipCamera: flipCamera,
              onRetake: handleRetake,
              selectedTimer,
              showTimerOptions,
              onTimerToggle: () => setShowTimerOptions(!showTimerOptions),
              onTimerSelect: handleTimerSelect,
              isCapturing,
              hasPhotos: photos.length > 0,
              isMaxPhotosReached: photos.length >= MAX_PHOTOS,
              facingMode,
            }}
          />

          <PhotoStripPreview
            photos={photos}
            onRemovePhoto={handleRemovePhoto}
          />
        </div>
      </div>
    </div>
  );
};
