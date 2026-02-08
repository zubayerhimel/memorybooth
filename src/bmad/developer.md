# Developer Guide & Documentation

## Getting Started

### Prerequisites
- **Node.js** 18+ and npm/pnpm
- **Git** for version control
- **Modern browser** with camera access
- **Code editor** (VS Code recommended)

### Local Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd snap-style-booth

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

### Environment Setup
- **HTTPS Required**: Camera access needs secure context
- **Camera Permissions**: Allow camera access when prompted
- **Localhost**: Development works on localhost due to secure context

## Project Structure

```
src/
├── components/
│   ├── camera/          # Camera capture functionality
│   │   ├── CameraView.tsx
│   │   ├── VideoPreview.tsx
│   │   ├── CameraControls.tsx
│   │   └── ...
│   ├── download/        # Export and download features
│   ├── landing/         # Landing page components
│   └── ui/              # shadcn/ui base components
├── hooks/               # Custom React hooks
├── pages/               # Route components
├── types/               # TypeScript definitions
├── bmad/               # Business documentation
└── lib/                # Utility functions
```

## Development Workflow

### Branch Strategy
- **main**: Production-ready code
- **develop**: Integration branch
- **feature/***: Feature-specific branches
- **hotfix/***: Critical bug fixes

### Commit Convention
```bash
# Feature additions
git commit -m "feat: add video recording functionality"

# Bug fixes
git commit -m "fix: resolve camera permission handling"

# Documentation
git commit -m "docs: update API documentation"

# Refactoring
git commit -m "refactor: optimize filter performance"
```

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured rules for code quality
- **Prettier**: Consistent code formatting
- **Conventions**: React functional components with hooks

## Core Architecture

### State Management
The application uses a centralized state pattern in `src/pages/Index.tsx`:

```typescript
// Core state structure
const [currentStep, setCurrentStep] = useState<AppStep>("landing");
const [photos, setPhotos] = useState<Photo[]>([]);
const [video, setVideo] = useState<VideoRecording | null>(null);

// State flow: parent → children via props
// Communication: children → parent via callbacks
```

### Component Patterns

#### 1. Presentational Components
```typescript
// Simple props-driven components
interface FilterButtonProps {
  filter: FilterType;
  isSelected: boolean;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ filter, isSelected, onClick }) => {
  return (
    <button 
      className={isSelected ? 'selected' : ''}
      onClick={onClick}
    >
      {filter}
    </button>
  );
};
```

#### 2. Container Components
```typescript
// Components that manage state and logic
const CameraView: React.FC<CameraViewProps> = ({ onPhotosComplete, onVideoComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Logic and state management
  const handleCapture = useCallback(() => {
    // Capture logic
  }, [stream]);
  
  return (
    <div>
      <VideoPreview stream={stream} />
      <CameraControls onCapture={handleCapture} />
    </div>
  );
};
```

### Custom Hooks

#### Camera Hook Pattern
```typescript
// src/hooks/useCamera.ts
export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startCamera = useCallback(async (constraints?: MediaStreamConstraints) => {
    setIsLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints || { video: true, audio: false }
      );
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Camera access failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return { stream, error, isLoading, startCamera, stopCamera };
};
```

## Key Implementation Details

### Camera System

#### Video Preview Implementation
```typescript
// src/components/camera/VideoPreview.tsx
const VideoPreview: React.FC<VideoPreviewProps> = ({ stream, filter }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`video-preview ${getFilterClass(filter)}`}
      />
    </div>
  );
};
```

#### Photo Capture Implementation
```typescript
const capturePhoto = useCallback((videoElement: HTMLVideoElement): Photo => {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(videoElement, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    return {
      id: generateId(),
      dataUrl,
      filter: currentFilter,
      timestamp: Date.now(),
      stickers: [],
      textOverlays: []
    };
  }
  
  throw new Error('Failed to capture photo');
}, [currentFilter]);
```

### Filter System

#### CSS Filter Classes
```css
/* src/App.css or filter-specific CSS */
.filter-bw { filter: grayscale(100%); }
.filter-sepia { filter: sepia(100%); }
.filter-vintage { filter: sepia(50%) contrast(1.2) brightness(0.9); }
.filter-cyberpunk { filter: hue-rotate(270deg) saturate(1.5) contrast(1.2); }
```

#### Canvas Filter Implementation
```typescript
const applyAdvancedFilter = useCallback((
  imageData: ImageData, 
  filterType: FilterType
): ImageData => {
  const data = imageData.data;
  
  switch (filterType) {
    case 'x-ray':
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const inverted = 255 - avg;
        data[i] = inverted;     // R
        data[i + 1] = inverted; // G
        data[i + 2] = inverted; // B
      }
      break;
    
    case 'thermal':
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness < 128) {
          data[i] = 0;     // R
          data[i + 1] = 0; // G
          data[i + 2] = brightness * 2; // B
        } else {
          data[i] = 255;   // R
          data[i + 1] = (brightness - 128) * 2; // G
          data[i + 2] = 0; // B
        }
      }
      break;
  }
  
  return imageData;
}, []);
```

### Export System

#### Image Composition
```typescript
const composePhotoStrip = useCallback(async (
  photos: Photo[], 
  layout: LayoutType,
  template: TemplateConfig
): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Canvas context not available');
  
  // Set canvas size based on layout
  canvas.width = layout.width;
  canvas.height = layout.height;
  
  // Apply template background
  ctx.fillStyle = template.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw photos
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const position = layout.positions[i];
    const img = await loadImage(photo.dataUrl);
    
    ctx.drawImage(img, position.x, position.y, position.width, position.height);
  }
  
  // Apply filters and overlays
  photos.forEach(photo => {
    if (photo.stickers.length > 0) {
      drawStickers(ctx, photo.stickers);
    }
    if (photo.textOverlays.length > 0) {
      drawTextOverlays(ctx, photo.textOverlays);
    }
  });
  
  return canvas.toDataURL('image/png', 0.9);
}, []);
```

#### GIF Generation
```typescript
const generateGif = useCallback(async (
  photos: Photo[],
  options: GifExportOptions
): Promise<Blob> => {
  const frames: ImageData[] = [];
  
  // Prepare each frame
  for (const photo of photos) {
    const frameData = await prepareFrame(photo, options);
    frames.push(frameData);
  }
  
  // Create GIF using gif.js
  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers: 2,
      quality: options.quality,
      width: 640,
      height: 480
    });
    
    frames.forEach((frame, index) => {
      gif.addFrame(frame, { delay: options.delay });
    });
    
    gif.on('finished', (blob: Blob) => {
      resolve(blob);
    });
    
    gif.on('error', (error: Error) => {
      reject(error);
    });
    
    gif.render();
  });
}, []);
```

## Testing Strategy

### Unit Testing
```typescript
// src/__tests__/useCamera.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCamera } from '../hooks/useCamera';

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }]
    })
  }
});

