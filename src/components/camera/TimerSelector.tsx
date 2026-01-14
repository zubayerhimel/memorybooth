import { Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TIMER_OPTIONS } from '@/constants/camera';

interface TimerSelectorProps {
  selectedTimer: number;
  showTimerOptions: boolean;
  isDisabled: boolean;
  onToggle: () => void;
  onSelect: (time: number) => void;
}

export const TimerSelector = ({
  selectedTimer,
  showTimerOptions,
  isDisabled,
  onToggle,
  onSelect,
}: TimerSelectorProps) => {
  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="icon"
        onClick={onToggle}
        className="h-10 w-10 sm:h-12 sm:w-12"
        disabled={isDisabled}
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
              onClick={() => onSelect(time)}
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
  );
};
