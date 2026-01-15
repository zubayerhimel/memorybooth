import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Photo, TemplateTheme, GifTransition } from '@/types/photobooth';
import { useGalleryHistory } from '@/hooks/useGalleryHistory';
import { usePhotoStripGenerator } from '@/hooks/usePhotoStripGenerator';
import { useGifGenerator } from '@/hooks/useGifGenerator';
import { LayoutType } from '@/constants/layouts';
import { FrameStyle } from '@/constants/frames';
import { DEFAULT_GIF_DELAY } from '@/constants/gif';
import {
  DownloadHeader,
  PhotoPreview,
  DownloadControls,
  TabNavigation,
  LayoutSelector,
  TemplateSelector,
  GifGenerator,
} from './download';

interface DownloadViewProps {
  photos: Photo[];
  onStartOver: () => void;
}

type TabType = 'layout' | 'template' | 'gif';

export const DownloadView = ({ photos, onStartOver }: DownloadViewProps) => {
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('vertical');
  const [selectedFrame, setSelectedFrame] = useState<FrameStyle>('classic');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateTheme>('none');
  const [selectedGifTransition, setSelectedGifTransition] = useState<GifTransition>('fade');
  const [gifDelay, setGifDelay] = useState(DEFAULT_GIF_DELAY);
  const [activeTab, setActiveTab] = useState<TabType>('layout');
  const [isSaved, setIsSaved] = useState(false);
  
  // Custom text for header and footer
  const [customHeaderText, setCustomHeaderText] = useState('');
  const [customFooterText, setCustomFooterText] = useState('');
  
  // Debounced versions
  const [debouncedHeaderText, setDebouncedHeaderText] = useState('');
  const [debouncedFooterText, setDebouncedFooterText] = useState('');
  
  // Gallery history hook
  const { addSession } = useGalleryHistory();
  
  // Debounce the custom text inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHeaderText(customHeaderText);
    }, 500);
    return () => clearTimeout(timer);
  }, [customHeaderText]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFooterText(customFooterText);
    }, 500);
    return () => clearTimeout(timer);
  }, [customFooterText]);

  // Photo strip generator hook
  const { canvasRef, isGenerating, stripDataUrl, templateConfig } = usePhotoStripGenerator({
    photos,
    selectedLayout,
    selectedFrame,
    selectedTemplate,
    debouncedHeaderText,
    debouncedFooterText,
  });

  // GIF generator hook
  const { isGeneratingGif, gifDataUrl, generateAnimatedGif } = useGifGenerator({
    photos,
    selectedGifTransition,
    gifDelay,
  });

  // Save to gallery history
  const handleSaveToGallery = useCallback(() => {
    if (!stripDataUrl || isSaved) return;
    
    addSession({
      thumbnailUrl: stripDataUrl,
      gifUrl: gifDataUrl || undefined,
      layout: selectedLayout,
      template: selectedTemplate,
      photoCount: photos.length,
    });
    
    setIsSaved(true);
  }, [stripDataUrl, gifDataUrl, selectedLayout, selectedTemplate, photos.length, addSession, isSaved]);

  const handleDownload = () => {
    if (!stripDataUrl) return;

    // Auto-save to gallery on first download
    if (!isSaved) {
      handleSaveToGallery();
    }

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    link.download = `photo-booth-${selectedLayout}-${selectedTemplate !== 'none' ? selectedTemplate + '-' : ''}${timestamp}.png`;
    link.href = stripDataUrl;
    link.click();
  };

  const handleDownloadGif = () => {
    if (!gifDataUrl) return;

    // Auto-save to gallery on first download (if not already saved)
    if (!isSaved && stripDataUrl) {
      handleSaveToGallery();
    }

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    link.download = `photo-booth-animated-${timestamp}.gif`;
    link.href = gifDataUrl;
    link.click();
  };

  const handleResetText = () => {
    setCustomHeaderText('');
    setCustomFooterText('');
    setDebouncedHeaderText('');
    setDebouncedFooterText('');
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center p-3 sm:p-6 pt-4 sm:pt-6 overflow-auto">
      <DownloadHeader />

      {/* Main Content - Two Column Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        className="w-full max-w-5xl flex flex-col lg:flex-row gap-4 lg:gap-6"
      >
        
        {/* Left Side - Photo Preview */}
        <div className="lg:w-1/2 flex flex-col items-center">
          <PhotoPreview
            canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
            isGenerating={isGenerating}
          />

          <DownloadControls
            onStartOver={onStartOver}
            onDownload={handleDownload}
            isGenerating={isGenerating}
            isSaved={isSaved}
          />
        </div>

        {/* Right Side - Controls Panel */}
        <div className="lg:w-1/2">
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'layout' && (
                <LayoutSelector
                  selectedLayout={selectedLayout}
                  selectedFrame={selectedFrame}
                  onLayoutChange={setSelectedLayout}
                  onFrameChange={setSelectedFrame}
                />
              )}

              {activeTab === 'template' && (
                <TemplateSelector
                  selectedTemplate={selectedTemplate}
                  templateConfig={templateConfig}
                  customHeaderText={customHeaderText}
                  customFooterText={customFooterText}
                  onTemplateChange={setSelectedTemplate}
                  onHeaderTextChange={setCustomHeaderText}
                  onFooterTextChange={setCustomFooterText}
                  onResetText={handleResetText}
                />
              )}

              {activeTab === 'gif' && (
                <GifGenerator
                  selectedGifTransition={selectedGifTransition}
                  gifDelay={gifDelay}
                  isGeneratingGif={isGeneratingGif}
                  gifDataUrl={gifDataUrl}
                  onTransitionChange={setSelectedGifTransition}
                  onDelayChange={setGifDelay}
                  onGenerate={generateAnimatedGif}
                  onDownload={handleDownloadGif}
                />
              )}
            </div>
          </div>

          {/* Footer Info */}
          <p className="mt-3 text-[11px] text-muted-foreground text-center">
            {selectedTemplate !== 'none' && <span className="mr-1">🎨 {templateConfig.name}</span>}
            High-quality PNG • Print ready
          </p>
        </div>
      </motion.div>
    </div>
  );
};
