import { useState } from "react";
import { motion } from "motion/react";
import { Check, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoRecording, FilterType, FilterOption } from "@/types/photobooth";

interface VideoFilterEditorProps {
  video: VideoRecording;
  onComplete: (video: VideoRecording) => void;
  onBack: () => void;
}

const FILTERS: FilterOption[] = [
  { id: "none", name: "Original", className: "" },
  { id: "bw", name: "B&W", className: "filter-bw" },
  { id: "sepia", name: "Sepia", className: "filter-sepia" },
  { id: "vintage", name: "Vintage", className: "filter-vintage" },
  { id: "pop-art", name: "Pop Art", className: "filter-pop-art" },
  { id: "cool", name: "Cool", className: "filter-cool" },
  { id: "warm", name: "Warm", className: "filter-warm" },
  { id: "cyberpunk", name: "Cyberpunk", className: "filter-cyberpunk" },
  { id: "neon", name: "Neon", className: "filter-neon" },
  { id: "vaporwave", name: "Vaporwave", className: "filter-vaporwave" },
  { id: "noir", name: "Noir", className: "filter-noir" },
  { id: "dreamy", name: "Dreamy", className: "filter-dreamy" },
  { id: "electric", name: "Electric", className: "filter-electric" },
  { id: "dramatic", name: "Dramatic", className: "filter-dramatic" },
  { id: "sunset", name: "Sunset", className: "filter-sunset" },
  { id: "cinema", name: "Cinema", className: "filter-cinema" },
  { id: "retro", name: "Retro", className: "filter-retro" },
  { id: "fade", name: "Fade", className: "filter-fade" },
  { id: "vibrant", name: "Vibrant", className: "filter-vibrant" },
  { id: "muted", name: "Muted", className: "filter-muted" },
  { id: "negative", name: "Negative", className: "filter-negative" },
  { id: "duotone", name: "Duotone", className: "filter-duotone" },
  { id: "lomo", name: "Lomo", className: "filter-lomo" },
  { id: "polaroid", name: "Polaroid", className: "filter-polaroid" },
];

export const VideoFilterEditor = ({ video, onComplete, onBack }: VideoFilterEditorProps) => {
  const [editedVideo, setEditedVideo] = useState<VideoRecording>(video);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFilterChange = (filter: FilterType) => {
    setEditedVideo((prev) => ({ ...prev, filter }));
  };

  const getFilterClass = (filter: FilterType): string => {
    return FILTERS.find((f) => f.id === filter)?.className || "";
  };

  const handlePlayPause = () => {
    const videoElement = document.getElementById("video-preview") as HTMLVideoElement;
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 pt-4 sm:pt-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="text-center mb-4 sm:mb-8">
          <h2 className="font-display text-lg sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">Style Your Video 🎬</h2>
          <p className="text-muted-foreground text-xs sm:text-base">Apply a filter to enhance your video</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 items-start justify-center">
          {/* Main video preview */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="flex-1 w-full max-w-lg mx-auto">
            <div className="photo-frame">
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  id="video-preview"
                  src={editedVideo.blobUrl}
                  loop
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className={`w-full aspect-[4/3] object-cover transition-all duration-300 ${getFilterClass(editedVideo.filter)}`}
                />

                {/* Play/Pause overlay */}
                <button onClick={handlePlayPause} className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    {isPlaying ? <Pause className="w-8 h-8 text-black" /> : <Play className="w-8 h-8 text-black ml-1" />}
                  </div>
                </button>

                {/* Duration badge */}
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-sm text-white font-medium">{formatDuration(editedVideo.duration)}</div>
              </div>
            </div>

            {/* Current filter label */}
            <div className="flex justify-center mt-4">
              <span className="bg-card px-4 py-2 rounded-full text-sm font-medium shadow-soft">Filter: {FILTERS.find((f) => f.id === editedVideo.filter)?.name || "Original"}</span>
            </div>
          </motion.div>

          {/* Filters panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }} className="w-full lg:w-72">
            <div className="bg-card rounded-xl sm:rounded-2xl p-4 shadow-card">
              <h3 className="font-display font-semibold text-base sm:text-lg mb-3 sm:mb-4">Video Filters</h3>

              {/* Filter options */}
              <div className="grid grid-cols-3 sm:grid-cols-2 gap-1.5 sm:gap-2 max-h-[35vh] sm:max-h-[50vh] overflow-y-auto pl-1 pr-1.5 custom-scrollbar">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterChange(filter.id)}
                    className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
                      editedVideo.filter === filter.id ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : "hover:opacity-90"
                    }`}>
                    {/* Use first frame preview or placeholder */}
                    <div className={`w-full aspect-square bg-gradient-to-br from-primary/30 to-secondary/30 ${filter.className}`}>
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-foreground/50" />
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent py-2">
                      <span className="text-xs font-medium text-card">{filter.name}</span>
                    </div>
                    {editedVideo.filter === filter.id && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <Button variant="secondary" className="flex-1 text-sm sm:text-base" onClick={onBack}>
                Back
              </Button>
              <Button className="flex-1 text-sm sm:text-base" onClick={() => onComplete(editedVideo)}>
                Continue
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
