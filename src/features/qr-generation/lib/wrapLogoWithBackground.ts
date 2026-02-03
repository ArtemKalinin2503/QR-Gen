const encodeSvgAsDataUrl = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export const wrapLogoWithBackground = (params: {
  logoDataUrl: string;
  backgroundColor: string;
  isBackgroundEnabled: boolean;
}) => {
  if (!params.isBackgroundEnabled) return params.logoDataUrl;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1000" height="1000" viewBox="0 0 1000 1000">
      <rect width="1000" height="1000" fill="${params.backgroundColor}" />
      <image
        href="${params.logoDataUrl}"
        xlink:href="${params.logoDataUrl}"
        x="0"
        y="0"
        width="1000"
        height="1000"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  `.trim();

  return encodeSvgAsDataUrl(svg);
};
