import { Camera, RotateCcw, SwitchCamera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimerSelector } from './TimerSelector';

interface CameraControlsProps {
  onBack: () => void;
  onCapture: () => void;
  onFlipCamera: () => void;
  onRetake: () => void;
  selectedTimer: number;
  showTimerOptions: boolean;
  onTimerToggle: () => void;
  onTimerSelect: (time: number) => void;
  isStreaming: boolean;
  isCapturing: boolean;
  hasPhotos: boolean;
  isMaxPhotosReached: boolean;
  facingMode: 'user' | 'environment';
}

export const CameraControls = ({
  onBack,
  onCapture,
  onFlipCamera,
  onRetake,
  selectedTimer,
  showTimerOptions,
  onTimerToggle,
  onTimerSelect,
  isStreaming,
  isCapturing,
  hasPhotos,
  isMaxPhotosReached,
  facingMode,
}: CameraControlsProps) => {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mt-4 sm:mt-6">
      <Button
        variant="secondary"
        size="icon"
        onClick={onBack}
        className="h-10 w-10 sm:h-12 sm:w-12"
      >
        <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>

      <TimerSelector
        selectedTimer={selectedTimer}
        showTimerOptions={showTimerOptions}
        isDisabled={isCapturing}
        onToggle={onTimerToggle}
        onSelect={onTimerSelect}
      />

      <button
        onClick={onCapture}
        disabled={!isStreaming || isCapturing || isMaxPhotosReached}
        className="shutter-button w-14 h-14 sm:w-20 sm:h-20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
      </button>

      <Button
        variant="secondary"
        size="icon"
        onClick={onFlipCamera}
        disabled={isCapturing}
        className="h-10 w-10 sm:h-12 sm:w-12"
        title={facingMode === 'user' ? 'Switch to back camera' : 'Switch to front camera'}
      >
        <SwitchCamera className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        onClick={onRetake}
        disabled={!hasPhotos}
        className="h-10 w-10 sm:h-12 sm:w-12"
      >
        <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
    </div>
  );
};
