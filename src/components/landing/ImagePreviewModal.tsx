import { motion } from 'motion/react';
import { X, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GallerySession } from '@/types/photobooth';

interface ImagePreviewModalProps {
  session: GallerySession;
  onClose: () => void;
  onDownload: (session: GallerySession) => void;
  onRemove: (id: string) => void;
}

export const ImagePreviewModal = ({
  session,
  onClose,
  onDownload,
  onRemove,
}: ImagePreviewModalProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-2xl flex flex-col items-center my-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button
          size="icon"
          variant="secondary"
          className="absolute -top-2 right-0 sm:-top-12 z-10"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
        
        {/* Image container with max height */}
        <div className="w-full flex justify-center pt-10 sm:pt-0">
          <img
            src={session.thumbnailUrl}
            alt="Photo session preview"
            className="max-w-full max-h-[75vh] sm:max-h-[80vh] w-auto h-auto rounded-lg shadow-2xl object-contain"
          />
        </div>
        
        {/* Action buttons - always visible */}
        <div className="flex justify-center gap-3 mt-4 pb-4">
          <Button
            variant="secondary"
            size="sm"
            className="sm:size-default"
            onClick={() => onDownload(session)}
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="sm:size-default"
            onClick={() => {
              onRemove(session.id);
              onClose();
            }}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
