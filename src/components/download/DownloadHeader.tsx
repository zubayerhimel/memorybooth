import { motion } from 'motion/react';

interface DownloadHeaderProps {
  title?: string;
  subtitle?: string;
}

export const DownloadHeader = ({ 
  title = "Your Photos Are Ready! ✨",
  subtitle = "Customize your layout and download"
}: DownloadHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="text-center mb-4 sm:mb-6"
    >
      <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1">
        {title}
      </h2>
      <p className="text-muted-foreground text-xs sm:text-sm">
        {subtitle}
      </p>
    </motion.div>
  );
};
