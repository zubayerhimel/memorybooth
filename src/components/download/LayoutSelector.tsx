import { LAYOUTS, LayoutType } from '@/constants/layouts';
import { FRAMES, FrameStyle } from '@/constants/frames';

interface LayoutSelectorProps {
  selectedLayout: LayoutType;
  selectedFrame: FrameStyle;
  onLayoutChange: (layout: LayoutType) => void;
  onFrameChange: (frame: FrameStyle) => void;
}

export const LayoutSelector = ({
  selectedLayout,
  selectedFrame,
  onLayoutChange,
  onFrameChange,
}: LayoutSelectorProps) => {
  return (
    <div className="space-y-4">
      {/* Layout Options */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Layout Style</label>
        <div className="grid grid-cols-2 gap-2">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              onClick={() => onLayoutChange(layout.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all ${
                selectedLayout === layout.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80 text-foreground'
              }`}
            >
              {layout.icon}
              <span className="text-sm font-medium">{layout.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Frame Options */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Border Style</label>
        <div className="grid grid-cols-3 gap-1.5">
          {FRAMES.map((frame) => (
            <button
              key={frame.id}
              onClick={() => onFrameChange(frame.id)}
              className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-sm transition-all ${
                selectedFrame === frame.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              <span>{frame.emoji}</span>
              <span className="text-xs">{frame.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
