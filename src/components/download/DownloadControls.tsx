import { Download, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DownloadControlsProps {
  onStartOver: () => void;
  onDownload: () => void;
  isGenerating: boolean;
  isSaved: boolean;
}

export const DownloadControls = ({
  onStartOver,
  onDownload,
  isGenerating,
  isSaved,
}: DownloadControlsProps) => {
  return (
    <div className="flex flex-col gap-2 mt-4 w-full max-w-xs">
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="default"
          onClick={onStartOver}
          className="flex-1 text-sm"
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Retake
        </Button>
        <Button
          size="default"
          onClick={onDownload}
          disabled={isGenerating}
          className="flex-1 text-sm"
        >
          <Download className="w-4 h-4 mr-1.5" />
          Download
        </Button>
      </div>
      {isSaved && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-green-600">
          <Check className="w-3.5 h-3.5" />
          <span>Saved to Gallery</span>
        </div>
      )}
    </div>
  );
};
