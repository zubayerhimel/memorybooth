import { useState } from 'react';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Photo, FilterType, FilterOption } from '@/types/photobooth';

interface FilterEditorProps {
  photos: Photo[];
  onComplete: (photos: Photo[]) => void;
  onBack: () => void;
}

const FILTERS: FilterOption[] = [
  { id: 'none', name: 'Original', className: '' },
  { id: 'bw', name: 'B&W', className: 'filter-bw' },
  { id: 'sepia', name: 'Sepia', className: 'filter-sepia' },
  { id: 'vintage', name: 'Vintage', className: 'filter-vintage' },
  { id: 'pop-art', name: 'Pop Art', className: 'filter-pop-art' },
  { id: 'cool', name: 'Cool', className: 'filter-cool' },
  { id: 'warm', name: 'Warm', className: 'filter-warm' },
];

export const FilterEditor = ({ photos, onComplete, onBack }: FilterEditorProps) => {
  const [editedPhotos, setEditedPhotos] = useState<Photo[]>(photos);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [applyToAll, setApplyToAll] = useState(false);

  const selectedPhoto = editedPhotos[selectedPhotoIndex];

  const handleFilterChange = (filter: FilterType) => {
    if (applyToAll) {
      setEditedPhotos((prev) =>
        prev.map((photo) => ({ ...photo, filter }))
      );
    } else {
      setEditedPhotos((prev) =>
        prev.map((photo, index) =>
          index === selectedPhotoIndex ? { ...photo, filter } : photo
        )
      );
    }
  };

  const getFilterClass = (filter: FilterType): string => {
    return FILTERS.find((f) => f.id === filter)?.className || '';
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <h2 className="font-display text-2xl font-bold text-foreground mb-1">
            Add Some Magic ✨
          </h2>
          <p className="text-muted-foreground">
            Choose filters for your photos
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Main photo preview */}
          <div className="flex-1 max-w-lg animate-fade-scale-in">
            <div className="photo-frame">
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={selectedPhoto.dataUrl}
                  alt="Selected photo"
                  className={`w-full aspect-[4/3] object-cover transition-all duration-300 ${getFilterClass(selectedPhoto.filter)}`}
                />
                
                {/* Photo navigation */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedPhotoIndex((prev) => Math.max(0, prev - 1))}
                    disabled={selectedPhotoIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <span className="bg-secondary/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    {selectedPhotoIndex + 1} / {editedPhotos.length}
                  </span>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedPhotoIndex((prev) => Math.min(editedPhotos.length - 1, prev + 1))}
                    disabled={selectedPhotoIndex === editedPhotos.length - 1}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Thumbnail selector */}
            <div className="flex justify-center gap-2 mt-4">
              {editedPhotos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className={`w-16 h-12 rounded-lg overflow-hidden transition-all duration-200 ${
                    index === selectedPhotoIndex
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo.dataUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-full h-full object-cover ${getFilterClass(photo.filter)}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Filters panel */}
          <div className="w-full lg:w-72 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h3 className="font-display font-semibold text-lg mb-4">Filters</h3>

              {/* Apply to all toggle */}
              <label className="flex items-center gap-3 mb-4 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    applyToAll
                      ? 'bg-primary border-primary'
                      : 'border-border group-hover:border-primary'
                  }`}
                >
                  {applyToAll && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
                <span className="text-sm font-medium">Apply to all photos</span>
              </label>

              {/* Filter options */}
              <div className="grid grid-cols-2 gap-2">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterChange(filter.id)}
                    className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
                      selectedPhoto.filter === filter.id
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-card'
                        : 'hover:opacity-90'
                    }`}
                  >
                    <img
                      src={selectedPhoto.dataUrl}
                      alt={filter.name}
                      className={`w-full aspect-square object-cover ${filter.className}`}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent py-2">
                      <span className="text-xs font-medium text-card">{filter.name}</span>
                    </div>
                    {selectedPhoto.filter === filter.id && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={onBack}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => onComplete(editedPhotos)}>
                Continue
              </Button>
            </div>
          </div>

          {/* Photo strip preview */}
          <div className="photo-strip w-32 hidden lg:block animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex flex-col gap-2">
              {editedPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="aspect-[4/3] rounded-lg overflow-hidden shadow-soft"
                >
                  <img
                    src={photo.dataUrl}
                    alt={`Photo ${index + 1}`}
                    className={`w-full h-full object-cover ${getFilterClass(photo.filter)}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs text-muted-foreground font-medium">Preview</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
