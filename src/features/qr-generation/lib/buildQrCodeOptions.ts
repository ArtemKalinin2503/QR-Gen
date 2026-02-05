import type { Options } from "qr-code-styling";
import { wrapLogoWithBackground } from "./wrapLogoWithBackground";

type DotType = NonNullable<Options["dotsOptions"]>["type"];
type CornerSquareType = NonNullable<Options["cornersSquareOptions"]>["type"];
type CornerDotType = NonNullable<Options["cornersDotOptions"]>["type"];

type StyleMode = "auto" | "manual";

type QrSettings = {
  sizePx: number;
  hasSafeZone: boolean;
  safeZoneColor: string;
  safeZoneSizePx: number;
  lineThickness: number;
  verticalAlignmentScale: number;
  horizontalAlignmentScale: number;
  dotsTypeMode: StyleMode;
  dotsType: DotType;
  dotsColor: string;

  cornersSquareTypeMode: StyleMode;
  cornersSquareType: CornerSquareType;
  cornersSquareColor: string;

  cornersDotTypeMode: StyleMode;
  cornersDotType: CornerDotType;
  cornersDotColor: string;

  logoBackgroundEnabled: boolean;
  logoBackgroundColor: string;
  logoSizePx: number;
  backgroundColor: string;
  backgroundAutoPickEnabled: boolean;
};

type BuildQrCodeOptionsParams = {
  data: string;
  sizePx: number;
  qrSettings: QrSettings;
  logoBase64: string | null;

  qrColor: string;
  backgroundFallbackColor: string;

  forceTransparentBackground?: boolean;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const mapLineThicknessToDotsType = (lineThickness: number): DotType => {
  const normalized = clamp01(lineThickness);
  if (normalized < 0.35) return "dots";
  if (normalized < 0.75) return "rounded";
  return "square";
};

const mapScaleToCornersSquareType = (scale: number): CornerSquareType => {
  const normalized = clamp01(scale);
  if (normalized < 0.35) return "dot";
  if (normalized < 0.75) return "extra-rounded";
  return "square";
};

const mapScaleToCornersDotType = (scale: number): CornerDotType => {
  const normalized = clamp01(scale);
  if (normalized < 0.35) return "dot";
  if (normalized < 0.75) return "rounded";
  return "square";
};

const clampLogoSizeRatio = (ratio: number) => {
  const maxRatio = 0.3;
  return Math.min(maxRatio, Math.max(0.05, ratio));
};

export const getMinQuietZonePx = (qrSizePx: number) => {
  const approxModulePx = qrSizePx / 41;
  const minByModules = 4 * approxModulePx;
  const minByPercent = qrSizePx * 0.1;

  return Math.ceil(Math.max(minByModules, minByPercent));
};

export const getEffectiveQuietZonePx = (
  qrSizePx: number,
  requestedQuietZonePx: number,
) => Math.max(requestedQuietZonePx, getMinQuietZonePx(qrSizePx));

export const buildQrCodeOptions = ({
  data,
  sizePx,
  qrSettings,
  logoBase64,
  qrColor,
  backgroundFallbackColor,
  forceTransparentBackground,
}: BuildQrCodeOptionsParams): Options => {
  const qrMargin = qrSettings.hasSafeZone
    ? getEffectiveQuietZonePx(sizePx, qrSettings.safeZoneSizePx)
    : 0;

  const dotsType =
    qrSettings.dotsTypeMode === "manual"
      ? qrSettings.dotsType
      : mapLineThicknessToDotsType(qrSettings.lineThickness);

  const cornersSquareType =
    qrSettings.cornersSquareTypeMode === "manual"
      ? qrSettings.cornersSquareType
      : mapScaleToCornersSquareType(qrSettings.horizontalAlignmentScale);

  const cornersDotType =
    qrSettings.cornersDotTypeMode === "manual"
      ? qrSettings.cornersDotType
      : mapScaleToCornersDotType(qrSettings.verticalAlignmentScale);

  const logoRatio = clampLogoSizeRatio(qrSettings.logoSizePx / sizePx);

  const logoImage = logoBase64
    ? wrapLogoWithBackground({
        logoDataUrl: logoBase64,
        backgroundColor: qrSettings.logoBackgroundColor,
        isBackgroundEnabled: qrSettings.logoBackgroundEnabled,
      })
    : undefined;

  const normalizedBackground = (qrSettings.backgroundColor || "").trim();
  const effectiveBackgroundColor = forceTransparentBackground
    ? "transparent"
    : normalizedBackground || backgroundFallbackColor;

  return {
    width: sizePx,
    height: sizePx,
    type: "svg",
    data: data || " ",
    margin: qrMargin,

    qrOptions: { errorCorrectionLevel: "H" },

    dotsOptions: {
      color: qrSettings.dotsColor || qrColor,
      type: dotsType,
    },

    cornersSquareOptions: {
      color: qrSettings.cornersSquareColor || qrColor,
      type: cornersSquareType,
    },

    cornersDotOptions: {
      color: qrSettings.cornersDotColor || qrColor,
      type: cornersDotType,
    },

    backgroundOptions: {
      color: effectiveBackgroundColor,
    },

    image: logoImage,
    imageOptions: {
      crossOrigin: "anonymous",
      imageSize: logoBase64 ? logoRatio : 0,
      hideBackgroundDots: Boolean(logoBase64),
      margin: 0,
    },
  };
};
