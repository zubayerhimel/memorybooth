import { useState, useCallback } from 'react';
import { LandingPage } from '@/components/LandingPage';
import { CameraView } from '@/components/CameraView';
import { FilterEditor } from '@/components/FilterEditor';
import { StickerEditor } from '@/components/StickerEditor';
import { DownloadView } from '@/components/DownloadView';
import { Photo, AppStep } from '@/types/photobooth';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('landing');
  const [photos, setPhotos] = useState<Photo[]>([]);

  const handleStart = useCallback(() => {
    setCurrentStep('camera');
  }, []);

  const handlePhotosComplete = useCallback((capturedPhotos: Photo[]) => {
    setPhotos(capturedPhotos);
    setCurrentStep('filters');
  }, []);

  const handleFiltersComplete = useCallback((editedPhotos: Photo[]) => {
    setPhotos(editedPhotos);
    setCurrentStep('stickers');
  }, []);

  const handleStickersComplete = useCallback((stickerPhotos: Photo[]) => {
    setPhotos(stickerPhotos);
    setCurrentStep('download');
  }, []);

  const handleStartOver = useCallback(() => {
    setPhotos([]);
    setCurrentStep('landing');
  }, []);

  const handleBackToCamera = useCallback(() => {
    setPhotos([]);
    setCurrentStep('camera');
  }, []);

  const handleBackToFilters = useCallback(() => {
    setCurrentStep('filters');
  }, []);

  return (
    <main className="min-h-screen">
      {currentStep === 'landing' && (
        <LandingPage onStart={handleStart} />
      )}
      
      {currentStep === 'camera' && (
        <CameraView 
          onPhotosComplete={handlePhotosComplete}
          onBack={handleStartOver}
        />
      )}
      
      {currentStep === 'filters' && (
        <FilterEditor
          photos={photos}
          onComplete={handleFiltersComplete}
          onBack={handleBackToCamera}
        />
      )}

      {currentStep === 'stickers' && (
        <StickerEditor
          photos={photos}
          onComplete={handleStickersComplete}
          onBack={handleBackToFilters}
        />
      )}
      
      {currentStep === 'download' && (
        <DownloadView
          photos={photos}
          onStartOver={handleStartOver}
        />
      )}
    </main>
  );
};

export default Index;
