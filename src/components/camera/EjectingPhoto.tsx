interface EjectingPhotoProps {
  photoDataUrl: string;
}

export const EjectingPhoto = ({ photoDataUrl }: EjectingPhotoProps) => {
  return (
    <div className="absolute bottom-8 right-0 sm:right-2 z-20 animate-photo-eject-right">
      <div className="w-20 h-24 sm:w-28 sm:h-32 bg-white rounded-sm shadow-photo p-1.5 sm:p-2 rotate-[6deg]">
        <img 
          src={photoDataUrl} 
          alt="Captured" 
          className="w-full h-[75%] object-cover rounded-sm transform scale-x-[-1]"
        />
        <div className="h-[25%] flex items-center justify-center">
          <span className="text-[8px] sm:text-[10px] text-foreground/40 font-medium">just now ✨</span>
        </div>
      </div>
    </div>
  );
};
