const SVG_NS = "http://www.w3.org/2000/svg";

const parseViewBox = (viewBox: string | null) => {
  if (!viewBox) return null;

  const parts = viewBox.trim().split(/\s+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return null;

  const [minX, minY, width, height] = parts;
  return { minX, minY, width, height };
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const applyBackgroundToQrSvg = (
  qrSvgText: string,
  bgDataUrl: string | null,
  params?: {
    marginPx?: number;      // safe-zone margin (в пикселях svg)
    baseFill?: string;      // safe-zone color (на весь холст)
    innerFill?: string;     // фон внутри safe-zone
    overlayColor?: string;  // overlay поверх картинки
    overlayAlpha?: number;  // 0..1
  },
): string => {
  const baseFill = (params?.baseFill || "").trim();
  const innerFill = (params?.innerFill || "").trim();
  const overlayColor = (params?.overlayColor || "").trim();
  const overlayAlpha =
    typeof params?.overlayAlpha === "number" ? clamp01(params.overlayAlpha) : 0;

  const hasImage = Boolean(bgDataUrl);
  const hasOverlay = Boolean(overlayColor) && overlayAlpha > 0;
  const hasBaseFill = Boolean(baseFill);
  const hasInnerFill = Boolean(innerFill);

  if (!hasImage && !hasOverlay && !hasBaseFill && !hasInnerFill) return qrSvgText;

  const parser = new DOMParser();
  const doc = parser.parseFromString(qrSvgText, "image/svg+xml");
  if (doc.querySelector("parsererror")) return qrSvgText;

  const originalSvg = doc.querySelector("svg");
  if (!originalSvg) return qrSvgText;

  const vb = parseViewBox(originalSvg.getAttribute("viewBox"));
  const wAttr = originalSvg.getAttribute("width");
  const hAttr = originalSvg.getAttribute("height");

  const vbMinX = vb?.minX ?? 0;
  const vbMinY = vb?.minY ?? 0;

  const vbWidth =
    vb?.width ??
    (wAttr && Number.isFinite(Number(wAttr)) ? Number(wAttr) : 1000);

  const vbHeight =
    vb?.height ??
    (hAttr && Number.isFinite(Number(hAttr)) ? Number(hAttr) : 1000);

  const m = Math.max(0, Number(params?.marginPx ?? 0));

  const wrapper = doc.createElementNS(SVG_NS, "svg");
  wrapper.setAttribute("xmlns", SVG_NS);
  wrapper.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  if (wAttr) wrapper.setAttribute("width", wAttr);
  if (hAttr) wrapper.setAttribute("height", hAttr);

  if (vb) {
    wrapper.setAttribute("viewBox", `${vb.minX} ${vb.minY} ${vb.width} ${vb.height}`);
  } else {
    const originalViewBox = originalSvg.getAttribute("viewBox");
    if (originalViewBox) wrapper.setAttribute("viewBox", originalViewBox);
  }

  // 0) BASE FILL (охранная зона) — на всю область
  if (hasBaseFill) {
    const base = doc.createElementNS(SVG_NS, "rect");
    base.setAttribute("x", String(vbMinX));
    base.setAttribute("y", String(vbMinY));
    base.setAttribute("width", String(vbWidth));
    base.setAttribute("height", String(vbHeight));
    base.setAttribute("fill", baseFill);
    wrapper.appendChild(base);
  }

  // INNER FILL — фон внутри safe-zone (над baseFill)
  if (hasInnerFill) {
    const inner = doc.createElementNS(SVG_NS, "rect");
    inner.setAttribute("x", String(vbMinX + m));
    inner.setAttribute("y", String(vbMinY + m));
    inner.setAttribute("width", String(Math.max(0, vbWidth - m * 2)));
    inner.setAttribute("height", String(Math.max(0, vbHeight - m * 2)));
    inner.setAttribute("fill", innerFill);
    wrapper.appendChild(inner);
  }

  // 1) background image — только внутри охранной зоны
  if (bgDataUrl) {
    const image = doc.createElementNS(SVG_NS, "image");
    image.setAttribute("href", bgDataUrl);
    image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", bgDataUrl);

    image.setAttribute("x", String(vbMinX + m));
    image.setAttribute("y", String(vbMinY + m));
    image.setAttribute("width", String(Math.max(0, vbWidth - m * 2)));
    image.setAttribute("height", String(Math.max(0, vbHeight - m * 2)));
    image.setAttribute("preserveAspectRatio", "xMidYMid slice");

    wrapper.appendChild(image);
  }

  // 2) overlay rect — тоже только внутри safe-zone
  if (hasOverlay) {
    const rect = doc.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", String(vbMinX + m));
    rect.setAttribute("y", String(vbMinY + m));
    rect.setAttribute("width", String(Math.max(0, vbWidth - m * 2)));
    rect.setAttribute("height", String(Math.max(0, vbHeight - m * 2)));
    rect.setAttribute("fill", overlayColor);
    rect.setAttribute("opacity", String(overlayAlpha));
    wrapper.appendChild(rect);
  }

  // 3) QR content (как есть)
  const g = doc.createElementNS(SVG_NS, "g");
  Array.from(originalSvg.childNodes).forEach((node) => {
    g.appendChild(node.cloneNode(true));
  });
  wrapper.appendChild(g);

  return new XMLSerializer().serializeToString(wrapper);
};
