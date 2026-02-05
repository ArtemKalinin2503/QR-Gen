const srgbToLinear = (c: number) => {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
};

const linearToSrgb = (x: number) => {
  const v = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, v)) * 255);
};

const luminanceFromRgb = (r: number, g: number, b: number) => {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

const parseHex = (hex: string) => {
  const s = String(hex || "").replace("#", "").trim();

  if (s.length === 3) {
    const r = parseInt(s[0] + s[0], 16);
    const g = parseInt(s[1] + s[1], 16);
    const b = parseInt(s[2] + s[2], 16);
    return { r, g, b };
  }

  if (s.length === 6) {
    const r = parseInt(s.slice(0, 2), 16);
    const g = parseInt(s.slice(2, 4), 16);
    const b = parseInt(s.slice(4, 6), 16);
    return { r, g, b };
  }

  return { r: 0, g: 0, b: 0 };
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const toGrayHexFromLuminance = (luminance: number) => {
  // Для серого R=G=B, а luminance = linear(gray)
  const linear = clamp01(luminance);
  const srgb = linearToSrgb(linear);

  const hex = srgb.toString(16).padStart(2, "0").toUpperCase();
  return `#${hex}${hex}${hex}`;
};

const contrastRatio = (L1: number, L2: number) => {
  const a = Math.max(L1, L2);
  const b = Math.min(L1, L2);
  return (a + 0.05) / (b + 0.05);
};

// Берём среднюю luminance картинки (быстро: downscale до 64x64)
async function getAverageImageLuminance(dataUrl: string): Promise<number | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);

      ctx.drawImage(img, 0, 0, size, size);

      const { data } = ctx.getImageData(0, 0, size, size);

      let sum = 0;
      let count = 0;

      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3] / 255;
        if (a < 0.05) continue;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        sum += luminanceFromRgb(r, g, b);
        count += 1;
      }

      resolve(count ? sum / count : null);
    };

    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

/**
 * Автоподбор цвета оверлея (overlayColor), чтобы итоговый фон под QR
 * (картинка + overlayAlpha) имел контраст с цветом модулей QR >= minContrast.
 *
 * Возвращаем HEX без альфы. Альфа задаётся отдельно (в UI/экспорте).
 *
 * Важное:
 * - Текущий подход подбирает СЕРЫЙ оттенок (достаточно для контраста).
 * - Если при заданной alpha добиться порога невозможно — вернём ближайший вариант.
 */
export async function autoPickOverlayColor(params: {
  bgDataUrl: string;
  qrHexColor: string;
  overlayAlpha: number;
  minContrast?: number; // WCAG 4.5
}): Promise<string | null> {
  const { bgDataUrl, qrHexColor, overlayAlpha, minContrast = 4.5 } = params;

  const avgBgL = await getAverageImageLuminance(bgDataUrl);
  if (avgBgL === null) return null;

  const { r, g, b } = parseHex(qrHexColor || "#000000");
  const qrL = luminanceFromRgb(r, g, b);

  const alpha = clamp01(typeof overlayAlpha === "number" ? overlayAlpha : 0);
  if (alpha <= 0) return null;

  // Хотим подобрать Lresult так, чтобы contrast(Lresult, qrL) >= minContrast.
  // Если QR темнее (обычно), то Lresult должен быть достаточно светлым:
  // (Lresult + 0.05) / (qrL + 0.05) >= minContrast  =>  Lresult >= minContrast*(qrL+0.05) - 0.05
  //
  // Если QR светлее (редкий кейс), то наоборот:
  // (qrL + 0.05) / (Lresult + 0.05) >= minContrast  =>  Lresult <= (qrL+0.05)/minContrast - 0.05
  const qrIsDarker = qrL <= avgBgL;

  let targetResultL = 0;

  if (qrIsDarker) {
    targetResultL = minContrast * (qrL + 0.05) - 0.05;
    targetResultL = clamp01(targetResultL);
  } else {
    targetResultL = (qrL + 0.05) / minContrast - 0.05;
    targetResultL = clamp01(targetResultL);
  }

  // Теперь хотим, чтобы итоговый фон после наложения:
  // Lresult = (1 - alpha) * Lbg + alpha * Loverlay
  // => Loverlay = (Lresult - (1 - alpha) * Lbg) / alpha
  const overlayL = (targetResultL - (1 - alpha) * avgBgL) / alpha;

  // Кламп — это "best effort", если достичь порога при заданной alpha нельзя
  const clampedOverlayL = clamp01(overlayL);

  const resultHex = toGrayHexFromLuminance(clampedOverlayL);

  // Если даже после клампа контраст не дотянули — это значит alpha маловат для этой картинки.
  // Возвращаем всё равно лучший из возможных при текущих ограничениях.
  const bestPossibleResultL = clamp01((1 - alpha) * avgBgL + alpha * clampedOverlayL);

  const ok = contrastRatio(bestPossibleResultL, qrL) >= minContrast;
  return ok ? resultHex : resultHex;
}
