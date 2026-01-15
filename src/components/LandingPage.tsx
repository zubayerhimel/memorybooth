import { useState } from 'react';
import { motion } from 'motion/react';
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
      >
        <Button
          onClick={onStart}
          size="xl"
          className="font-display"
        >
          <Camera className="size-8" />
          Start Photo Booth
        </Button>
      </motion.div>

      {/* Gallery History Button */}
      {hasHistory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7, ease: 'easeOut' }}
        >
          <Button
            onClick={() => setShowGallery(true)}
            variant="ghost"
            className="mt-4 text-muted-foreground hover:text-foreground"
          >
            <History className="w-4 h-4" />
            View Gallery ({sessions.length})
          </Button>
        </motion.div>
      )}

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8, ease: 'easeOut' }}
        className="mt-6 sm:mt-8 text-xs text-muted-foreground text-center"
      >
        Works on all devices • Camera access required
      </motion.p>

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
