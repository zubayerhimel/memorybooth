import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Trash2, RotateCw, Plus, Minus, Type, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Photo, Sticker, StickerOption, FilterType, TextOverlay } from '@/types/photobooth';

interface StickerEditorProps {
  photos: Photo[];
  onComplete: (photos: Photo[]) => void;
  onBack: () => void;
}

const STICKER_OPTIONS: StickerOption[] = [
  // Hearts
  { emoji: '❤️', name: 'Red Heart' },
  { emoji: '💕', name: 'Two Hearts' },
  { emoji: '💖', name: 'Sparkling Heart' },
  { emoji: '💗', name: 'Growing Heart' },
  { emoji: '🩷', name: 'Pink Heart' },
  // Stars
  { emoji: '⭐', name: 'Star' },
  { emoji: '🌟', name: 'Glowing Star' },
  { emoji: '✨', name: 'Sparkles' },
  { emoji: '💫', name: 'Dizzy Star' },
  { emoji: '🌠', name: 'Shooting Star' },
  // Fun emojis
  { emoji: '😍', name: 'Heart Eyes' },
  { emoji: '🥰', name: 'Smiling Hearts' },
  { emoji: '😎', name: 'Cool' },
  { emoji: '🤩', name: 'Star Struck' },
  { emoji: '🥳', name: 'Party' },
  // Decorations
  { emoji: '🎀', name: 'Ribbon' },
  { emoji: '🦋', name: 'Butterfly' },
  { emoji: '🌸', name: 'Cherry Blossom' },
  { emoji: '🌈', name: 'Rainbow' },
  { emoji: '🔥', name: 'Fire' },
  // Food & Fun
  { emoji: '🍭', name: 'Lollipop' },
  { emoji: '🎈', name: 'Balloon' },
  { emoji: '🎉', name: 'Party Popper' },
  { emoji: '👑', name: 'Crown' },
  { emoji: '💎', name: 'Gem' },
];

const FILTER_CLASSES: Record<FilterType, string> = {
  none: '',
  bw: 'filter-bw',
  sepia: 'filter-sepia',
  vintage: 'filter-vintage',
  'pop-art': 'filter-pop-art',
  cool: 'filter-cool',
  warm: 'filter-warm',
  cyberpunk: 'filter-cyberpunk',
  neon: 'filter-neon',
  vaporwave: 'filter-vaporwave',
  noir: 'filter-noir',
  dreamy: 'filter-dreamy',
  electric: 'filter-electric',
  blur: 'filter-blur',
};

const TEXT_COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
  { name: 'Pink', value: '#E8837B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Yellow', value: '#FACC15' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#A855F7' },
];

const FONT_OPTIONS = [
  { name: 'Sans', value: 'sans-serif' },
  { name: 'Serif', value: 'serif' },
  { name: 'Cursive', value: 'cursive' },
  { name: 'Mono', value: 'monospace' },
];

type ActiveTab = 'stickers' | 'text';

