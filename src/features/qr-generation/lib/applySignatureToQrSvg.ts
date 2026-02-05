type ApplySignatureToQrSvgParams = {
  isEnabled: boolean;
  text: string;
  borderColor: string;
  backgroundColor: string;
  sizePx: number;
};

const SVG_NS = "http://www.w3.org/2000/svg";

const parseViewBox = (viewBox: string | null) => {
  if (!viewBox) return null;

  const parts = viewBox.trim().split(/\s+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return null;

  const [minX, minY, width, height] = parts;
  return { minX, minY, width, height };
};

const getSvgMetrics = (svg: SVGSVGElement, fallbackSizePx: number) => {
  const vb = parseViewBox(svg.getAttribute("viewBox"));

  const vbMinX = vb?.minX ?? 0;
  const vbMinY = vb?.minY ?? 0;
  const vbW = vb?.width ?? fallbackSizePx;
  const vbH = vb?.height ?? fallbackSizePx;

  return { vbMinX, vbMinY, vbW, vbH };
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const scaleFromPreview = (sizePx: number, valueAt400: number) =>
  Math.round((sizePx * valueAt400) / 400);

const normalizeText = (value: string) =>
  String(value || "")
    .replace(/\r\n/g, "\n")
    .trim();

const splitByManualLines = (value: string) =>
  normalizeText(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const splitWords = (value: string) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

const createTextMeasurer = (fontCss: string) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.font = fontCss;

  return {
    measure: (text: string) => ctx.measureText(text).width,
  };
};

const sliceLongWordByWidth = (params: {
  word: string;
  maxWidthPx: number;
  measureWidth: (value: string) => number;
}) => {
  const { word, maxWidthPx, measureWidth } = params;

  const chunks: string[] = [];
  let current = "";

  for (const char of word) {
    const next = current + char;

    if (measureWidth(next) <= maxWidthPx || current.length === 0) {
      current = next;
      continue;
    }

    chunks.push(current);
    current = char;
  }

  if (current) chunks.push(current);
  return chunks;
};

const wrapTextByWidthPx = (params: {
  text: string;
  maxWidthPx: number;
  fontCss: string;
}) => {
  const { text, maxWidthPx, fontCss } = params;

  const manualLines = splitByManualLines(text);
  if (!manualLines.length) return [];

  const measurer = createTextMeasurer(fontCss);

  // если canvas недоступен — не ломаем генерацию, просто одна строка
  if (!measurer) {
    return [manualLines.join(" ")].filter(Boolean);
  }

  const measureWidth = (value: string) => measurer.measure(value);

  const result: string[] = [];

  for (const manualLine of manualLines) {
    const words = splitWords(manualLine);
    if (!words.length) continue;

    let currentLine = "";

    const pushLine = () => {
      if (currentLine.trim()) result.push(currentLine.trim());
      currentLine = "";
    };

    for (const word of words) {
      // word-break: break-word
      if (measureWidth(word) > maxWidthPx) {
        pushLine();

        const parts = sliceLongWordByWidth({
          word,
          maxWidthPx,
          measureWidth,
        });

        for (const part of parts) {
          if (!part) continue;
          result.push(part);
        }

        continue;
      }

      if (!currentLine) {
        currentLine = word;
        continue;
      }

      const candidate = `${currentLine} ${word}`;

      if (measureWidth(candidate) <= maxWidthPx) {
        currentLine = candidate;
      } else {
        pushLine();
        currentLine = word;
      }
    }

    pushLine();
  }

  return result;
};

type SignatureLayout = {
  lines: string[];
  fontSizePx: number;
  lineHeightPx: number;
  paddingTopPx: number;
  paddingBottomPx: number;
  paddingXPx: number;
  signatureHeightPx: number;
  radiusPx: number;
};

const buildSignatureLayout = (params: {
  sizePx: number;
  text: string;
}) => {
  const { sizePx, text } = params;

  // как в превью, но масштабируется под экспорт
  let fontSizePx = Math.max(10, scaleFromPreview(sizePx, 48));
  let paddingTopPx = Math.max(0, scaleFromPreview(sizePx, 18));
  let paddingBottomPx = Math.max(0, scaleFromPreview(sizePx, 22));
  let paddingXPx = Math.max(0, scaleFromPreview(sizePx, 18));
  const radiusPx = Math.max(0, scaleFromPreview(sizePx, 10));

  // ограничение, чтобы подпись не занимала пол-qr на длинных текстах
  const maxSignatureHeightPx = Math.round(sizePx * 0.35);

  const upperText = String(text || "").trim().toUpperCase();

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const lineHeightPx = Math.round(fontSizePx * 1.05);
    const availableWidthPx = Math.max(1, sizePx - paddingXPx * 2);

    const fontCss = `600 ${fontSizePx}px Inter, sans-serif`;

    const lines = wrapTextByWidthPx({
      text: upperText,
      maxWidthPx: availableWidthPx,
      fontCss,
    });

    const textBlockHeightPx = lines.length * lineHeightPx;
    const signatureHeightPx = paddingTopPx + textBlockHeightPx + paddingBottomPx;

    if (signatureHeightPx <= maxSignatureHeightPx) {
      return {
        lines,
        fontSizePx,
        lineHeightPx,
        paddingTopPx,
        paddingBottomPx,
        paddingXPx,
        signatureHeightPx,
        radiusPx,
      } satisfies SignatureLayout;
    }

    // уменьшаем шрифт, чтобы блок подписи влезал
    // паддинги тоже слегка подтягиваем, чтобы сохранялась пропорция
    const nextFontSize = Math.floor(fontSizePx * 0.9);
    if (nextFontSize >= fontSizePx) break;
    fontSizePx = clamp(nextFontSize, 12, fontSizePx);

    paddingTopPx = Math.max(0, Math.floor(paddingTopPx * 0.92));
    paddingBottomPx = Math.max(0, Math.floor(paddingBottomPx * 0.92));
    paddingXPx = Math.max(0, Math.floor(paddingXPx * 0.92));
  }

  // fallback: что получилось
  const lineHeightPx = Math.round(fontSizePx * 1.05);
  const availableWidthPx = Math.max(1, sizePx - paddingXPx * 2);
  const fontCss = `600 ${fontSizePx}px Inter, sans-serif`;

  const lines = wrapTextByWidthPx({
    text: upperText,
    maxWidthPx: availableWidthPx,
    fontCss,
  });

  const textBlockHeightPx = lines.length * lineHeightPx;
  const signatureHeightPx = paddingTopPx + textBlockHeightPx + paddingBottomPx;

  return {
    lines,
    fontSizePx,
    lineHeightPx,
    paddingTopPx,
    paddingBottomPx,
    paddingXPx,
    signatureHeightPx,
    radiusPx,
  } satisfies SignatureLayout;
};

export const applySignatureToQrSvg = (
  svgText: string,
  params: ApplySignatureToQrSvgParams,
) => {
  if (!params.isEnabled) return svgText;

  const signatureText = String(params.text || "").trim();
  if (!signatureText) return svgText;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  if (doc.querySelector("parsererror")) return svgText;

  const originalSvg = doc.querySelector("svg") as SVGSVGElement | null;
  if (!originalSvg) return svgText;

  const { vbMinX, vbMinY, vbW, vbH } = getSvgMetrics(originalSvg, params.sizePx);

  const pxPerUnit = vbW > 0 ? params.sizePx / vbW : 1;
  const pxToUnits = (px: number) => (pxPerUnit ? px / pxPerUnit : px);

  const layout = buildSignatureLayout({
    sizePx: params.sizePx,
    text: signatureText,
  });

  if (!layout.lines.length) return svgText;

  const fontSize = pxToUnits(layout.fontSizePx);
  const lineHeight = pxToUnits(layout.lineHeightPx);
  const paddingTop = pxToUnits(layout.paddingTopPx);
  const paddingBottom = pxToUnits(layout.paddingBottomPx);
  const signatureHeight = pxToUnits(layout.signatureHeightPx);
  const radius = pxToUnits(layout.radiusPx);

  const newVbH = vbH + signatureHeight;

  const outWidthPx = params.sizePx;
  const outHeightPx = Math.round(params.sizePx + layout.signatureHeightPx);

  const safeBorderColor = (params.borderColor || "#000000").trim();

  const outDoc = document.implementation.createDocument(SVG_NS, "svg", null);
  const outSvg = outDoc.documentElement as unknown as SVGSVGElement;

  outSvg.setAttribute("xmlns", SVG_NS);
  outSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  outSvg.setAttribute("width", String(outWidthPx));
  outSvg.setAttribute("height", String(outHeightPx));
  outSvg.setAttribute("viewBox", `${vbMinX} ${vbMinY} ${vbW} ${newVbH}`);

  // clip для скругления всей карточки
  const defs = outDoc.createElementNS(SVG_NS, "defs");
  const clipPath = outDoc.createElementNS(SVG_NS, "clipPath");
  const clipId = `clip_${Math.random().toString(16).slice(2)}`;

  clipPath.setAttribute("id", clipId);
  clipPath.setAttribute("clipPathUnits", "userSpaceOnUse");

  const clipRect = outDoc.createElementNS(SVG_NS, "rect");
  clipRect.setAttribute("x", String(vbMinX));
  clipRect.setAttribute("y", String(vbMinY));
  clipRect.setAttribute("width", String(vbW));
  clipRect.setAttribute("height", String(newVbH));
  clipRect.setAttribute("rx", String(radius));
  clipRect.setAttribute("ry", String(radius));

  clipPath.appendChild(clipRect);
  defs.appendChild(clipPath);
  outSvg.appendChild(defs);

  const content = outDoc.createElementNS(SVG_NS, "g");
  content.setAttribute("clip-path", `url(#${clipId})`);
  outSvg.appendChild(content);

  // 1) QR
  const qrGroup = outDoc.createElementNS(SVG_NS, "g");
  Array.from(originalSvg.childNodes).forEach((node) => {
    qrGroup.appendChild(outDoc.importNode(node, true));
  });
  content.appendChild(qrGroup);

  // 2) фон подписи
  const signBg = outDoc.createElementNS(SVG_NS, "rect");
  signBg.setAttribute("x", String(vbMinX));
  signBg.setAttribute("y", String(vbMinY + vbH));
  signBg.setAttribute("width", String(vbW));
  signBg.setAttribute("height", String(signatureHeight));
  signBg.setAttribute("fill", safeBorderColor);
  content.appendChild(signBg);

  // 3) текст
  const text = outDoc.createElementNS(SVG_NS, "text");
  const centerX = vbMinX + vbW / 2;

  text.setAttribute("x", String(centerX));
  text.setAttribute("fill", "#FFFFFF");
  text.setAttribute("font-family", "Inter, sans-serif");
  text.setAttribute("font-weight", "600");
  text.setAttribute("font-size", String(fontSize));
  text.setAttribute("text-anchor", "middle");

  // вертикальное центрирование
  const availableH = Math.max(0, signatureHeight - paddingTop - paddingBottom);
  const textBlockH = layout.lines.length * lineHeight;
  const offsetTop = Math.max(0, (availableH - textBlockH) / 2);

  const firstBaselineY = vbMinY + vbH + paddingTop + offsetTop + fontSize;

  layout.lines.forEach((line, index) => {
    const tspan = outDoc.createElementNS(SVG_NS, "tspan");
    tspan.setAttribute("x", String(centerX));

    if (index === 0) {
      tspan.setAttribute("y", String(firstBaselineY));
    } else {
      tspan.setAttribute("dy", String(lineHeight));
    }

    tspan.textContent = line;
    text.appendChild(tspan);
  });

  content.appendChild(text);

  return new XMLSerializer().serializeToString(outSvg);
};
