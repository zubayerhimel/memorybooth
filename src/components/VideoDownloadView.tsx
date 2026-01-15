import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Download, Share2, Play, Pause, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoRecording, FilterType, FilterOption } from "@/types/photobooth";
import { useVideoProcessor } from "@/hooks/useVideoProcessor";
import { toast } from "sonner";

interface VideoDownloadViewProps {
  video: VideoRecording;
  onStartOver: () => void;
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

export const VideoDownloadView = ({ video, onStartOver }: VideoDownloadViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { processVideo, isProcessing, progress } = useVideoProcessor();

  const getFilterClass = (filter: FilterType): string => {
    return FILTERS.find((f) => f.id === filter)?.className || "";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      // Process video with filter applied
      const processedBlob = await processVideo(video.blobUrl, video.filter);
      const processedUrl = URL.createObjectURL(processedBlob);

      const link = document.createElement("a");
      link.href = processedUrl;
      link.download = `memorybooth-video-${Date.now()}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      URL.revokeObjectURL(processedUrl);

      toast.success("Video downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download video");
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      // Process video with filter for sharing
      const processedBlob = await processVideo(video.blobUrl, video.filter);

      if (navigator.share) {
        const file = new File([processedBlob], "memorybooth-video.webm", { type: "video/webm" });

        await navigator.share({
          title: "My MemoryBooth Video",
          text: "Check out my video from MemoryBooth!",
          files: [file],
        });

        toast.success("Video shared successfully!");
      } else {
        // Fallback: download the processed video
        const processedUrl = URL.createObjectURL(processedBlob);
        await navigator.clipboard.writeText(processedUrl);
        toast.info("Video link copied to clipboard!");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error("Failed to share video");
      }
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 pt-4 sm:pt-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="text-center mb-6 sm:mb-8">
          <h2 className="font-display text-xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Your Video is Ready! 🎥</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Download or share your amazing video</p>
        </motion.div>

        {/* Video Preview */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-6">
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                src={video.blobUrl}
                loop
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className={`w-full aspect-video object-contain ${getFilterClass(video.filter)}`}
              />

              {/* Play/Pause overlay */}
              <button onClick={handlePlayPause} className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors group">
                <div className={`w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transition-all ${isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
                  {isPlaying ? <Pause className="w-7 h-7 text-black" /> : <Play className="w-7 h-7 text-black ml-1" />}
                </div>
              </button>

              {/* Duration badge */}
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-sm text-white font-medium">{formatDuration(video.duration)}</div>

              {/* Filter badge */}
              {video.filter !== "none" && (
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-sm text-white font-medium">{FILTERS.find((f) => f.id === video.filter)?.name}</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-3">
          {/* Processing indicator */}
          {isProcessing && (
            <div className="bg-card rounded-lg p-3 mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Processing video with filter...</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Primary actions */}
          <div className="flex gap-3">
            <Button size="lg" onClick={handleDownload} disabled={isDownloading || isProcessing} className="flex-1 gap-2">
              {isDownloading || isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isProcessing ? "Processing..." : "Downloading..."}
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download
                </>
              )}
            </Button>

            <Button size="lg" variant="secondary" onClick={handleShare} disabled={isProcessing} className="flex-1 gap-2">
              <Share2 className="w-5 h-5" />
              Share
            </Button>
          </div>

          {/* Start Over */}
          <Button variant="outline" size="lg" onClick={onStartOver} disabled={isProcessing} className="w-full gap-2">
            <RotateCcw className="w-5 h-5" />
            Start Over
          </Button>
        </motion.div>

        {/* Tips */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">💡 Tip: Videos are saved in WebM format for best quality and compatibility</p>
        </motion.div>
      </div>
    </div>
  );
};
