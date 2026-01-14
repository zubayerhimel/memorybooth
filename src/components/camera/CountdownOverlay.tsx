interface CountdownOverlayProps {
  countdown: number;
}

export const CountdownOverlay = ({ countdown }: CountdownOverlayProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
      <span 
        key={countdown}
        className="font-display text-7xl sm:text-9xl font-bold text-white drop-shadow-lg"
        style={{
          animation: 'countdown-number 1s ease-out forwards',
          textShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}
      >
        {countdown}
      </span>
    </div>
  );
};
