export type FrameStyle = 'classic' | 'polaroid' | 'rounded' | 'vintage' | 'birthday' | 'wedding';

export interface FrameOption {
  id: FrameStyle;
  name: string;
  emoji: string;
}

export interface FrameConfig {
  borderTop: number;
  borderSide: number;
  borderBottom: number;
  cornerRadius: number;
  bgColor: string;
  accentColor: string;
}

export const FRAMES: FrameOption[] = [
  { id: 'classic', name: 'Classic', emoji: '🖼️' },
  { id: 'polaroid', name: 'Polaroid', emoji: '📷' },
  { id: 'rounded', name: 'Rounded', emoji: '⭕' },
  { id: 'vintage', name: 'Vintage', emoji: '🎞️' },
  { id: 'birthday', name: 'Birthday', emoji: '🎂' },
  { id: 'wedding', name: 'Wedding', emoji: '💒' },
];

export const getFrameConfig = (
  selectedFrame: FrameStyle,
  baseBgColor?: string,
  baseAccentColor?: string
): FrameConfig => {
  switch (selectedFrame) {
    case 'polaroid':
      return { borderTop: 12, borderSide: 12, borderBottom: 45, cornerRadius: 0, bgColor: baseBgColor || '#FAFAFA', accentColor: baseAccentColor || '#333333' };
    case 'rounded':
      return { borderTop: 10, borderSide: 10, borderBottom: 10, cornerRadius: 20, bgColor: baseBgColor || '#FAF7F2', accentColor: baseAccentColor || '#E8837B' };
    case 'vintage':
      return { borderTop: 15, borderSide: 15, borderBottom: 15, cornerRadius: 0, bgColor: baseBgColor || '#F5E6D3', accentColor: baseAccentColor || '#8B4513' };
    case 'birthday':
      return { borderTop: 12, borderSide: 12, borderBottom: 12, cornerRadius: 8, bgColor: baseBgColor || '#FFF0F5', accentColor: baseAccentColor || '#FF69B4' };
    case 'wedding':
      return { borderTop: 14, borderSide: 14, borderBottom: 14, cornerRadius: 4, bgColor: baseBgColor || '#FFFAF0', accentColor: baseAccentColor || '#D4AF37' };
    default: // classic
      return { borderTop: 8, borderSide: 8, borderBottom: 8, cornerRadius: 0, bgColor: baseBgColor || '#FAF7F2', accentColor: baseAccentColor || '#E8837B' };
  }
};
