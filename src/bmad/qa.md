# Quality Assurance Documentation

## Testing Strategy Overview

The QA strategy for Snap Style Booth encompasses multiple testing layers to ensure a robust, user-friendly, and performant application. Our approach combines automated testing, manual verification, and continuous quality monitoring.

## Testing Pyramid

```
        ┌─────────────────────┐
        │     E2E Testing     │  ← 10% (Critical user journeys)
        └─────────────────────┘
      ┌─────────────────────────┐
      │   Integration Testing   │  ← 30% (Component interactions)
      └─────────────────────────┘
    ┌─────────────────────────────┐
    │       Unit Testing          │  ← 60% (Individual functions/units)
    └─────────────────────────────┘
```

## Test Coverage Requirements

### Coverage Metrics
- **Unit Tests**: 80% minimum for core logic
- **Integration Tests**: 70% for user workflows
- **E2E Tests**: 100% for critical paths
- **Branch Coverage**: 75% minimum
- **Function Coverage**: 85% minimum

### Priority Areas
1. **Camera Operations**: Access, capture, stream management
2. **Media Processing**: Filter application, export generation
3. **State Management**: Workflow transitions, data persistence
4. **Error Handling**: Permission failures, device limitations
5. **Performance**: Load times, memory usage, responsiveness

## Unit Testing

### Core Components Testing

#### Camera Hook Tests
```typescript
// src/__tests__/hooks/useCamera.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCamera } from '../../hooks/useCamera';

// Mock getUserMedia
const mockGetUserMedia = jest.fn();
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: { getUserMedia: mockGetUserMedia }
});

describe('useCamera', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should successfully start camera with default constraints', async () => {
    const mockStream = {
      getTracks: () => [{ stop: jest.fn() }]
    };
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useCamera());

    await act(async () => {
      await result.current.startCamera();
    });

    expect(result.current.stream).toBe(mockStream);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(mockGetUserMedia).toHaveBeenCalledWith({
      video: true,
      audio: false
    });
  });

  test('should handle camera permission denial', async () => {
    mockGetUserMedia.mockRejectedValue(
      new DOMException('Permission denied', 'NotAllowedError')
    );

    const { result } = renderHook(() => useCamera());

    await act(async () => {
      await result.current.startCamera();
    });

    expect(result.current.stream).toBeNull();
    expect(result.current.error).toBe('Permission denied');
    expect(result.current.isLoading).toBe(false);
  });

  test('should clean up stream on unmount', () => {
    const mockStop = jest.fn();
    const mockStream = {
      getTracks: () => [{ stop: mockStop }]
    };
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { unmount } = renderHook(() => useCamera());

    act(async () => {
      await result.current.startCamera();
    });

    unmount();

    expect(mockStop).toHaveBeenCalled();
  });
});
```

#### Filter Utility Tests
```typescript
// src/__tests__/utils/filters.test.ts
import { applyFilter, getFilterClass } from '../../utils/filters';

describe('Filter Utilities', () => {
  test('should apply black and white filter correctly', () => {
    const mockImageData = new ImageData(2, 1);
    // Set initial pixels: [R, G, B, A, R, G, B, A]
    mockImageData.data.set([255, 100, 50, 255, 0, 200, 150, 255]);

    const result = applyFilter(mockImageData, 'bw');

    // All RGB values should be equal (grayscale)
    expect(result.data[0]).toBe(result.data[1]);
    expect(result.data[1]).toBe(result.data[2]);
    expect(result.data[4]).toBe(result.data[5]);
    expect(result.data[5]).toBe(result.data[6]);
  });

  test('should return correct CSS class for filter', () => {
    expect(getFilterClass('sepia')).toBe('filter-sepia');
    expect(getFilterClass('none')).toBe('');
    expect(getFilterClass('cyberpunk')).toBe('filter-cyberpunk');
  });

  test('should handle invalid filter type', () => {
    const mockImageData = new ImageData(1, 1);
    
    expect(() => {
      applyFilter(mockImageData, 'invalid-filter' as any);
    }).toThrow('Unknown filter type');
  });
});
```

