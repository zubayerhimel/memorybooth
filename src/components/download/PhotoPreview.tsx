import { RefObject } from 'react';

interface PhotoPreviewProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  isGenerating: boolean;
}

export const PhotoPreview = ({ canvasRef, isGenerating }: PhotoPreviewProps) => {
  return (
    <div className="relative w-full flex justify-center">
      <div className="photo-strip p-3 sm:p-4 shadow-photo inline-block">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto rounded-lg mx-auto"
          style={{ maxHeight: '55vh' }}
        />

        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-2xl">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="font-medium text-foreground text-sm">Creating...</p>
            </div>
          </div>
        )}
      </div>
      {/* Decorative tape */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 sm:w-14 h-3 sm:h-5 bg-yellow/80 rotate-2 rounded-sm" />
    </div>
  );
};
