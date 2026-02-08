import { useState } from "react";
import { motion } from "motion/react";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Photo, FilterType, FilterOption } from "@/types/photobooth";

interface FilterEditorProps {
  photos: Photo[];
  onComplete: (photos: Photo[]) => void;
  onBack: () => void;
}

const FILTERS: FilterOption[] = [
  { id: "none", name: "Original", className: "" },
  { id: "bw", name: "B&W", className: "filter-bw" },
  { id: "sepia", name: "Sepia", className: "filter-sepia" },
  { id: "vintage", name: "Vintage", className: "filter-vintage" },
  { id: "pop-art", name: "Pop Art", className: "filter-pop-art" },
  { id: "cool", name: "Cool", className: "filter-cool" },
  { id: "warm", name: "Warm", className: "filter-warm" },
  { id: "cyberpunk", name: "Cyberpunk", className: "filter-cyberpunk" },
  { id: "neon", name: "Neon", className: "filter-neon" },
  { id: "vaporwave", name: "Vaporwave", className: "filter-vaporwave" },
  { id: "noir", name: "Noir", className: "filter-noir" },
  { id: "dreamy", name: "Dreamy", className: "filter-dreamy" },
  { id: "electric", name: "Electric", className: "filter-electric" },
  { id: "blur", name: "Blur", className: "filter-blur" },
  { id: "soft-blur", name: "Soft Focus", className: "filter-soft-blur" },
  { id: "tilt-shift", name: "Tilt Shift", className: "filter-tilt-shift" },
  { id: "haze", name: "Haze", className: "filter-haze" },
  { id: "dramatic", name: "Dramatic", className: "filter-dramatic" },
  { id: "sunset", name: "Sunset", className: "filter-sunset" },
  { id: "cinema", name: "Cinema", className: "filter-cinema" },
  { id: "retro", name: "Retro", className: "filter-retro" },
  { id: "fade", name: "Fade", className: "filter-fade" },
  { id: "vibrant", name: "Vibrant", className: "filter-vibrant" },
  { id: "muted", name: "Muted", className: "filter-muted" },
  { id: "x-ray", name: "X-Ray", className: "filter-x-ray" },
  { id: "thermal", name: "Thermal", className: "filter-thermal" },
  { id: "negative", name: "Negative", className: "filter-negative" },
  { id: "duotone", name: "Duotone", className: "filter-duotone" },
  { id: "lomo", name: "Lomo", className: "filter-lomo" },
  { id: "polaroid", name: "Polaroid", className: "filter-polaroid" },
];

export const FilterEditor = ({ photos, onComplete, onBack }: FilterEditorProps) => {
  const [editedPhotos, setEditedPhotos] = useState<Photo[]>(photos);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [applyToAll, setApplyToAll] = useState(false);

  const selectedPhoto = editedPhotos[selectedPhotoIndex];

  const handleFilterChange = (filter: FilterType) => {
    if (applyToAll) {
      setEditedPhotos((prev) => prev.map((photo) => ({ ...photo, filter })));
    } else {
      setEditedPhotos((prev) => prev.map((photo, index) => (index === selectedPhotoIndex ? { ...photo, filter } : photo)));
    }
  };

  const getFilterClass = (filter: FilterType): string => {
    return FILTERS.find((f) => f.id === filter)?.className || "";
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 pt-4 sm:pt-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="text-center mb-4 sm:mb-8">
          <h2 className="font-display text-lg sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">Add Some Magic ✨</h2>
          <p className="text-muted-foreground text-xs sm:text-base">Choose filters for your photos</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 items-start justify-center">
          {/* Main photo preview */}
          <div className="flex-1 w-full max-w-lg mx-auto animate-fade-scale-in">
            <div className="photo-frame">
              <div className="relative rounded-lg overflow-hidden">
                <img src={selectedPhoto.dataUrl} alt="Selected photo" className={`w-full aspect-[4/3] object-cover transition-all duration-300 ${getFilterClass(selectedPhoto.filter)}`} />

                {/* Photo navigation */}
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2">
                  <Button variant="secondary" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => setSelectedPhotoIndex((prev) => Math.max(0, prev - 1))} disabled={selectedPhotoIndex === 0}>
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <span className="bg-secondary/90 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                    {selectedPhotoIndex + 1} / {editedPhotos.length}
                  </span>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    onClick={() => setSelectedPhotoIndex((prev) => Math.min(editedPhotos.length - 1, prev + 1))}
                    disabled={selectedPhotoIndex === editedPhotos.length - 1}>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Thumbnail selector */}
            <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
              {editedPhotos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className={`w-12 h-9 sm:w-16 sm:h-12 rounded-lg overflow-hidden transition-all duration-200 ${
                    index === selectedPhotoIndex ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-70 hover:opacity-100"
                  }`}>
                  <img src={photo.dataUrl} alt={`Thumbnail ${index + 1}`} className={`w-full h-full object-cover ${getFilterClass(photo.filter)}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Filters panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }} className="w-full lg:w-72">
            <div className="bg-card rounded-xl sm:rounded-2xl p-4 shadow-card">
              <h3 className="font-display font-semibold text-base sm:text-lg mb-3 sm:mb-4">Filters</h3>

              {/* Apply to all toggle */}
              <button type="button" onClick={() => setApplyToAll(!applyToAll)} className="flex items-center gap-3 mb-4 cursor-pointer group w-full text-left">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${applyToAll ? "bg-primary border-primary" : "border-border group-hover:border-primary"}`}>
                  {applyToAll && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
                <span className="text-sm font-medium">Apply to all photos</span>
              </button>

              {/* Filter options */}
              <div className="grid grid-cols-3 sm:grid-cols-2 gap-1.5 sm:gap-2 max-h-[35vh] sm:max-h-[50vh] overflow-y-auto pl-1 pr-1.5 py-1 custom-scrollbar">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterChange(filter.id)}
                    className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
                      selectedPhoto.filter === filter.id ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : "hover:opacity-90"
                    }`}>
                    <img src={selectedPhoto.dataUrl} alt={filter.name} className={`w-full aspect-square object-cover ${filter.className}`} />
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
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <Button variant="secondary" className="flex-1 text-sm sm:text-base" onClick={onBack}>
                Back
              </Button>
              <Button className="flex-1 text-sm sm:text-base" onClick={() => onComplete(editedPhotos)}>
                Continue
              </Button>
            </div>
          </motion.div>

          {/* Photo strip preview - hide on mobile */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }} className="photo-strip w-32 hidden lg:block">
            <div className="flex flex-col gap-2">
              {editedPhotos.map((photo, index) => (
                <div key={photo.id} className="aspect-[4/3] rounded-lg overflow-hidden shadow-soft">
                  <img src={photo.dataUrl} alt={`Photo ${index + 1}`} className={`w-full h-full object-cover ${getFilterClass(photo.filter)}`} />
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs text-muted-foreground font-medium">Preview</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
