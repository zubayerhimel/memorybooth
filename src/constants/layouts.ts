import { LayoutList, Grid2X2, Film, Rows3 } from 'lucide-react';
import { createElement } from 'react';

export type LayoutType = 'vertical' | 'grid' | 'horizontal' | 'filmstrip';

export interface LayoutOption {
  id: LayoutType;
  name: string;
  icon: React.ReactNode;
  description: string;
}

export const LAYOUTS: LayoutOption[] = [
  { id: 'vertical', name: 'Classic Strip', icon: createElement(LayoutList, { className: 'w-5 h-5' }), description: 'Traditional photo booth style' },
  { id: 'grid', name: '2×2 Grid', icon: createElement(Grid2X2, { className: 'w-5 h-5' }), description: 'Square collage layout' },
  { id: 'horizontal', name: 'Horizontal', icon: createElement(Rows3, { className: 'w-5 h-5 rotate-90' }), description: 'Side by side strip' },
  { id: 'filmstrip', name: 'Film Strip', icon: createElement(Film, { className: 'w-5 h-5' }), description: 'Retro cinema style' },
];
