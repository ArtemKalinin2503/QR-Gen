export const clampLogoSizePx = (logoSizePx: number, qrSizePx: number) => {
  const maxLogoSizePx = Math.floor(qrSizePx * 0.3);
  const minLogoSizePx = Math.floor(qrSizePx * 0.05);

  return Math.min(maxLogoSizePx, Math.max(minLogoSizePx, logoSizePx));
};
