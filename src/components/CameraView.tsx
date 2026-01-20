import { COUNTDOWN_INTERVAL, DEFAULT_TIMER, DEFAULT_VIDEO_DURATION, EJECT_ANIMATION_DURATION, FLASH_DURATION, IMAGE_CAPTURE_INTERVAL, MAX_PHOTOS, VIDEO_COUNTDOWN_TIMER } from "@/constants/camera";
import { useCamera } from "@/hooks/useCamera";
import { useVideoRecorder } from "@/hooks/useVideoRecorder";
import { CaptureMode, Photo, VideoRecording } from "@/types/photobooth";
import { ArrowLeft, RefreshCcw, SwitchCamera } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CameraHeader, EjectingPhoto, ModeToggle, PhotoStripPreview, RecordingIndicator, VideoControls, VideoPreview } from "./camera";
import { CountdownOverlay } from "./camera/CountdownOverlay";
import { Button } from "./ui/button";

interface CameraViewProps {
  onPhotosComplete: (photos: Photo[]) => void;
  onVideoComplete: (video: VideoRecording) => void;
  onBack: () => void;
}

export const CameraView = ({ onPhotosComplete, onVideoComplete, onBack }: CameraViewProps) => {
  const { videoRef, canvasRef, isStreaming, error, facingMode, startCamera, stopCamera, capturePhoto, flipCamera } = useCamera();
  const streamRef = useRef<MediaStream | null>(null);

  // Capture mode state
  const [captureMode, setCaptureMode] = useState<CaptureMode>("photo");

  // Photo capture state
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState(DEFAULT_TIMER);
  const [showTimerOptions, setShowTimerOptions] = useState(false);
  const [ejectingPhoto, setEjectingPhoto] = useState<string | null>(null);

  // Video recording state
  const [selectedVideoDuration, setSelectedVideoDuration] = useState(DEFAULT_VIDEO_DURATION);
  const [showDurationOptions, setShowDurationOptions] = useState(false);
  const [videoCountdown, setVideoCountdown] = useState<number | null>(null);
  const [currentRecording, setCurrentRecording] = useState<VideoRecording | null>(null);

  // Video recorder hook
  const {
    isRecording,
    recordingDuration,
    maxDuration,
    startRecording,
    stopRecording,
    recording: completedRecording,
  } = useVideoRecorder({
    maxDuration: selectedVideoDuration,
    onRecordingComplete: (rec) => setCurrentRecording(rec),
  });

  useEffect(() => {
    const initCamera = async () => {
      await startCamera();
      // Get stream reference for video recording
      if (videoRef.current?.srcObject) {
        streamRef.current = videoRef.current.srcObject as MediaStream;
      }
    };
    initCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Update stream ref when camera starts
  useEffect(() => {
    if (isStreaming && videoRef.current?.srcObject) {
      streamRef.current = videoRef.current.srcObject as MediaStream;
    }
  }, [isStreaming]);

  const triggerFlash = useCallback(() => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), FLASH_DURATION);
  }, []);

  const processCapture = useCallback(
    (dataUrl: string) => {
      setEjectingPhoto(dataUrl);
      setTimeout(() => setEjectingPhoto(null), EJECT_ANIMATION_DURATION);

      const newPhoto: Photo = {
        id: crypto.randomUUID(),
        dataUrl,
        filter: "none",
        timestamp: Date.now(),
        stickers: [],
        textOverlays: [],
      };

      setPhotos((prev) => {
        const updated = [...prev, newPhoto];
        if (updated.length >= MAX_PHOTOS) {
          setTimeout(() => onPhotosComplete(updated), 800);
        }
        return updated;
      });
    },
    [onPhotosComplete],
  );

  const handleCapture = useCallback(() => {
    if (isCapturing || photos.length >= MAX_PHOTOS) return;

    setIsCapturing(true);
    setShowTimerOptions(false);

    if (selectedTimer === 0) {
      triggerFlash();
      const dataUrl = capturePhoto();

      if (dataUrl) {
        processCapture(dataUrl);
      }

      setIsCapturing(false);
      return;
    }

    let count = selectedTimer;
    setCountdown(count);

    const countdownInterval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countdownInterval);
        setCountdown(null);

        triggerFlash();
        const dataUrl = capturePhoto();

        if (dataUrl) {
          processCapture(dataUrl);
        }

        setIsCapturing(false);
      }
    }, COUNTDOWN_INTERVAL);
  }, [capturePhoto, isCapturing, photos.length, triggerFlash, selectedTimer, processCapture]);

  // Video recording handlers
  const handleStartRecording = useCallback(() => {
    if (!streamRef.current) return;

    setShowDurationOptions(false);

    // Start countdown before recording
    let count = VIDEO_COUNTDOWN_TIMER;
    setVideoCountdown(count);

    const countdownInterval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setVideoCountdown(count);
      } else {
        clearInterval(countdownInterval);
        setVideoCountdown(null);

        // Start actual recording with audio
        navigator.mediaDevices
          .getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: facingMode,
            },
            audio: true,
          })
          .then((streamWithAudio) => {
            startRecording(streamWithAudio);
          })
          .catch(() => {
            // Fallback to video-only if audio fails
            if (streamRef.current) {
              startRecording(streamRef.current);
            }
          });
      }
    }, COUNTDOWN_INTERVAL);
  }, [facingMode, startRecording]);

  const handleStopRecording = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  const handleConfirmVideo = useCallback(() => {
    if (currentRecording) {
      onVideoComplete(currentRecording);
    }
  }, [currentRecording, onVideoComplete]);

  const handleRetakeVideo = useCallback(() => {
    if (currentRecording?.blobUrl) {
      URL.revokeObjectURL(currentRecording.blobUrl);
    }
    setCurrentRecording(null);
  }, [currentRecording]);

  const handleRetake = () => {
    setPhotos([]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTimerSelect = (time: number) => {
    setSelectedTimer(time);
    setShowTimerOptions(false);
  };

  const handleDurationSelect = (duration: number) => {
    setSelectedVideoDuration(duration);
    setShowDurationOptions(false);
  };

  const handleModeChange = (mode: CaptureMode) => {
    if (isRecording || isCapturing) return;
    setCaptureMode(mode);
    setShowTimerOptions(false);
    setShowDurationOptions(false);
  };

  // Determine if we should show countdown (either photo or video)
  const activeCountdown = captureMode === "photo" ? countdown : videoCountdown;

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 pt-4 sm:pt-6">
      <div className="w-full max-w-4xl">
        {/* Mode Toggle */}
        <div className="flex justify-center mb-3 sm:mb-4">
          <ModeToggle mode={captureMode} onModeChange={handleModeChange} disabled={isRecording || isCapturing} />
        </div>

        {captureMode === "photo" ? (
          <CameraHeader photoCount={photos.length} />
        ) : (
          <div className="text-center mb-3 sm:mb-6">
            <h2 className="font-display text-lg sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">{isRecording ? "Recording..." : currentRecording ? "Review Your Video" : "Record a Video"}</h2>
            <p className="text-muted-foreground text-xs sm:text-base">
              {isRecording ? "Tap stop when you're done" : currentRecording ? "Preview and confirm your video" : `Record up to ${selectedVideoDuration} seconds of video`}
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center justify-center">
          {/* Camera/Video Body */}
          <div className="camera-body p-2 sm:p-4 animate-fade-scale-in w-full max-w-md lg:max-w-none relative">
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-foreground/10">
              {/* Video feed */}
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto aspect-[4/3] object-cover transform scale-x-[-1]" />

              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Flash overlay (photo mode) */}
              {showFlash && <div className="absolute inset-0 bg-white animate-flash pointer-events-none z-30" />}

              {/* Countdown overlay */}
              {activeCountdown !== null && <CountdownOverlay countdown={activeCountdown} />}

              {/* Recording indicator (video mode) */}
              <RecordingIndicator duration={recordingDuration} maxDuration={maxDuration} isRecording={isRecording} />

              {/* Error state */}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <p className="text-white text-center">{error}</p>
                </div>
              )}

              {/* Loading state */}
              {!isStreaming && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Ejecting Photo Animation (photo mode) */}
            {ejectingPhoto && <EjectingPhoto photoDataUrl={ejectingPhoto} />}

            {/* Controls based on mode */}
            {captureMode === "photo" ? (
              <div className="flex items-center justify-center gap-2 sm:gap-4 mt-4 sm:mt-6">
                <Button variant="secondary" size="icon" onClick={onBack} disabled={isCapturing} className="h-10 w-10 sm:h-12 sm:w-12">
                  <ArrowLeft />
                </Button>

                <div className="relative">
                  <Button variant="secondary" size="icon" onClick={() => setShowTimerOptions(!showTimerOptions)} disabled={isCapturing} className="h-10 w-10 sm:h-12 sm:w-12 disabled:opacity-50">
                    <span className="text-xs font-bold">{selectedTimer}s</span>
                  </Button>
                  {showTimerOptions && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-popover border rounded-lg p-2 flex gap-1 z-10">
                      {IMAGE_CAPTURE_INTERVAL.map((time) => (
                        <Button className="h-8 w-10" size="sm" variant={selectedTimer === time ? "default" : "ghost"} key={time} onClick={() => handleTimerSelect(time)}>
                          {time}s
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCapture}
                  disabled={!isStreaming || isCapturing || photos.length >= MAX_PHOTOS}
                  className="shutter-button w-14 h-14 sm:w-20 sm:h-20 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={flipCamera}
                  disabled={isCapturing}
                  className="h-10 w-10 sm:h-12 sm:w-12"
                  title={facingMode === "user" ? "Switch to back camera" : "Switch to front camera"}>
                  <SwitchCamera className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>

                <Button title="Retake photos" variant="secondary" onClick={handleRetake} disabled={photos.length === 0} className="h-10 w-10 sm:h-12 sm:w-12 disabled:opacity-50">
                  <RefreshCcw />
                </Button>
              </div>
            ) : (
              <VideoControls
                onBack={onBack}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                onFlipCamera={flipCamera}
                selectedDuration={selectedVideoDuration}
                showDurationOptions={showDurationOptions}
                onDurationToggle={() => setShowDurationOptions(!showDurationOptions)}
                onDurationSelect={handleDurationSelect}
                isStreaming={isStreaming}
                isRecording={isRecording}
                hasRecording={!!currentRecording}
                facingMode={facingMode}
              />
            )}
          </div>

          {/* Side panel based on mode */}
          {captureMode === "photo" ? (
            <PhotoStripPreview photos={photos} onRemovePhoto={handleRemovePhoto} />
          ) : currentRecording ? (
            <VideoPreview recording={currentRecording} onConfirm={handleConfirmVideo} onRetake={handleRetakeVideo} />
          ) : null}
        </div>
      </div>
    </div>
  );
};
