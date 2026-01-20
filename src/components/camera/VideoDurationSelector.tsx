import { Button } from "@/components/ui/button";
import { VIDEO_DURATION_OPTIONS } from "@/constants/camera";

interface VideoDurationSelectorProps {
  selectedDuration: number;
  showOptions: boolean;
  isDisabled: boolean;
  onToggle: () => void;
  onSelect: (duration: number) => void;
}

export const VideoDurationSelector = ({ selectedDuration, showOptions, isDisabled, onToggle, onSelect }: VideoDurationSelectorProps) => {
  return (
    <div className="relative">
      <Button variant="secondary" size="icon" onClick={onToggle} disabled={isDisabled} className="h-10 w-10 sm:h-12 sm:w-12" title="Video duration">
        {selectedDuration}s
      </Button>

      {showOptions && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-popover border border-border rounded-lg shadow-lg p-2 flex gap-1 z-10">
          {VIDEO_DURATION_OPTIONS.map((duration) => (
            <Button key={duration} variant={selectedDuration === duration ? "default" : "ghost"} size="sm" onClick={() => onSelect(duration)} className="h-8 w-10">
              {duration}s
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