test('should start camera successfully', async () => {
  const { result } = renderHook(() => useCamera());
  
  await act(async () => {
    await result.current.startCamera();
  });
  
  expect(result.current.stream).toBeDefined();
  expect(result.current.error).toBeNull();
  expect(result.current.isLoading).toBe(false);
});
```

### Integration Testing
```typescript
// src/__tests__/CameraView.integration.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CameraView } from '../components/CameraView';

// Mock camera stream
const mockStream = {
  getTracks: () => [{ stop: jest.fn() }]
};

Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue(mockStream)
  }
});

test('should capture photo when capture button clicked', async () => {
  const onPhotosComplete = jest.fn();
  render(<CameraView onPhotosComplete={onPhotosComplete} />);
  
  const captureButton = screen.getByRole('button', { name: /capture/i });
  fireEvent.click(captureButton);
  
  // Wait for photo capture
  await waitFor(() => {
    expect(onPhotosComplete).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          dataUrl: expect.any(String),
          filter: expect.any(String),
          timestamp: expect.any(Number)
        })
      ])
    );
  });
});
```

## Performance Optimization

### React Optimizations
```typescript
// Memoize expensive operations
const FilterSelector = React.memo<FilterSelectorProps>(({ 
  filters, 
  selectedFilter, 
  onFilterChange 
}) => {
  return (
    <div className="filter-grid">
      {filters.map(filter => (
        <FilterButton
          key={filter.id}
          filter={filter}
          isSelected={selectedFilter === filter.id}
          onClick={() => onFilterChange(filter.id)}
        />
      ))}
    </div>
  );
});

// Use useMemo for computed values
const filteredPhotos = useMemo(() => {
  return photos.filter(photo => photo.filter !== 'none');
}, [photos]);

// Use useCallback for stable function references
const handlePhotoCapture = useCallback((photo: Photo) => {
  setPhotos(prev => [...prev, photo]);
}, []);
```

### Memory Management
```typescript
// Cleanup blob URLs to prevent memory leaks
const VideoDownloadView: React.FC<VideoDownloadViewProps> = ({ video }) => {
  const [blobUrl, setBlobUrl] = useState<string>('');
  
  useEffect(() => {
    // Create blob URL
    const url = URL.createObjectURL(video.blob);
    setBlobUrl(url);
    
    // Cleanup on unmount
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [video.blob]);
  
  return <video src={blobUrl} controls />;
};
```

### Performance Monitoring
```typescript
// Performance measurement utilities
const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Usage in critical paths
const handleExport = async () => {
  measurePerformance('Image Export', () => {
    const dataUrl = await composePhotoStrip(photos, layout, template);
    downloadImage(dataUrl);
  });
};
```

## Debugging & Troubleshooting

### Common Issues

#### Camera Permission Errors
```typescript
// Handle camera permissions gracefully
const handleCameraError = (error: Error) => {
  if (error.name === 'NotAllowedError') {
    setUserMessage('Camera access denied. Please allow camera access.');
  } else if (error.name === 'NotFoundError') {
    setUserMessage('No camera found. Please connect a camera.');
  } else {
    setUserMessage('Camera error: ' + error.message);
  }
};
```

#### Memory Leaks
```typescript
// Proper cleanup in useEffect
useEffect(() => {
  let mounted = true;
  
  const asyncOperation = async () => {
    const result = await someAsyncOperation();
    if (mounted) {
      setState(result);
    }
  };
  
  asyncOperation();
  
  return () => {
    mounted = false;
  };
}, []);
```

### Browser DevTools Tips
- **React DevTools**: Component state and props inspection
- **Performance Tab**: Memory usage and performance profiling
- **Network Tab**: Resource loading optimization
- **Console**: Error tracking and debugging

## Deployment

### Build Process
```bash
# Development build
npm run build:dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Static Deployment
The application is designed for static hosting:

1. **Build the application**: `npm run build`
2. **Deploy to platform**: Netlify, Vercel, GitHub Pages
3. **Configure HTTPS**: Required for camera access
4. **Set up custom domain** (optional)

### Environment Variables
```bash
# .env.example
VITE_APP_TITLE=Snap Style Booth
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false
```

## Contributing

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] Tests are included for new features
- [ ] Performance impact considered
- [ ] Browser compatibility verified
- [ ] Documentation updated
- [ ] Accessibility requirements met

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing done

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

This comprehensive developer guide provides all the necessary information for contributing to and maintaining the Snap Style Booth application, ensuring consistent code quality and efficient development practices.