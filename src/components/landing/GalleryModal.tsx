import { History, X, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GallerySession } from '@/types/photobooth';

interface GalleryModalProps {
  sessions: GallerySession[];
  onClose: () => void;
  onClearAll: () => void;
  onRemoveSession: (id: string) => void;
  onDownloadSession: (session: GallerySession) => void;
  onSelectSession: (session: GallerySession) => void;
  formatDate: (timestamp: number) => string;
}

export const GalleryModal = ({
  sessions,
  onClose,
  onClearAll,
  onRemoveSession,
  onDownloadSession,
  onSelectSession,
  formatDate,
}: GalleryModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-card rounded-xl sm:rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <History className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <h3 className="font-display font-bold text-base sm:text-lg truncate">Gallery</h3>
            <span className="text-[10px] sm:text-xs text-muted-foreground bg-secondary px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
              {sessions.length}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {sessions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Clear all gallery history?')) {
                    onClearAll();
                  }
                }}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2 sm:px-3"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear All</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 sm:w-9 sm:h-9"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(90vh-60px)] sm:max-h-[calc(85vh-80px)]">
          {sessions.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <History className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm sm:text-base">No photo sessions yet</p>
              <p className="text-xs sm:text-sm">Your photos will appear here after you download them</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="group relative bg-secondary rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => onSelectSession(session)}
                >
                  <div className="aspect-[3/4] relative">
                    <img
                      src={session.thumbnailUrl}
                      alt={`Session from ${formatDate(session.timestamp)}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay - always visible on mobile, hover on desktop */}
                    <div className="absolute inset-0 bg-black/0 sm:group-hover:bg-black/30 transition-colors flex items-end sm:items-center justify-center p-1.5 sm:p-0">
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="w-7 h-7 sm:w-8 sm:h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownloadSession(session);
                          }}
                        >
                          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveSession(session.id);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-1.5 sm:p-2 text-[10px] sm:text-xs">
                    <p className="font-medium truncate capitalize">{session.layout}</p>
                    <p className="text-muted-foreground truncate">{formatDate(session.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
