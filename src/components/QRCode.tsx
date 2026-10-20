import { QRCodeSVG } from 'qrcode.react';

/**
 * Scannable QR Code using the qrcode.react library.
 * Replaces the previous custom implementation that produced non-decodable patterns.
 */
export function QRCode({
  value,
  size = 120,
  className = '',
  color = '#0f172a',
  bgColor = '#ffffff',
}: {
  value: string;
  size?: number;
  className?: string;
  color?: string;
  bgColor?: string;
}) {
  return (
    <QRCodeSVG
      value={value || ' '}
      size={size}
      fgColor={color}
      bgColor={bgColor}
      level="M"
      className={className}
      style={{ display: 'block', borderRadius: 6 }}
      aria-label={`QR Code for ${value}`}
    />
  );
}
