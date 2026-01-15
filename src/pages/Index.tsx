import { useState, useCallback } from "react";
import { LandingPage } from "@/components/LandingPage";
import { CameraView } from "@/components/CameraView";
import { FilterEditor } from "@/components/FilterEditor";
import { StickerEditor } from "@/components/StickerEditor";
import { DownloadView } from "@/components/DownloadView";
import { VideoFilterEditor } from "@/components/VideoFilterEditor";
import { VideoDownloadView } from "@/components/VideoDownloadView";
import { Photo, VideoRecording, AppStep } from "@/types/photobooth";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>("landing");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [video, setVideo] = useState<VideoRecording | null>(null);

  const handleStart = useCallback(() => {
    setCurrentStep("camera");
  }, []);

  const handlePhotosComplete = useCallback((capturedPhotos: Photo[]) => {
    setPhotos(capturedPhotos);
    setCurrentStep("filters");
  }, []);

  const handleVideoComplete = useCallback((capturedVideo: VideoRecording) => {
    setVideo(capturedVideo);
    setCurrentStep("video-filters");
  }, []);

  const handleFiltersComplete = useCallback((editedPhotos: Photo[]) => {
    setPhotos(editedPhotos);
    setCurrentStep("stickers");
  }, []);

  const handleVideoFiltersComplete = useCallback((editedVideo: VideoRecording) => {
    setVideo(editedVideo);
    setCurrentStep("video-download");
  }, []);

  const handleStickersComplete = useCallback((stickerPhotos: Photo[]) => {
    setPhotos(stickerPhotos);
    setCurrentStep("download");
  }, []);

  const handleStartOver = useCallback(() => {
    setPhotos([]);
    setVideo(null);
    setCurrentStep("landing");
  }, []);

  const handleBackToCamera = useCallback(() => {
    setPhotos([]);
    setVideo(null);
    setCurrentStep("camera");
  }, []);

  const handleBackToFilters = useCallback(() => {
    setCurrentStep("filters");
  }, []);

  const handleBackToVideoFilters = useCallback(() => {
    setCurrentStep("video-filters");
  }, []);

  return (
    <main className="min-h-screen">
      {currentStep === "landing" && <LandingPage onStart={handleStart} />}

      {currentStep === "camera" && <CameraView onPhotosComplete={handlePhotosComplete} onVideoComplete={handleVideoComplete} onBack={handleStartOver} />}

      {currentStep === "filters" && <FilterEditor photos={photos} onComplete={handleFiltersComplete} onBack={handleBackToCamera} />}

      {currentStep === "stickers" && <StickerEditor photos={photos} onComplete={handleStickersComplete} onBack={handleBackToFilters} />}

      {currentStep === "download" && <DownloadView photos={photos} onStartOver={handleStartOver} />}

      {/* Video flow */}
      {currentStep === "video-filters" && video && <VideoFilterEditor video={video} onComplete={handleVideoFiltersComplete} onBack={handleBackToCamera} />}

      {currentStep === "video-download" && video && <VideoDownloadView video={video} onStartOver={handleStartOver} />}
    </main>
  );
};

export default Index;
