import { useState } from 'react';
import { Camera, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGalleryHistory } from '@/hooks/useGalleryHistory';
import { GallerySession } from '@/types/photobooth';
import {
  CameraIllustration,
  DecorativeBackground,
  FeatureBadges,
  GalleryModal,
  HeroText,
  ImagePreviewModal,
} from './landing';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage = ({ onStart }: LandingPageProps) => {
  const [showGallery, setShowGallery] = useState(false);
  const [selectedSession, setSelectedSession] = useState<GallerySession | null>(null);
  
  const { sessions, hasHistory, removeSession, clearAll } = useGalleryHistory();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadFromGallery = (session: GallerySession) => {
    const link = document.createElement('a');
    const timestamp = new Date(session.timestamp).toISOString().slice(0, 19).replace(/[:-]/g, '');
    link.download = `photo-booth-${session.layout}-${timestamp}.png`;
    link.href = session.thumbnailUrl;
    link.click();
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      <DecorativeBackground />

      <CameraIllustration />

      <HeroText />

      <FeatureBadges />

      {/* CTA Button */}
      <Button
        onClick={onStart}
        size="xl"
        className="animate-slide-up font-display"
        style={{ animationDelay: '0.6s' }}
      >
        <Camera className="size-8" />
        Start Photo Booth
      </Button>

      {/* Gallery History Button */}
      {hasHistory && (
        <Button
          onClick={() => setShowGallery(true)}
          variant="ghost"
          className="mt-4 animate-slide-up text-muted-foreground hover:text-foreground"
          style={{ animationDelay: '0.7s' }}
        >
          <History className="w-4 h-4" />
          View Gallery ({sessions.length})
        </Button>
      )}

      {/* Footer note */}
      <p className="mt-6 sm:mt-8 text-xs text-muted-foreground animate-slide-up text-center" style={{ animationDelay: '0.8s' }}>
        Works on all devices • Camera access required
      </p>

      {/* Gallery Modal */}
      {showGallery && (
        <GalleryModal
          sessions={sessions}
          onClose={() => setShowGallery(false)}
          onClearAll={clearAll}
          onRemoveSession={removeSession}
          onDownloadSession={handleDownloadFromGallery}
          onSelectSession={setSelectedSession}
          formatDate={formatDate}
        />
      )}

      {/* Image Preview Modal */}
      {selectedSession && (
        <ImagePreviewModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onDownload={handleDownloadFromGallery}
          onRemove={removeSession}
        />
      )}
    </div>
  );
};
