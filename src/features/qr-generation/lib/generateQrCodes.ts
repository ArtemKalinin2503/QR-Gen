import QRCodeStyling from "qr-code-styling";
import { downloadZip, type InputWithSizeMeta } from "client-zip";
import { buildQrCodeOptions } from "./buildQrCodeOptions";
import { applyBackgroundToQrSvg } from "./applyBackgroundToQrSvg";
import { applySignatureToQrSvg } from "./applySignatureToQrSvg";

type RegistryRow = [fileName: string, data: string];

type QrSettings = Parameters<typeof buildQrCodeOptions>[0]["qrSettings"];

type GenerateQrCodesParams = {
  rows: RegistryRow[];
  qrSettings: QrSettings;
  logoBase64: string | null;
  imageExtension: string;

  backgroundDataUrl?: string | null;
  backgroundOverlayColor?: string;
  backgroundOverlayAlpha?: number;
};

export async function generateQrCodes({
  rows,
  qrSettings,
  logoBase64,
  imageExtension,
  backgroundDataUrl = null,
  backgroundOverlayColor,
  backgroundOverlayAlpha = 0,
}: GenerateQrCodesParams): Promise<Blob> {
  const files: InputWithSizeMeta[] = [];

  const safeZoneEnabled = Boolean(qrSettings.hasSafeZone);
  const safeZoneMargin = safeZoneEnabled ? Number(qrSettings.safeZoneSizePx || 0) : 0;
  const safeZoneFill = safeZoneEnabled ? String(qrSettings.safeZoneColor || "#FFFFFF") : "";
  const innerFill = String(qrSettings.backgroundColor || "#FFFFFF");
  const shouldForceTransparentBg = Boolean(backgroundDataUrl) || safeZoneEnabled;

  for (const [fileName, data] of rows) {
    const qrCode = new QRCodeStyling(
      buildQrCodeOptions({
        data,
        sizePx: qrSettings.sizePx,
        qrSettings,
        logoBase64,
        qrColor: "#000000",
        backgroundFallbackColor: shouldForceTransparentBg ? "transparent" : "#ffffff",
        forceTransparentBackground: shouldForceTransparentBg,
      }),
    );

    const svgBlob = await qrCode.getRawData("svg");
    const svgText = await svgBlob.text();

    const svgWithBackground = applyBackgroundToQrSvg(svgText, backgroundDataUrl, {
      marginPx: safeZoneMargin,
      baseFill: safeZoneFill,
      innerFill,
      overlayColor: backgroundOverlayColor,
      overlayAlpha: backgroundOverlayAlpha,
    });

    const svgWithSignature = applySignatureToQrSvg(svgWithBackground, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isEnabled: Boolean((qrSettings as any).signatureEnabled),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      text: String((qrSettings as any).signatureText ?? ""),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      borderColor: String((qrSettings as any).signatureBorderColor ?? "#000000"),
      backgroundColor: String(qrSettings.backgroundColor || "#FFFFFF"),
      sizePx: qrSettings.sizePx,
    });

    const patchedBlob = new Blob([svgWithSignature], {
      type: "image/svg+xml;charset=utf-8",
    });

    files.push({
      input: patchedBlob,
      name: `${fileName}.${imageExtension}`,
    });
  }

  return downloadZip(files).blob();
}
