export type FilterType = 'none' | 'bw' | 'sepia' | 'vintage' | 'pop-art' | 'cool' | 'warm';

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
