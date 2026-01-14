import { GifTransition } from '@/types/photobooth';

export interface GifOption {
  id: GifTransition;
  name: string;
  description: string;
}

export const GIF_TRANSITIONS: GifOption[] = [
  { id: 'none', name: 'Simple', description: 'No transition' },
  { id: 'fade', name: 'Fade', description: 'Smooth fade' },
  { id: 'slide', name: 'Slide', description: 'Slide effect' },
  { id: 'zoom', name: 'Zoom', description: 'Zoom in/out' },
  { id: 'bounce', name: 'Bounce', description: 'Bouncy effect' },
];

export const DEFAULT_GIF_DELAY = 800;
export const MIN_GIF_DELAY = 300;
export const MAX_GIF_DELAY = 2000;
export const GIF_DELAY_STEP = 100;
