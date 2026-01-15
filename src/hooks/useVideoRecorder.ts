import { useState, useRef, useCallback, useEffect } from "react";
import { VideoRecording } from "@/types/photobooth";
import { VIDEO_MIN_DURATION, VIDEO_MAX_DURATION } from "@/constants/camera";

interface UseVideoRecorderOptions {
  maxDuration?: number;
  onRecordingComplete?: (recording: VideoRecording) => void;
}

interface UseVideoRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  recordingDuration: number;
  maxDuration: number;
  startRecording: (stream: MediaStream) => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  recording: VideoRecording | null;
  error: string | null;
}

export const useVideoRecorder = (options: UseVideoRecorderOptions = {}): UseVideoRecorderReturn => {
  const { maxDuration = VIDEO_MAX_DURATION, onRecordingComplete } = options;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState<VideoRecording | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startDurationTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setRecordingDuration(elapsed);

      // Auto-stop at max duration
      if (elapsed >= maxDuration) {
        stopRecording();
      }
    }, 100);
  }, [maxDuration]);

  const stopDurationTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(
    (stream: MediaStream) => {
      try {
        setError(null);
        chunksRef.current = [];

        // Determine the best supported MIME type
        const mimeTypes = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"];

        let selectedMimeType = "";
        for (const mimeType of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            selectedMimeType = mimeType;
            break;
          }
        }

        if (!selectedMimeType) {
          setError("No supported video format found");
          return;
        }

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: selectedMimeType,
          videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: selectedMimeType });
          const blobUrl = URL.createObjectURL(blob);
          const duration = Math.max(recordingDuration, VIDEO_MIN_DURATION);

          const newRecording: VideoRecording = {
            id: crypto.randomUUID(),
            blobUrl,
            blob,
            duration,
            filter: "none",
            timestamp: Date.now(),
          };

          setRecording(newRecording);
          onRecordingComplete?.(newRecording);
          stopDurationTimer();
        };

        mediaRecorder.onerror = () => {
          setError("Recording failed");
          setIsRecording(false);
          stopDurationTimer();
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(100); // Collect data every 100ms
        setIsRecording(true);
        setIsPaused(false);
        setRecordingDuration(0);
        startDurationTimer();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to start recording";
        setError(errorMessage);
        console.error("Video recording error:", err);
      }
    },
    [onRecordingComplete, recordingDuration, startDurationTimer, stopDurationTimer]
  );

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopDurationTimer();
    }
  }, [stopDurationTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startDurationTimer();
    }
  }, [startDurationTimer]);

  return {
    isRecording,
    isPaused,
    recordingDuration,
    maxDuration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    recording,
    error,
  };
};
