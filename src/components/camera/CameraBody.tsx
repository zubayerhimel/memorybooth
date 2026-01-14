import { RefObject } from 'react';
import { CountdownOverlay } from './CountdownOverlay';
import { CameraError } from './CameraError';
import { CameraLoading } from './CameraLoading';
import { FlashOverlay } from './FlashOverlay';
import { EjectingPhoto } from './EjectingPhoto';
import { CameraControls } from './CameraControls';

interface CameraBodyProps {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  isStreaming: boolean;
  error: string | null;
  showFlash: boolean;
  countdown: number | null;
  ejectingPhoto: string | null;
  onStartCamera: () => void;
  controlsProps: {
    onBack: () => void;
    onCapture: () => void;
    onFlipCamera: () => void;
    onRetake: () => void;
    selectedTimer: number;
    showTimerOptions: boolean;
    onTimerToggle: () => void;
    onTimerSelect: (time: number) => void;
    isCapturing: boolean;
    hasPhotos: boolean;
    isMaxPhotosReached: boolean;
    facingMode: 'user' | 'environment';
  };
}

export const CameraBody = ({
  videoRef,
  canvasRef,
  isStreaming,
  error,
  showFlash,
  countdown,
  ejectingPhoto,
  onStartCamera,
  controlsProps,
}: CameraBodyProps) => {
  return (
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
        {showFlash && <FlashOverlay />}

        {/* Countdown overlay */}
        {countdown !== null && <CountdownOverlay countdown={countdown} />}

        {/* Error state */}
        {error && <CameraError error={error} onRetry={onStartCamera} />}

        {/* Loading state */}
        {!isStreaming && !error && <CameraLoading />}
      </div>

      {/* Ejecting Photo Animation */}
      {ejectingPhoto && <EjectingPhoto photoDataUrl={ejectingPhoto} />}

      {/* Controls */}
      <CameraControls {...controlsProps} isStreaming={isStreaming} />
    </div>
  );
};
