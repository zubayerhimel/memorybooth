export const DecorativeBackground = () => {
  return (
    <>
      <div className="hidden sm:block absolute top-10 left-10 w-8 h-8 bg-accent rounded-full opacity-60 animate-bounce-soft" />
      <div className="hidden sm:block absolute top-20 right-20 w-6 h-6 bg-yellow rounded-full opacity-70 animate-bounce-soft" style={{ animationDelay: '0.3s' }} />
      <div className="hidden sm:block absolute bottom-32 left-20 w-10 h-10 bg-lavender rounded-full opacity-50 animate-bounce-soft" style={{ animationDelay: '0.6s' }} />
      <div className="hidden sm:block absolute bottom-20 right-16 w-5 h-5 bg-sky rounded-full opacity-60 animate-bounce-soft" style={{ animationDelay: '0.9s' }} />
    </>
  );
};
