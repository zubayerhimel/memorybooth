import { useState, useCallback } from 'react';
import { LandingPage } from '@/components/LandingPage';
import { CameraView } from '@/components/CameraView';
import { FilterEditor } from '@/components/FilterEditor';
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
