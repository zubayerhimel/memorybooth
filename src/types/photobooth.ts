export type FilterType = 'none' | 'bw' | 'sepia' | 'vintage' | 'pop-art' | 'cool' | 'warm';

export interface Photo {
  id: string;
  dataUrl: string;
  filter: FilterType;
  timestamp: number;
}

export interface FilterOption {
  id: FilterType;
  name: string;
  className: string;
}

export type AppStep = 'landing' | 'camera' | 'filters' | 'download';
