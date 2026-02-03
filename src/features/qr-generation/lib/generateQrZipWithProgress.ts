import QRCodeStyling from "qr-code-styling";
import { downloadZip, type InputWithSizeMeta } from "client-zip";
import { buildQrCodeOptions } from "./buildQrCodeOptions";
import { applyBackgroundToQrSvg } from "./applyBackgroundToQrSvg";
import { applySignatureToQrSvg } from "./applySignatureToQrSvg";

type RegistryRow = [fileName: string, data: string];
type QrSettings = Parameters<typeof buildQrCodeOptions>[0]["qrSettings"];

export type RegistryGenerationError = {
  lineNumber: number; // 1-based
  fileName: string;
  message: string;
};

type GenerateQrZipWithProgressParams = {
  rows: RegistryRow[];
  qrSettings: QrSettings;
  logoBase64: string | null;
  imageExtension: string;

  backgroundDataUrl?: string | null;
  backgroundOverlayColor?: string;
  backgroundOverlayAlpha?: number;

  onProgress?: (params: {
    done: number;
    total: number;
    errors: number;
    statusText: string;
  }) => void;
};

const YIELD_EVERY = 50;

const yieldToMainThread = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const escapeCsv = (value: string | number) => {
  const v = String(value ?? "");
  const needsQuotes = /[;"\n\r]/.test(v);
  const escaped = v.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
};

const buildGenerationErrorsCsv = (errors: RegistryGenerationError[]) => {
  const header = ["lineNumber", "fileName", "message"].join(";");
  const rows = errors.map((e) =>
    [e.lineNumber, e.fileName || "", e.message].map(escapeCsv).join(";"),
  );
  return [header, ...rows].join("\n");
};

export async function generateQrZipWithProgress({
  rows,
  qrSettings,
  logoBase64,
  imageExtension,
  backgroundDataUrl = null,
  backgroundOverlayColor,
  backgroundOverlayAlpha = 0,
  onProgress,
}: GenerateQrZipWithProgressParams): Promise<{
  zip: Blob;
  total: number;
  done: number;
  errors: number;
  generationErrors: RegistryGenerationError[];
}> {
  const total = rows.length;

  const files: InputWithSizeMeta[] = [];
  const generationErrors: RegistryGenerationError[] = [];

  const safeZoneEnabled = Boolean(qrSettings.hasSafeZone);
  const safeZoneMargin = safeZoneEnabled ? Number(qrSettings.safeZoneSizePx || 0) : 0;
  const safeZoneFill = safeZoneEnabled ? String(qrSettings.safeZoneColor || "#FFFFFF") : "";
  const innerFill = String(qrSettings.backgroundColor || "#FFFFFF");

  const shouldForceTransparentBg = Boolean(backgroundDataUrl) || safeZoneEnabled;

  for (let index = 0; index < rows.length; index += 1) {
    const lineNumber = index + 1;
    const [fileName, data] = rows[index];

    try {
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

      // Собираем фон в итоговом SVG:
      // 1) baseFill на всю область (это safe zone)
      // 2) innerFill внутри safe zone
      // 3) bg image внутри safe zone (если есть)
      // 4) overlay внутри safe zone (если есть)
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
        // фон под подписью — это текущий backgroundColor
        backgroundColor: innerFill,
        sizePx: qrSettings.sizePx,
      });

      files.push({
        input: new Blob([svgWithSignature], { type: "image/svg+xml;charset=utf-8" }),
        name: `${fileName}.${imageExtension}`,
      });
    } catch (e) {
      const message = (e as Error)?.message || "Неизвестная ошибка генерации";
      generationErrors.push({
        lineNumber,
        fileName: String(fileName ?? ""),
        message,
      });
    }

    const done = index + 1;
    const errors = generationErrors.length;

    onProgress?.({
      done,
      total,
      errors,
      statusText: errors ? `Генерация… Ошибок: ${errors}` : "Генерация…",
    });

    if (done % YIELD_EVERY === 0) {
      await yieldToMainThread();
    }
  }

  if (generationErrors.length > 0) {
    const csv = buildGenerationErrorsCsv(generationErrors);
    files.push({
      input: new Blob([csv], { type: "text/csv;charset=utf-8" }),
      name: `generation_errors_${new Date().toISOString().slice(0, 19)}.csv`,
    });
  }

  const zip = await downloadZip(files).blob();

  return {
    zip,
    total,
    done: total,
    errors: generationErrors.length,
    generationErrors,
  };
}
