const artwork = {
  horizontal: { src: '/logo2.png', width: 1448, height: 444, box: '0 0 1448 444' },
  symbol: { src: '/etihad-symbol.png', width: 1254, height: 1254, box: '85 236 1143 807' },
  stacked: { src: '/logo.png', width: 1122, height: 1402, box: '38 235 1052 992' },
  app: { src: '/etihad-app.png', width: 1254, height: 1254, box: '60 63 1135 1119' },
};

// Frame transparent margins in the layout while preserving the original PNGs.
export function BrandLogo({
  variant = 'horizontal',
  className = '',
  decorative = false,
}: {
  variant?: keyof typeof artwork;
  className?: string;
  decorative?: boolean;
}) {
  const art = artwork[variant];
  const [, , width, height] = art.box.split(' ');
  return (
    <svg
      className={`brand-logo ${className}`}
      viewBox={art.box}
      width={width}
      height={height}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'Etihad Real Estate'}
      aria-hidden={decorative || undefined}
      focusable="false"
    >
      <image href={art.src} width={art.width} height={art.height} />
    </svg>
  );
}