#### Photo Processing Tests
```typescript
// src/__tests__/utils/photoProcessing.test.ts
import { 
  capturePhoto, 
  applyStickers, 
  composePhotoStrip,
  resizeImage 
} from '../../utils/photoProcessing';

describe('Photo Processing', () => {
  test('should capture photo from video element', async () => {
    // Mock video element
    const mockVideo = {
      videoWidth: 640,
      videoHeight: 480,
      getContext: jest.fn()
    } as any;

    const photo = await capturePhoto(mockVideo, 'sepia');

    expect(photo).toHaveProperty('id');
    expect(photo).toHaveProperty('dataUrl');
    expect(photo.filter).toBe('sepia');
    expect(photo.timestamp).toBeGreaterThan(0);
  });

  test('should apply stickers to canvas', async () => {
    const mockCanvas = document.createElement('canvas');
    const ctx = mockCanvas.getContext('2d');
    const stickers = [
      { id: '1', emoji: '😀', x: 50, y: 50, size: 32, rotation: 0 }
    ];

    await applyStickers(ctx, stickers);

    // Verify drawImage was called for stickers
    expect(ctx?.drawImage).toHaveBeenCalled();
  });

  test('should compose photo strip with layout', async () => {
    const photos = [
      { dataUrl: 'data:image/jpeg;base64,test1', filter: 'none' as const },
      { dataUrl: 'data:image/jpeg;base64,test2', filter: 'none' as const }
    ];
    const layout = { width: 640, height: 1280, positions: [
      { x: 0, y: 0, width: 640, height: 640 },
      { x: 0, y: 640, width: 640, height: 640 }
    ]};

    const result = await composePhotoStrip(photos, layout);

    expect(result).toMatch(/^data:image\/png;base64,/);
  });
});
```

## Integration Testing

### Component Integration Tests
```typescript
// src/__tests__/components/CameraView.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CameraView } from '../../components/CameraView';

// Mock camera stream
const createMockStream = () => ({
  getTracks: () => [{ stop: jest.fn() }]
});

// Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue(createMockStream())
  }
});

describe('CameraView Integration', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
  });

  test('should complete photo capture workflow', async () => {
    const onPhotosComplete = jest.fn();
    render(<CameraView onPhotosComplete={onPhotosComplete} />);

    // Wait for camera to initialize
    await waitFor(() => {
      expect(screen.getByTestId('video-preview')).toBeInTheDocument();
    });

    // Switch to photo mode if needed
    const photoModeButton = screen.getByRole('button', { name: /photo/i });
    await user.click(photoModeButton);

    // Capture photos (4 shots for photo strip)
    const captureButton = screen.getByRole('button', { name: /capture/i });
    
    for (let i = 0; i < 4; i++) {
      await user.click(captureButton);
      
      // Wait for countdown and capture
      await waitFor(() => {
        expect(screen.getByText(`${4 - i}`)).toBeInTheDocument();
      }, { timeout: 1000 });
    }

    // Verify completion callback was called
    await waitFor(() => {
      expect(onPhotosComplete).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            dataUrl: expect.any(String),
            filter: expect.any(String)
          })
        ])
      );
    });
  });

  test('should handle camera permissions gracefully', async () => {
    // Mock permission denied
    navigator.mediaDevices.getUserMedia = jest.fn()
      .mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError'));

    render(<CameraView onPhotosComplete={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/camera access denied/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  test('should switch between photo and video modes', async () => {
    render(<CameraView onPhotosComplete={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /photo/i })).toBeInTheDocument();
    });

    // Switch to video mode
    const videoModeButton = screen.getByRole('button', { name: /video/i });
    await user.click(videoModeButton);

    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
  });
});
```

### Workflow Integration Tests
```typescript
// src/__tests__/workflows/PhotoEditing.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterEditor } from '../../components/FilterEditor';

describe('Photo Editing Workflow', () => {
  const mockPhotos = [
    {
      id: '1',
      dataUrl: 'data:image/jpeg;base64,test',
      filter: 'none' as const,
      timestamp: Date.now(),
      stickers: [],
      textOverlays: []
    }
  ];

  test('should complete filter selection and apply workflow', async () => {
    const onComplete = jest.fn();
    render(<FilterEditor photos={mockPhotos} onComplete={onComplete} />);

    // Select a filter
    const sepiaFilter = screen.getByRole('button', { name: /sepia/i });
    await userEvent.click(sepiaFilter);

    // Apply filter to photo
    const applyButton = screen.getByRole('button', { name: /apply/i });
    await userEvent.click(applyButton);

    // Proceed to next step
    const nextButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            filter: 'sepia'
          })
        ])
      );
    });
  });
});
```

## E2E Testing

