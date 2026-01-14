import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraErrorProps {
  error: string;
  onRetry: () => void;
}

export const CameraError = ({ error, onRetry }: CameraErrorProps) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/90 p-6 text-center">
      <AlertCircle className="w-12 h-12 text-destructive mb-4" />
      <p className="font-medium text-foreground mb-2">Camera Access Required</p>
      <p className="text-sm text-muted-foreground mb-4">{error}</p>
      <Button onClick={onRetry} size="sm">
        Try Again
      </Button>
    </div>
  );
};
