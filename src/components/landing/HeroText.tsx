import { motion } from 'motion/react';

interface HeroTextProps {
  title?: string;
  highlightedText?: string;
  subtitle?: string;
}

export const HeroText = ({
  title = "Instant",
  highlightedText = "Photo Booth",
  subtitle = "Capture memories, add fun filters, and download your photo strip in seconds!",
}: HeroTextProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
      className="text-center mb-6 sm:mb-8 px-2"
    >
      <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-3">
        {title} <span className="bg-gradient-to-r from-primary to-[hsl(20,80%,70%)] bg-clip-text text-transparent">{highlightedText}</span>
      </h1>
      <p className="text-muted-foreground text-sm sm:text-lg max-w-md">
        {subtitle}
      </p>
    </motion.div>
  );
};
