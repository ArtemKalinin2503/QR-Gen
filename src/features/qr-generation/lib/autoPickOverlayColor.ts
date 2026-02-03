const srgbToLinear = (c: number) => {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
};

const luminanceFromRgb = (r: number, g: number, b: number) => {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

const parseHex = (hex: string) => {
  const s = hex.replace("#", "").trim();
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
        if (a < 0.05) continue; // почти прозрачные пиксели игнорируем

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
 * Возвращает цвет overlay (без альфы), альфа у нас константа OVERLAY_ALPHA.
 * Идея: если фон темнее — делаем белый overlay, если фон светлее — чёрный overlay.
 */
export async function autoPickOverlayColor(params: {
  bgDataUrl: string;
  qrHexColor: string; // цвет модулей (dots), можно брать самый "важный"
  minContrast?: number; // WCAG 4.5
}): Promise<string | null> {
  const { bgDataUrl, qrHexColor, minContrast = 4.5 } = params;

  const avgBgL = await getAverageImageLuminance(bgDataUrl);
  if (avgBgL === null) return null;

  const { r, g, b } = parseHex(qrHexColor || "#000000");
  const qrL = luminanceFromRgb(r, g, b);

  const white = 1.0; // luminance white
  const black = 0.0; // luminance black

  // при белом overlay итоговый фон станет "светлее" картинки
  // при чёрном overlay итоговый фон станет "темнее"
  // Мы не считаем точный итог (т.к. альфа фиксированная и картинка разная),
  // но выбираем направление, которое повышает контраст.

  const contrastIfWhite = contrastRatio(white, qrL);
  const contrastIfBlack = contrastRatio(black, qrL);

  // Если QR тёмный (обычно), чаще нужен светлый overlay.
  // Выбираем тот, что даёт потенциально лучший контраст и проходит порог.
  const pickWhite = contrastIfWhite >= contrastIfBlack;

  // если средний фон уже светлый — смысла белить мало, лучше слегка затемнить
  if (avgBgL > 0.7) return "#000000";
  if (avgBgL < 0.3) return "#FFFFFF";

  const candidate = pickWhite ? "#FFFFFF" : "#000000";

  // Если кандидат явно не проходит WCAG в принципе — всё равно вернём лучший
  // (потому что QR может быть светлым/экзотичным)
  const candL = candidate === "#FFFFFF" ? 1 : 0;
  const ok = contrastRatio(candL, qrL) >= minContrast;

  return ok ? candidate : (contrastIfWhite > contrastIfBlack ? "#FFFFFF" : "#000000");
}
