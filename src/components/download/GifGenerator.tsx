import { Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GIF_TRANSITIONS, MIN_GIF_DELAY, MAX_GIF_DELAY, GIF_DELAY_STEP } from '@/constants/gif';
import { GifTransition } from '@/types/photobooth';

interface GifGeneratorProps {
  selectedGifTransition: GifTransition;
  gifDelay: number;
  isGeneratingGif: boolean;
  gifDataUrl: string | null;
  onTransitionChange: (transition: GifTransition) => void;
  onDelayChange: (delay: number) => void;
  onGenerate: () => void;
  onDownload: () => void;
}

export const GifGenerator = ({
  selectedGifTransition,
  gifDelay,
  isGeneratingGif,
  gifDataUrl,
  onTransitionChange,
  onDelayChange,
  onGenerate,
  onDownload,
}: GifGeneratorProps) => {
  return (
    <div className="space-y-4">
      {/* Transition Options */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Transition</label>
        <div className="grid grid-cols-5 gap-1.5">
          {GIF_TRANSITIONS.map((transition) => (
            <button
              key={transition.id}
              onClick={() => onTransitionChange(transition.id)}
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
          min={MIN_GIF_DELAY}
          max={MAX_GIF_DELAY}
          step={GIF_DELAY_STEP}
          value={gifDelay}
          onChange={(e) => onDelayChange(Number(e.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>Fast</span>
          <span>Slow</span>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={onGenerate}
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
          <Button onClick={onDownload} className="w-full" variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-1.5" />
            Download GIF
          </Button>
        </div>
      )}
    </div>
  );
};
