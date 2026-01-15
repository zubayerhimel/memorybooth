import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Photo } from '@/types/photobooth';
import { MAX_PHOTOS } from '@/constants/camera';

interface PhotoStripPreviewProps {
  photos: Photo[];
  onRemovePhoto: (index: number) => void;
}

export const PhotoStripPreview = ({ photos, onRemovePhoto }: PhotoStripPreviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
      className="photo-strip w-full sm:w-40"
    >
      <div className="flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0">
        {[...Array(MAX_PHOTOS)].map((_, index) => (
          <div
            key={index}
            className={`relative group flex-shrink-0 w-20 h-16 sm:w-full sm:h-auto sm:aspect-[4/3] rounded-lg overflow-hidden transition-all duration-300 ${
              photos[index] 
                ? 'shadow-soft' 
                : 'bg-muted border-2 border-dashed border-border'
            }`}
          >
            {photos[index] ? (
              <>
                <img
                  src={photos[index].dataUrl}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover animate-fade-scale-in"
                />
                {/* Delete button - shows on hover/tap */}
                <button
                  onClick={() => onRemovePhoto(index)}
                  className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 bg-destructive/90 hover:bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-md"
                  title="Remove this photo"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                {/* Photo number badge */}
                <div className="absolute bottom-1 left-1 w-5 h-5 bg-black/50 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {index + 1}
                </div>
              </>
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
        {photos.length > 0 && (
          <p className="text-[10px] text-muted-foreground mt-0.5">Tap photo to remove</p>
        )}
      </div>
    </motion.div>
  );
};
