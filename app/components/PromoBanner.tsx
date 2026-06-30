interface BannerProps {
  title: string;
  subtitle: string;
  buttonText: string;
  image: string;
  theme?: 'primary' | 'secondary' | 'accent';
}

export function PromoBanner({ title, subtitle, buttonText, image, theme = 'primary' }: BannerProps) {
  const bgColors = {
    primary: 'from-primary/20 to-accent/20',
    secondary: 'from-secondary/30 to-primary/20',
    accent: 'from-accent/30 to-secondary/20'
  };

  const textColors = {
    primary: 'text-primary',
    secondary: 'text-secondary-foreground',
    accent: 'text-accent-foreground'
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${bgColors[theme]} h-80 group cursor-pointer`}>
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />
      </div>
      
      <div className="relative h-full flex items-center px-8 md:px-12">
        <div className="max-w-md space-y-4">
          <p className={`text-sm uppercase tracking-widest ${textColors[theme]}`}>
            {subtitle}
          </p>
          <h2 className="text-3xl md:text-4xl text-foreground">
            {title}
          </h2>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-white rounded-full hover:bg-primary transition-all duration-300 shadow-lg hover:shadow-xl">
            {buttonText}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
