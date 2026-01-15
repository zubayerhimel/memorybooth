import { Square, Video, RotateCcw, SwitchCamera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoDurationSelector } from "./VideoDurationSelector";

interface VideoControlsProps {
  onBack: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onFlipCamera: () => void;
  selectedDuration: number;
  showDurationOptions: boolean;
  onDurationToggle: () => void;
  onDurationSelect: (duration: number) => void;
  isStreaming: boolean;
  isRecording: boolean;
  hasRecording: boolean;
  facingMode: "user" | "environment";
}

export const VideoControls = ({
  onBack,
  onStartRecording,
  onStopRecording,
  onFlipCamera,
  selectedDuration,
  showDurationOptions,
  onDurationToggle,
  onDurationSelect,
  isStreaming,
  isRecording,
  hasRecording,
  facingMode,
}: VideoControlsProps) => {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mt-4 sm:mt-6">
      <Button variant="secondary" size="icon" onClick={onBack} disabled={isRecording} className="h-10 w-10 sm:h-12 sm:w-12">
        <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>

      <VideoDurationSelector selectedDuration={selectedDuration} showOptions={showDurationOptions} isDisabled={isRecording} onToggle={onDurationToggle} onSelect={onDurationSelect} />

      {/* Record/Stop Button */}
      <button
        onClick={isRecording ? onStopRecording : onStartRecording}
        disabled={!isStreaming || hasRecording}
        className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
          isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-red-500 hover:bg-red-600"
        } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}>
        {isRecording ? <Square className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" /> : <Video className="w-6 h-6 sm:w-8 sm:h-8 text-white" />}
      </button>

      <Button
        variant="secondary"
        size="icon"
        onClick={onFlipCamera}
        disabled={isRecording}
        className="h-10 w-10 sm:h-12 sm:w-12"
        title={facingMode === "user" ? "Switch to back camera" : "Switch to front camera"}>
        <SwitchCamera className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>

      {/* Placeholder for layout balance */}
      <div className="h-10 w-10 sm:h-12 sm:w-12" />
    </div>
  );
};
