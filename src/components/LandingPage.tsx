import { Camera, Heart, Sparkles, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage = ({ onStart }: LandingPageProps) => {
  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-6">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-8 h-8 bg-accent rounded-full opacity-60 animate-bounce-soft" />
      <div className="absolute top-20 right-20 w-6 h-6 bg-yellow rounded-full opacity-70 animate-bounce-soft" style={{ animationDelay: '0.3s' }} />
      <div className="absolute bottom-32 left-20 w-10 h-10 bg-lavender rounded-full opacity-50 animate-bounce-soft" style={{ animationDelay: '0.6s' }} />
      <div className="absolute bottom-20 right-16 w-5 h-5 bg-sky rounded-full opacity-60 animate-bounce-soft" style={{ animationDelay: '0.9s' }} />

      {/* Camera illustration */}
      <div className="relative mb-8 animate-slide-up">
        <div className="w-64 h-80 bg-secondary rounded-3xl shadow-card flex flex-col items-center pt-6 relative overflow-hidden">
          {/* Camera top */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-primary/10 flex items-center justify-between px-6">
            <div className="w-8 h-8 rounded-full bg-foreground/10" />
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <div className="w-3 h-3 rounded-full bg-yellow" />
            </div>
          </div>
          
          {/* Lens */}
          <div className="mt-12 w-36 h-36 rounded-full bg-foreground/80 flex items-center justify-center shadow-card">
            <div className="w-28 h-28 rounded-full bg-foreground/90 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky to-lavender flex items-center justify-center">
                <Camera className="w-10 h-10 text-card" />
              </div>
            </div>
          </div>

          {/* Flash */}
          <div className="absolute top-6 right-6 w-6 h-6 rounded-sm bg-yellow shadow-soft" />

          {/* Photo output slot */}
          <div className="mt-6 w-48 h-3 bg-foreground/20 rounded-full" />

          {/* Photo strip preview */}
          <div className="mt-4 w-44 h-16 bg-card rounded-lg shadow-soft flex items-center justify-center">
            <div className="flex gap-1.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-8 h-10 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Decorative hearts */}
        <Heart className="absolute -top-4 -right-4 w-8 h-8 text-primary fill-primary animate-pulse-soft" />
        <Sparkles className="absolute -bottom-2 -left-6 w-10 h-10 text-yellow animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Text content */}
      <div className="text-center mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
          Instant <span className="bg-gradient-to-r from-primary to-[hsl(20,80%,70%)] bg-clip-text text-transparent">Photo Booth</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Capture memories, add fun filters, and download your photo strip in seconds!
        </p>
      </div>

      {/* Features */}
      <div className="flex gap-6 mb-10 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center">
            <Camera className="w-4 h-4 text-accent-foreground" />
          </div>
          <span className="font-medium">4 Photos</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-yellow/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-yellow-foreground" />
          </div>
          <span className="font-medium">Fun Filters</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-sky/30 flex items-center justify-center">
            <Download className="w-4 h-4 text-sky-foreground" />
          </div>
          <span className="font-medium">Easy Download</span>
        </div>
      </div>

      {/* CTA Button */}
      <Button
        onClick={onStart}
        size="xl"
        className="animate-slide-up font-display"
        style={{ animationDelay: '0.6s' }}
      >
        <Camera className="size-8" />
        Start Photo Booth
      </Button>

      {/* Footer note */}
      <p className="mt-8 text-xs text-muted-foreground animate-slide-up" style={{ animationDelay: '0.8s' }}>
        Works best on desktop • Camera access required
      </p>
    </div>
  );
};
