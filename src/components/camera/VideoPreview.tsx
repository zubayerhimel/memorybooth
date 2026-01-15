import { motion } from "motion/react";
import { Play, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoRecording } from "@/types/photobooth";

interface VideoPreviewProps {
  recording: VideoRecording;
  onConfirm: () => void;
  onRetake: () => void;
}

export const VideoPreview = ({ recording, onConfirm, onRetake }: VideoPreviewProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-xs bg-card rounded-2xl shadow-xl overflow-hidden">
      <div className="p-3">
        <h3 className="text-sm font-medium text-center mb-2">Preview Your Video</h3>

        {/* Video Player */}
        <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
          <video src={recording.blobUrl} controls playsInline className="w-full h-full object-cover" />

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-xs text-white font-medium">{formatDuration(recording.duration)}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 p-3 pt-0">
        <Button variant="destructive" onClick={onRetake} className="flex-1 gap-1">
          <Trash2 className="w-4 h-4" />
          Retake
        </Button>

        <Button variant="default" onClick={onConfirm} className="flex-1 gap-1">
          <Check className="w-4 h-4" />
          Use This
        </Button>
      </div>
    </motion.div>
  );
};
