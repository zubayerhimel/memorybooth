import { motion } from 'motion/react';
import { Camera, Sparkles, Download } from 'lucide-react';

export const FeatureBadges = () => {
  const features = [
    { icon: <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-accent-foreground" />, label: '4 Photos', bgColor: 'bg-accent/30' },
    { icon: <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-foreground" />, label: 'Fun Filters', bgColor: 'bg-yellow/30' },
    { icon: <Download className="w-3 h-3 sm:w-4 sm:h-4 text-sky-foreground" />, label: 'Easy Download', bgColor: 'bg-sky/30' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
      className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-6 sm:mb-10"
    >
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${feature.bgColor} flex items-center justify-center`}>
            {feature.icon}
          </div>
          <span className="font-medium">{feature.label}</span>
        </div>
      ))}
    </motion.div>
  );
};