### Critical User Journey Tests
```typescript
// tests/e2e/complete-photo-booth-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete Photo Booth Journey', () => {
  test('should complete full photo workflow', async ({ page }) => {
    await page.goto('/');
    
    // Start photo booth
    await page.click('[data-testid="start-button"]');
    
    // Allow camera permissions
    await page.context().grantPermissions(['camera']);
    
    // Wait for camera to initialize
    await page.waitForSelector('[data-testid="video-preview"]');
    await expect(page.locator('[data-testid="video-preview"]')).toBeVisible();
    
    // Select photo mode
    await page.click('[data-testid="photo-mode-button"]');
    
    // Capture 4 photos
    for (let i = 0; i < 4; i++) {
      await page.click('[data-testid="capture-button"]');
      await page.waitForSelector(`[data-testid="countdown-${4 - i}"]`);
      await page.waitForSelector(`[data-testid="countdown-${4 - i}"]`, { state: 'hidden' });
    }
    
    // Should navigate to filter selection
    await expect(page.locator('[data-testid="filter-editor"]')).toBeVisible();
    
    // Select a filter
    await page.click('[data-testid="filter-sepia"]');
    
    // Apply filter
    await page.click('[data-testid="apply-filter-button"]');
    
    // Navigate to stickers
    await page.click('[data-testid="next-button"]');
    await expect(page.locator('[data-testid="sticker-editor"]')).toBeVisible();
    
    // Skip stickers (optional)
    await page.click('[data-testid="next-button"]');
    
    // Should reach download page
    await expect(page.locator('[data-testid="download-view"]')).toBeVisible();
    
    // Download photo strip
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-button"]');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/photo-booth.*\.png$/);
  });
});

test.describe('Video Recording Journey', () => {
  test('should record and export video with filters', async ({ page }) => {
    await page.goto('/');
    
    await page.click('[data-testid="start-button"]');
    await page.context().grantPermissions(['camera']);
    await page.waitForSelector('[data-testid="video-preview"]');
    
    // Select video mode
    await page.click('[data-testid="video-mode-button"]');
    
    // Start recording
    await page.click('[data-testid="start-recording-button"]');
    await expect(page.locator('[data-testid="recording-indicator"]')).toBeVisible();
    
    // Wait for recording duration
    await page.waitForTimeout(5000);
    
    // Stop recording
    await page.click('[data-testid="stop-recording-button"]');
    await expect(page.locator('[data-testid="video-filter-editor"]')).toBeVisible();
    
    // Apply filter
    await page.click('[data-testid="filter-cyberpunk"]');
    await page.click('[data-testid="apply-filter-button"]');
    
    // Download video
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-video-button"]');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/video-booth.*\.mp4$/);
  });
});
```

## Performance Testing

### Load Performance Tests
```typescript
// tests/performance/load-performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load initial page within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance assertions
    expect(loadTime).toBeLessThan(3000); // 3 seconds
    
    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
            if (entry.entryType === 'first-input') {
              vitals.fid = entry.processingStart - entry.startTime;
            }
          });
          
          resolve(vitals);
        }).observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      });
    });
    
    expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
    expect(metrics.fid).toBeLessThan(100);   // FID < 100ms
  });
});

test('camera initialization should be fast', async ({ page }) => {
  await page.goto('/');
  await page.context().grantPermissions(['camera']);
  
  const startTime = Date.now();
  await page.click('[data-testid="start-button"]');
  await page.waitForSelector('[data-testid="video-preview"]');
  
  const cameraInitTime = Date.now() - startTime;
  expect(cameraInitTime).toBeLessThan(2000); // Camera ready in < 2s
});
```

## Cross-Browser Testing

### Browser Compatibility Matrix

| Browser | Version | Camera | Filters | Export | Mobile |
|---------|---------|--------|---------|--------|--------|
| Chrome | 90+ | ✅ | ✅ | ✅ | ✅ |
| Firefox | 88+ | ✅ | ✅ | ✅ | ⚠️ |
| Safari | 14+ | ✅ | ✅ | ✅ | ✅ |
| Edge | 90+ | ✅ | ✅ | ✅ | ⚠️ |

### Browser-Specific Tests
```typescript
// tests/cross-browser/browser-compatibility.spec.ts
import { test, devices } from '@playwright/test';

const browsers = [
  { name: 'Desktop Chrome', device: devices['Desktop Chrome'] },
  { name: 'Desktop Safari', device: devices['Desktop Safari'] },
  { name: 'Desktop Firefox', device: devices['Desktop Firefox'] },
  { name: 'iPhone 12', device: devices['iPhone 12'] },
  { name: 'Pixel 5', device: devices['Pixel 5'] }
];

browsers.forEach(({ name, device }) => {
  test.describe(`${name} Compatibility`, () => {
    test.use({ ...device });
    
    test('should work on ' + name, async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="start-button"]');
      
      // Grant camera permission
      if (device.isMobile) {
        await page.context().grantPermissions(['camera']);
      }
      
      await page.waitForSelector('[data-testid="video-preview"]');
      
      // Test basic functionality
      await page.click('[data-testid="photo-mode-button"]');
      await page.click('[data-testid="capture-button"]');
      
      // Should not crash and show expected UI elements
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
```

