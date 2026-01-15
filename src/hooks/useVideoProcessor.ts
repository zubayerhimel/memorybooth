import { useState, useCallback } from "react";
import { FilterType } from "@/types/photobooth";

// Map filter IDs to canvas filter strings
const getCanvasFilter = (filter: FilterType): string => {
  const filterMap: Record<FilterType, string> = {
    none: "none",
    bw: "grayscale(100%)",
    sepia: "sepia(80%) saturate(120%)",
    vintage: "sepia(30%) contrast(110%) saturate(80%) brightness(105%)",
    "pop-art": "contrast(150%) saturate(200%) brightness(110%)",
    cool: "saturate(80%) hue-rotate(10deg) brightness(105%)",
    warm: "saturate(110%) sepia(15%) brightness(105%)",
    cyberpunk: "contrast(130%) saturate(150%) hue-rotate(300deg) brightness(95%)",
    neon: "contrast(120%) saturate(200%) brightness(110%) hue-rotate(330deg)",
    vaporwave: "saturate(180%) hue-rotate(260deg) contrast(90%) brightness(110%)",
    noir: "grayscale(100%) contrast(140%) brightness(90%)",
    dreamy: "saturate(130%) brightness(115%) contrast(90%)",
    electric: "saturate(250%) contrast(130%) hue-rotate(180deg) brightness(105%)",
    blur: "blur(2px) brightness(105%)",
    "soft-blur": "blur(1px) brightness(108%) contrast(95%)",
    "tilt-shift": "saturate(120%) contrast(110%)",
    haze: "brightness(115%) saturate(90%) contrast(85%)",
    dramatic: "contrast(150%) brightness(95%) saturate(110%)",
    sunset: "sepia(25%) saturate(140%) hue-rotate(-10deg) brightness(105%) contrast(105%)",
    cinema: "contrast(115%) saturate(85%) brightness(98%) sepia(10%)",
    retro: "sepia(40%) saturate(70%) contrast(120%) brightness(95%)",
    fade: "contrast(85%) brightness(115%) saturate(75%)",
    vibrant: "saturate(180%) contrast(110%) brightness(105%)",
    muted: "saturate(50%) contrast(95%) brightness(105%)",
    "x-ray": "invert(100%) grayscale(100%) contrast(150%) brightness(120%)",
    thermal: "saturate(200%) hue-rotate(180deg) contrast(130%) brightness(90%)",
    negative: "invert(100%)",
    duotone: "grayscale(100%) sepia(100%) hue-rotate(180deg) saturate(200%)",
    lomo: "contrast(150%) saturate(130%) sepia(10%) brightness(90%)",
    polaroid: "sepia(20%) contrast(110%) saturate(90%) brightness(110%)",
  };

  return filterMap[filter] || "none";
};

interface UseVideoProcessorReturn {
  processVideo: (blobUrl: string, filter: FilterType) => Promise<Blob>;
  isProcessing: boolean;
  progress: number;
  error: string | null;
}

export const useVideoProcessor = (): UseVideoProcessorReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const processVideo = useCallback(async (blobUrl: string, filter: FilterType): Promise<Blob> => {
    // If no filter, just return the original blob
    if (filter === "none") {
      const response = await fetch(blobUrl);
      return response.blob();
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = blobUrl;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";

      video.onloadedmetadata = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          setError("Failed to create canvas context");
          setIsProcessing(false);
          reject(new Error("Failed to create canvas context"));
          return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Set up MediaRecorder to capture the canvas
        const stream = canvas.captureStream(30); // 30 FPS

        const mimeTypes = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];

        let selectedMimeType = "";
        for (const mimeType of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            selectedMimeType = mimeType;
            break;
          }
        }

        if (!selectedMimeType) {
          setError("No supported video format found");
          setIsProcessing(false);
          reject(new Error("No supported video format"));
          return;
        }

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: selectedMimeType,
          videoBitsPerSecond: 2500000,
        });

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: selectedMimeType });
          setIsProcessing(false);
          setProgress(100);
          resolve(blob);
        };

        mediaRecorder.onerror = () => {
          setError("Recording failed");
          setIsProcessing(false);
          reject(new Error("Recording failed"));
        };

        // Get the canvas filter string
        const canvasFilter = getCanvasFilter(filter);
        const duration = video.duration;
        let animationFrameId: number;

        const drawFrame = () => {
          if (video.ended || video.paused) {
            return;
          }

          // Apply filter and draw frame
          ctx.filter = canvasFilter;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Update progress
          const progressPercent = Math.min((video.currentTime / duration) * 100, 99);
          setProgress(progressPercent);

          // Continue drawing
          animationFrameId = requestAnimationFrame(drawFrame);
        };

        video.onplay = () => {
          drawFrame();
        };

        video.onended = () => {
          cancelAnimationFrame(animationFrameId);
          // Give a small delay for the last frames to be captured
          setTimeout(() => {
            mediaRecorder.stop();
          }, 100);
        };

        // Start recording and playing
        mediaRecorder.start(100);
        video.play().catch((err) => {
          setError("Failed to play video");
          setIsProcessing(false);
          reject(err);
        });
      };

      video.onerror = () => {
        setError("Failed to load video");
        setIsProcessing(false);
        reject(new Error("Failed to load video"));
      };
    });
  }, []);

  return {
    processVideo,
    isProcessing,
    progress,
    error,
  };
};
