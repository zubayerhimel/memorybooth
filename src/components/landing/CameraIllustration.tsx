import { useState, useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';

export const CameraIllustration = () => {
  const [showPhoto, setShowPhoto] = useState(false);

  // Animate photo ejection periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setShowPhoto(true);
      setTimeout(() => setShowPhoto(false), 2500);
    }, 4000);
    
    // Show first animation after a delay
    const timeout = setTimeout(() => setShowPhoto(true), 1000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="relative mb-6 sm:mb-8 animate-slide-up">
      {/* Main Camera Body */}
      <div className="relative w-52 h-56 sm:w-72 sm:h-80 animate-float">
        {/* Camera outer shell - Instax style */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f0e8] to-[#e8e0d5] rounded-[2rem] sm:rounded-[2.5rem] shadow-card border-2 border-white/50">
          
          {/* Camera top section with viewfinder */}
          <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 w-[85%] h-10 sm:h-14 bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-t-2xl rounded-b-lg flex items-center justify-between px-3 sm:px-4">
            {/* Viewfinder */}
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-[#4a5568] border-2 border-[#2d3748] flex items-center justify-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-gradient-to-br from-sky/60 to-lavender/60" />
            </div>
            {/* Flash unit */}
            <div className="relative">
              <div className="w-8 h-6 sm:w-10 sm:h-8 bg-gradient-to-b from-[#ffd700] to-[#f59e0b] rounded-md shadow-inner animate-pulse-soft" />
              <div className="absolute inset-0.5 bg-gradient-to-br from-yellow-200/80 to-transparent rounded-md" />
            </div>
          </div>

          {/* Main lens area */}
          <div className="absolute top-14 sm:top-20 left-1/2 -translate-x-1/2">
            {/* Lens outer ring */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] p-1.5 sm:p-2 shadow-lg animate-lens-glow">
              {/* Lens middle ring */}
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#3a3a3a] to-[#2a2a2a] p-1.5 sm:p-2">
                {/* Lens inner glass */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1e3a5f] via-[#0f172a] to-[#1e293b] flex items-center justify-center relative overflow-hidden">
                  {/* Lens reflection */}
                  <div className="absolute top-1 left-1 w-4 h-4 sm:w-6 sm:h-6 bg-white/20 rounded-full blur-sm" />
                  <div className="absolute bottom-2 right-2 w-2 h-2 sm:w-3 sm:h-3 bg-white/10 rounded-full" />
                  {/* Rainbow ring inside lens */}
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 sm:border-4 border-transparent animate-rainbow-ring" 
                       style={{ 
                         background: 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(234,179,8,0.3), rgba(34,197,94,0.3), rgba(59,130,246,0.3), rgba(168,85,247,0.3))',
                         backgroundSize: '200% 200%'
                       }} />
                </div>
              </div>
            </div>
          </div>

          {/* Shutter button */}
          <div className="absolute top-16 sm:top-24 right-3 sm:right-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-primary to-primary/80 shadow-lg border-2 border-primary-foreground/20 animate-pulse-soft" />
          </div>

          {/* Brand text area */}
          <div className="absolute top-[9.5rem] sm:top-[14rem] left-1/2 -translate-x-1/2 text-center">
            <div className="text-[10px] sm:text-xs font-bold text-foreground/60 tracking-widest">MEMORY</div>
            <div className="text-[8px] sm:text-[10px] text-foreground/40 tracking-wider">instant</div>
          </div>

          {/* Photo output slot */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 w-[70%] h-1.5 sm:h-2 bg-foreground/20 rounded-full shadow-inner" />
        </div>

        {/* Ejecting Photo */}
        <div 
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 transition-all duration-700 ease-out ${
            showPhoto ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transform: `translateX(-50%) translateY(${showPhoto ? '20px' : '-40px'}) rotate(${showPhoto ? '-2deg' : '0deg'})`,
          }}
        >
          {/* Polaroid-style photo */}
          <div className="w-24 h-28 sm:w-32 sm:h-36 bg-white rounded-sm shadow-photo p-1.5 sm:p-2 animate-photo-wiggle">
            {/* Photo image area */}
            <div className="w-full h-[70%] bg-gradient-to-br from-sky/30 via-lavender/30 to-primary/30 rounded-sm flex items-center justify-center overflow-hidden">
              <div className="text-2xl sm:text-3xl">📸</div>
            </div>
            {/* Photo bottom area */}
            <div className="h-[30%] flex items-center justify-center">
              <div className="flex gap-0.5">
                <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary fill-primary" />
                <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary fill-primary" />
                <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary fill-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements around camera */}
      <Heart className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-6 h-6 sm:w-8 sm:h-8 text-primary fill-primary animate-pulse-soft" />
      <Sparkles className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-8 h-8 sm:w-10 sm:h-10 text-yellow animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-8 -left-3 sm:-left-6 w-4 h-4 sm:w-5 sm:h-5 bg-accent rounded-full animate-bounce-soft opacity-70" style={{ animationDelay: '0.2s' }} />
      <div className="absolute top-16 -right-2 sm:-right-5 w-3 h-3 sm:w-4 sm:h-4 bg-lavender rounded-full animate-bounce-soft opacity-60" style={{ animationDelay: '0.7s' }} />
    </div>
  );
};
