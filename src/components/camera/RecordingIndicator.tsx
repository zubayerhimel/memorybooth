import { motion } from "motion/react";
import { Circle } from "lucide-react";

interface RecordingIndicatorProps {
  duration: number;
  maxDuration: number;
  isRecording: boolean;
}

export const RecordingIndicator = ({ duration, maxDuration, isRecording }: RecordingIndicatorProps) => {
  const progress = (duration / maxDuration) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isRecording) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} className="flex items-center gap-1">
        <Circle className="w-3 h-3 fill-red-500 text-red-500" />
      </motion.div>

      <span className="text-white text-sm font-medium tabular-nums">
        {formatTime(duration)} / {formatTime(maxDuration)}
      </span>

      {/* Progress bar */}
      <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
        <motion.div className="h-full bg-red-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
      </div>
    </motion.div>
  );
};
