interface DownloadHeaderProps {
  title?: string;
  subtitle?: string;
}

export const DownloadHeader = ({ 
  title = "Your Photos Are Ready! ✨",
  subtitle = "Customize your layout and download"
}: DownloadHeaderProps) => {
  return (
    <div className="text-center mb-4 sm:mb-6 animate-slide-up">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1">
        {title}
      </h2>
      <p className="text-muted-foreground text-xs sm:text-sm">
        {subtitle}
      </p>
    </div>
  );
};
