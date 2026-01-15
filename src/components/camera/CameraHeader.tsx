import { motion } from 'motion/react';
import { MAX_PHOTOS } from '@/constants/camera';

interface CameraHeaderProps {
  photoCount: number;
}

export const CameraHeader = ({ photoCount }: CameraHeaderProps) => {
  const remainingPhotos = MAX_PHOTOS - photoCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="text-center mb-3 sm:mb-6"
    >
      <h2 className="font-display text-lg sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">
        {photoCount === 0 ? "Strike a Pose!" : `${remainingPhotos} photo${remainingPhotos !== 1 ? 's' : ''} left`}
      </h2>
      <p className="text-muted-foreground text-xs sm:text-base">
        {photoCount === 0 
          ? "Click the shutter to start capturing" 
          : "Keep going! Show us your best angles"}
      </p>
    </motion.div>
  );
};