export const StickerEditor = ({ photos, onComplete, onBack }: StickerEditorProps) => {
  const [editedPhotos, setEditedPhotos] = useState<Photo[]>(photos);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('stickers');
  const [newTextInput, setNewTextInput] = useState('');
  const photoContainerRef = useRef<HTMLDivElement>(null);

  const selectedPhoto = editedPhotos[selectedPhotoIndex];

  const generateStickerId = () => `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const generateTextId = () => `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addSticker = useCallback((emoji: string) => {
    const newSticker: Sticker = {
      id: generateStickerId(),
      emoji,
      x: 50, // center
      y: 50, // center
      size: 48,
      rotation: 0,
    };

    setEditedPhotos((prev) =>
      prev.map((photo, index) =>
        index === selectedPhotoIndex
          ? { ...photo, stickers: [...photo.stickers, newSticker] }
          : photo
      )
    );
    setSelectedStickerId(newSticker.id);
  }, [selectedPhotoIndex]);

  const updateSticker = useCallback((stickerId: string, updates: Partial<Sticker>) => {
    setEditedPhotos((prev) =>
      prev.map((photo, index) =>
        index === selectedPhotoIndex
          ? {
              ...photo,
              stickers: photo.stickers.map((s) =>
                s.id === stickerId ? { ...s, ...updates } : s
              ),
            }
          : photo
      )
    );
  }, [selectedPhotoIndex]);

  const deleteSticker = useCallback((stickerId: string) => {
    setEditedPhotos((prev) =>
      prev.map((photo, index) =>
        index === selectedPhotoIndex
          ? { ...photo, stickers: photo.stickers.filter((s) => s.id !== stickerId) }
          : photo
      )
    );
    setSelectedStickerId(null);
  }, [selectedPhotoIndex]);

  // Text overlay functions
  const addTextOverlay = useCallback((text: string) => {
    if (!text.trim()) return;
    
    const newText: TextOverlay = {
      id: generateTextId(),
      text: text.trim(),
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#FFFFFF',
      fontFamily: 'sans-serif',
      rotation: 0,
    };

    setEditedPhotos((prev) =>
      prev.map((photo, index) =>
        index === selectedPhotoIndex
          ? { ...photo, textOverlays: [...photo.textOverlays, newText] }
          : photo
      )
    );
    setSelectedTextId(newText.id);
    setSelectedStickerId(null);
    setNewTextInput('');
  }, [selectedPhotoIndex]);

  const updateTextOverlay = useCallback((textId: string, updates: Partial<TextOverlay>) => {
    setEditedPhotos((prev) =>
      prev.map((photo, index) =>
        index === selectedPhotoIndex
          ? {
              ...photo,
              textOverlays: photo.textOverlays.map((t) =>
                t.id === textId ? { ...t, ...updates } : t
              ),
            }
          : photo
      )
    );
  }, [selectedPhotoIndex]);

  const deleteTextOverlay = useCallback((textId: string) => {
    setEditedPhotos((prev) =>
      prev.map((photo, index) =>
        index === selectedPhotoIndex
          ? { ...photo, textOverlays: photo.textOverlays.filter((t) => t.id !== textId) }
          : photo
      )
    );
    setSelectedTextId(null);
  }, [selectedPhotoIndex]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !photoContainerRef.current) return;

    const rect = photoContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (selectedStickerId) {
      updateSticker(selectedStickerId, {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    } else if (selectedTextId) {
      updateTextOverlay(selectedTextId, {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    }
  }, [isDragging, selectedStickerId, selectedTextId, updateSticker, updateTextOverlay]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent, stickerId: string) => {
    e.preventDefault();
    setSelectedStickerId(stickerId);
    setIsDragging(true);
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !photoContainerRef.current) return;

    const touch = e.touches[0];
    const rect = photoContainerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    if (selectedStickerId) {
      updateSticker(selectedStickerId, {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    } else if (selectedTextId) {
      updateTextOverlay(selectedTextId, {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    }
  }, [isDragging, selectedStickerId, selectedTextId, updateSticker, updateTextOverlay]);

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTextTouchStart = (e: React.TouchEvent, textId: string) => {
    e.preventDefault();
    setSelectedTextId(textId);
    setSelectedStickerId(null);
    setIsDragging(true);
  };

  const clearSelection = () => {
    setSelectedStickerId(null);
    setSelectedTextId(null);
  };

  const copyDecorationsToAll = useCallback(() => {
    const currentStickers = selectedPhoto.stickers;
    const currentTextOverlays = selectedPhoto.textOverlays;
    
    if (currentStickers.length === 0 && currentTextOverlays.length === 0) return;

    setEditedPhotos((prev) =>
      prev.map((photo, index) => {
        if (index === selectedPhotoIndex) return photo;
        
        // Create new stickers with unique IDs
        const newStickers = currentStickers.map((sticker) => ({
          ...sticker,
          id: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }));
        
        // Create new text overlays with unique IDs
        const newTextOverlays = currentTextOverlays.map((text) => ({
          ...text,
          id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }));

        return {
          ...photo,
          stickers: [...photo.stickers, ...newStickers],
          textOverlays: [...photo.textOverlays, ...newTextOverlays],
        };
      })
    );
  }, [selectedPhoto, selectedPhotoIndex]);

  const hasDecorations = selectedPhoto.stickers.length > 0 || selectedPhoto.textOverlays.length > 0;
  const selectedStickerData = selectedPhoto.stickers.find((s) => s.id === selectedStickerId);
  const selectedTextData = selectedPhoto.textOverlays.find((t) => t.id === selectedTextId);

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-6 animate-slide-up">
          <h2 className="font-display text-2xl font-bold text-foreground mb-1">
            Decorate Your Photos! 🎨
          </h2>
          <p className="text-muted-foreground">
            Add stickers and text, then drag to position
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* Main photo with stickers */}
          <div className="flex-1 max-w-lg animate-fade-scale-in">
            <div className="photo-frame">
              <div
                ref={photoContainerRef}
                className="relative rounded-lg overflow-hidden cursor-crosshair select-none"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={(e) => {
                  // Only deselect if clicking directly on the container/image
                  if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'IMG') {
                    clearSelection();
                  }
                }}
              >
                <img
                  src={selectedPhoto.dataUrl}
                  alt="Selected photo"
                  className={`w-full aspect-[4/3] object-cover ${FILTER_CLASSES[selectedPhoto.filter]}`}
                  draggable={false}
                />
                
                {/* Stickers layer */}
                {selectedPhoto.stickers.map((sticker) => (
                  <div
                    key={sticker.id}
                    className={`absolute cursor-move select-none transition-shadow ${
                      selectedStickerId === sticker.id
                        ? 'ring-2 ring-primary ring-offset-2 rounded-lg z-10'
                        : 'hover:scale-110'
                    }`}
                    style={{
                      left: `${sticker.x}%`,
                      top: `${sticker.y}%`,
                      transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
                      fontSize: `${sticker.size}px`,
                      lineHeight: 1,
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setSelectedStickerId(sticker.id);
                      setSelectedTextId(null);
                      setIsDragging(true);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      handleTouchStart(e, sticker.id);
                    }}
                  >
                    {sticker.emoji}
                  </div>
                ))}

                {/* Text overlays layer */}
                {selectedPhoto.textOverlays.map((textOverlay) => (
                  <div
                    key={textOverlay.id}
                    className={`absolute cursor-move select-none transition-shadow whitespace-nowrap ${
                      selectedTextId === textOverlay.id
                        ? 'ring-2 ring-primary ring-offset-2 rounded z-10'
                        : 'hover:scale-105'
                    }`}
                    style={{
                      left: `${textOverlay.x}%`,
                      top: `${textOverlay.y}%`,
                      transform: `translate(-50%, -50%) rotate(${textOverlay.rotation}deg)`,
                      fontSize: `${textOverlay.fontSize}px`,
                      fontFamily: textOverlay.fontFamily,
                      color: textOverlay.color,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5), -1px -1px 2px rgba(0,0,0,0.3)',
                      fontWeight: 'bold',
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setSelectedTextId(textOverlay.id);
                      setSelectedStickerId(null);
                      setIsDragging(true);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      handleTextTouchStart(e, textOverlay.id);
                    }}
                  >
                    {textOverlay.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Photo navigation */}
            <div className="flex justify-center items-center gap-2 mt-4">
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

            {/* Thumbnail selector */}
            <div className="flex justify-center gap-2 mt-3">
              {editedPhotos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => {
                    setSelectedPhotoIndex(index);
                    clearSelection();
                  }}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden transition-all duration-200 ${
                    index === selectedPhotoIndex
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo.dataUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-full h-full object-cover ${FILTER_CLASSES[photo.filter]}`}
                  />
                  {(photo.stickers.length > 0 || photo.textOverlays.length > 0) && (
                    <span className="absolute bottom-0 right-0 bg-primary text-primary-foreground text-xs px-1 rounded-tl">
                      {photo.stickers.length + photo.textOverlays.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Decoration action buttons */}
            {hasDecorations && (
              <div className="flex justify-center gap-2 mt-3 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditedPhotos((prev) =>
                      prev.map((photo, index) =>
                        index === selectedPhotoIndex
                          ? { ...photo, stickers: [], textOverlays: [] }
                          : photo
                      )
                    );
                    setSelectedStickerId(null);
                    setSelectedTextId(null);
                  }}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear all
                </Button>
                {editedPhotos.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyDecorationsToAll}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy to all
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Stickers & Text panel */}
          <div className="w-full lg:w-80 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-card rounded-2xl p-5 shadow-card">
              {/* Tab switcher */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('stickers')}
                  className={`flex-1 py-2 px-3 rounded-xl font-medium text-sm transition-all ${
                    activeTab === 'stickers'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  ✨ Stickers
                </button>
                <button
                  onClick={() => setActiveTab('text')}
                  className={`flex-1 py-2 px-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-1 ${
                    activeTab === 'text'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Type className="w-4 h-4" /> Text
                </button>
              </div>

              {/* Stickers Tab Content */}
              {activeTab === 'stickers' && (
                <>
                  {selectedStickerData && (
                    <div className="mb-4 p-3 bg-secondary/50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Selected: {selectedStickerData.emoji}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteSticker(selectedStickerData.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                      
                      {/* Size control */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground w-12">Size:</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateSticker(selectedStickerData.id, { 
                            size: Math.max(24, selectedStickerData.size - 8) 
                          })}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-mono w-10 text-center">{selectedStickerData.size}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateSticker(selectedStickerData.id, { 
                            size: Math.min(120, selectedStickerData.size + 8) 
                          })}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Rotation control */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-12">Rotate:</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateSticker(selectedStickerData.id, { 
                            rotation: selectedStickerData.rotation - 15 
                          })}
                        >
                          <RotateCw className="w-3 h-3 transform -scale-x-100" />
                        </Button>
                        <span className="text-sm font-mono w-10 text-center">{selectedStickerData.rotation}°</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateSticker(selectedStickerData.id, { 
                            rotation: selectedStickerData.rotation + 15 
                          })}
                        >
                          <RotateCw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Sticker grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {STICKER_OPTIONS.map((sticker) => (
                      <button
                        key={sticker.emoji}
                        onClick={() => addSticker(sticker.emoji)}
                        className="aspect-square rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95"
                        title={sticker.name}
                      >
                        {sticker.emoji}
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Tap to add • Drag to move • Select to resize/rotate
                  </p>
                </>
              )}

              {/* Text Tab Content */}
              {activeTab === 'text' && (
                <>
                  {/* Add new text */}
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your text..."
                        value={newTextInput}
                        onChange={(e) => setNewTextInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addTextOverlay(newTextInput);
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => addTextOverlay(newTextInput)}
                        disabled={!newTextInput.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Text controls (when text is selected) */}
                  {selectedTextData && (
                    <div className="mb-4 p-3 bg-secondary/50 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate max-w-[150px]">"{selectedTextData.text}"</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteTextOverlay(selectedTextData.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>

                      {/* Edit text */}
                      <div>
                        <Input
                          value={selectedTextData.text}
                          onChange={(e) => updateTextOverlay(selectedTextData.id, { text: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                      
                      {/* Font size control */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-12">Size:</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateTextOverlay(selectedTextData.id, { 
                            fontSize: Math.max(12, selectedTextData.fontSize - 4) 
                          })}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-mono w-10 text-center">{selectedTextData.fontSize}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateTextOverlay(selectedTextData.id, { 
                            fontSize: Math.min(72, selectedTextData.fontSize + 4) 
                          })}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Rotation control */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-12">Rotate:</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateTextOverlay(selectedTextData.id, { 
                            rotation: selectedTextData.rotation - 15 
                          })}
                        >
                          <RotateCw className="w-3 h-3 transform -scale-x-100" />
                        </Button>
                        <span className="text-sm font-mono w-10 text-center">{selectedTextData.rotation}°</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateTextOverlay(selectedTextData.id, { 
                            rotation: selectedTextData.rotation + 15 
                          })}
                        >
                          <RotateCw className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Color picker */}
                      <div>
                        <span className="text-xs text-muted-foreground block mb-2">Color:</span>
                        <div className="flex gap-2 flex-wrap">
                          {TEXT_COLORS.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => updateTextOverlay(selectedTextData.id, { color: color.value })}
                              className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                                selectedTextData.color === color.value
                                  ? 'border-primary scale-110'
                                  : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Font picker */}
                      <div>
                        <span className="text-xs text-muted-foreground block mb-2">Font:</span>
                        <div className="flex gap-2 flex-wrap">
                          {FONT_OPTIONS.map((font) => (
                            <button
                              key={font.value}
                              onClick={() => updateTextOverlay(selectedTextData.id, { fontFamily: font.value })}
                              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                                selectedTextData.fontFamily === font.value
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary hover:bg-secondary/80'
                              }`}
                              style={{ fontFamily: font.value }}
                            >
                              {font.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground text-center">
                    Add captions, dates, or messages • Drag to position
                  </p>
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-5">
              <Button variant="secondary" className="flex-1" onClick={onBack}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => onComplete(editedPhotos)}>
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
