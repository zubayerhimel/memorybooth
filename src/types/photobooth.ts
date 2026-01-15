export type FilterType = 'none' | 'bw' | 'sepia' | 'vintage' | 'pop-art' | 'cool' | 'warm' | 'cyberpunk' | 'neon' | 'vaporwave' | 'noir' | 'dreamy' | 'electric' | 'blur' | 'soft-blur' | 'tilt-shift' | 'haze' | 'dramatic' | 'sunset' | 'cinema' | 'retro' | 'fade' | 'vibrant' | 'muted' | 'x-ray' | 'thermal' | 'negative' | 'duotone' | 'lomo' | 'polaroid';

export interface Sticker {
  id: string;
  emoji: string;
  x: number; // percentage position (0-100)
  y: number; // percentage position (0-100)
  size: number; // size in pixels
  rotation: number; // rotation in degrees
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number; // percentage position (0-100)
  y: number; // percentage position (0-100)
  fontSize: number; // font size in pixels
  color: string; // hex color
  fontFamily: string;
  rotation: number; // rotation in degrees
}

export interface Photo {
  id: string;
  dataUrl: string;
  filter: FilterType;
  timestamp: number;
  stickers: Sticker[];
  textOverlays: TextOverlay[];
}

export interface FilterOption {
  id: FilterType;
  name: string;
  className: string;
}

export interface StickerOption {
  emoji: string;
  name: string;
}

export type AppStep = 'landing' | 'camera' | 'filters' | 'stickers' | 'download';

// Collage Template Types
export type TemplateTheme = 'none' | 'birthday' | 'wedding' | 'graduation' | 'christmas' | 'halloween' | 'valentines' | 'newyear';

export interface TemplateConfig {
  id: TemplateTheme;
  name: string;
  emoji: string;
  bgColor: string;
  accentColor: string;
  secondaryColor: string;
  headerText: string;
  footerText: string;
  decorations: TemplateDecoration[];
  borderStyle: 'solid' | 'dashed' | 'double' | 'none';
  font: string;
}

export interface TemplateDecoration {
  emoji: string;
  positions: { x: number; y: number; size: number; rotation?: number }[];
}

// GIF Export Types
export type GifTransition = 'none' | 'fade' | 'slide' | 'zoom' | 'bounce';

export interface GifExportOptions {
  delay: number; // delay between frames in ms
  transition: GifTransition;
  loop: boolean;
  quality: number; // 1-20, lower is better quality
}

// Gallery History Types
export interface GallerySession {
  id: string;
  timestamp: number;
  thumbnailUrl: string; // The collage/strip image
  gifUrl?: string; // Optional GIF version
  layout: string;
  template: string;
  photoCount: number;
}
