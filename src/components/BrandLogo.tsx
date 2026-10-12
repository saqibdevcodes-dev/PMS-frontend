const artwork = {
  full: {
    light: { src: '/Logos/EtihadRealEstate-white-bg.png', width: 2220, height: 1018 },
    dark: { src: '/Logos/EtihadRealEstated-dark-bg.png', width: 2209, height: 1001 },
  },
  symbol: {
    light: { src: '/Logos/EtihadRealEstate-favicon-white-bg.png', width: 954, height: 732 },
    dark: { src: '/Logos/EtihadRealEstate-favicon-dark-bg.png', width: 945, height: 719 },
  },
};

export function BrandLogo({
  variant = 'full',
  background = 'theme',
  className = '',
  decorative = false,
}: {
  variant?: keyof typeof artwork;
  background?: 'theme' | 'light' | 'dark';
  className?: string;
  decorative?: boolean;
}) {
  const art = artwork[variant];
  return (
    <span
      className={`brand-logo brand-logo--${background} ${className}`}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'Etihad Real Estate'}
      aria-hidden={decorative || undefined}
    >
      <img className="brand-logo-light" {...art.light} alt="" />
      <img className="brand-logo-dark" {...art.dark} alt="" />
    </span>
  );
}