## Accessibility Testing

### WCAG 2.1 AA Compliance Tests
```typescript
// tests/accessibility/a11y.spec.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
  });

  test('should pass accessibility audit on landing page', async ({ page }) => {
    await checkA11y(page);
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Test Tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test Enter key on start button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="video-preview"]')).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    const startButton = page.locator('[data-testid="start-button"]');
    await expect(startButton).toHaveAttribute('aria-label');
    
    await page.click('[data-testid="start-button"]');
    
    const captureButton = page.locator('[data-testid="capture-button"]');
    await expect(captureButton).toHaveAttribute('aria-label');
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
  });
});
```

## Manual Testing Guidelines

### Device Testing Checklist

#### Mobile Devices
- [ ] Camera access and preview works
- [ ] Touch interactions responsive
- [ ] Portrait/landscape orientation handled
- [ ] Performance acceptable on lower-end devices
- [ ] Download functionality works
- [ ] Gallery history persists

#### Desktop Browsers
- [ ] All filters render correctly
- [ ] Keyboard navigation works
- [ ] Export downloads correctly
- [ ] Memory usage stays within limits
- [ ] Responsive design works

#### Camera Edge Cases
- [ ] No camera available handling
- [ ] Camera permission denied
- [ ] Camera disconnection mid-session
- [ ] Multiple camera device selection
- [ ] Front/rear camera switching

### Test Scenarios

#### Happy Path Tests
1. **Complete Photo Workflow**: Start → Capture → Filter → Sticker → Download
2. **Complete Video Workflow**: Start → Record → Filter → Download
3. **Gallery History**: Create → View → Download → Delete sessions
4. **Template Customization**: Select → Customize → Apply → Export

#### Error Scenarios
1. **Camera Errors**: Permission denied, no device, disconnection
2. **Export Errors**: Large files, browser limitations, memory issues
3. **Network Issues**: Offline behavior, slow connections
4. **Browser Limitations**: Unsupported features, memory constraints

#### Performance Tests
1. **Load Performance**: Cold start, warm start, cached
2. **Memory Usage**: Extended sessions, large media files
3. **Camera Performance**: Stream initialization, filter application
4. **Export Performance**: Large photo strips, GIF generation

## Quality Metrics & Monitoring

### Automated Quality Gates

#### Pre-commit Hooks
```json
// package.json scripts
{
  "pre-commit": "lint-staged",
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

#### CI/CD Pipeline
```yaml
# .github/workflows/quality-check.yml
name: Quality Checks
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run lint
      - run: npm run test:coverage
      - run: npm run build
      - run: npm run test:e2e

  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci
      - run: npm run build
      - run: npm run test:performance
```

### Performance Budgets
```javascript
// performance.config.js
export const performanceBudgets = {
  loadTime: 3000,        // 3 seconds
  cameraInit: 2000,      // 2 seconds
  filterApply: 100,      // 100ms
  exportTime: 5000,      // 5 seconds
  memoryUsage: 500000000 // 500MB
};
```

## Bug Tracking & Issue Management

### Bug Classification

#### Severity Levels
- **Critical**: App unusable, security issues
- **High**: Core features broken, major UX issues
- **Medium**: Feature limitations, minor UX problems
- **Low**: Cosmetic issues, documentation errors

#### Priority Matrix
| Severity | Frequency | Priority | SLA |
|----------|-----------|----------|-----|
| Critical | Any | P0 | 24h |
| High | Common | P1 | 48h |
| High | Rare | P2 | 1 week |
| Medium | Any | P3 | 2 weeks |
| Low | Any | P4 | 1 month |

### Regression Testing
```typescript
// tests/regression/regression-suite.spec.ts
import { test } from '@playwright/test';

test.describe('Regression Tests', () => {
  // Test for previously fixed bugs
  test('should handle camera reconnection after disconnect', async ({ page }) => {
    // Regression test for issue #123
  });

  test('should not crash when applying multiple filters rapidly', async ({ page }) => {
    // Regression test for issue #156
  });
});
```

## Continuous Quality Improvement

### Quality Metrics Dashboard
- **Test Coverage**: Track over time
- **Bug Count**: New vs. resolved
- **Performance**: Core Web Vitals trends
- **User Feedback**: Satisfaction scores
- **Accessibility**: Compliance percentage

### Regular Quality Reviews
- **Weekly**: Code review statistics
- **Bi-weekly**: Performance review
- **Monthly**: Quality metrics review
- **Quarterly**: Process improvement assessment

This comprehensive QA documentation ensures consistent testing practices, thorough coverage of functionality, and continuous quality improvement throughout the development lifecycle of the Snap Style Booth application.