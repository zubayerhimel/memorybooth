import { Camera, Video } from "lucide-react";
import { CaptureMode } from "@/types/photobooth";

interface ModeToggleProps {
  mode: CaptureMode;
  onModeChange: (mode: CaptureMode) => void;
  disabled?: boolean;
}

export const ModeToggle = ({ mode, onModeChange, disabled }: ModeToggleProps) => {
  return (
    <div className="inline-flex items-center bg-black/40 backdrop-blur-sm rounded-full p-1">
      <button
        onClick={() => onModeChange("photo")}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${mode === "photo" ? "bg-white text-black" : "text-white/80 hover:text-white"} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}>
        <Camera className="w-4 h-4" />
        <span className="hidden sm:inline">Photo</span>
      </button>

      <button
        onClick={() => onModeChange("video")}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${mode === "video" ? "bg-red-500 text-white" : "text-white/80 hover:text-white"} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}>
        <Video className="w-4 h-4" />
        <span className="hidden sm:inline">Video</span>
      </button>
    </div>
  );
};
