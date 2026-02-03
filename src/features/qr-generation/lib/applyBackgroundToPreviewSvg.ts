const SVG_NS = "http://www.w3.org/2000/svg";

const BG_LAYER_ID = "qr-bg-layer";
const BG_IMAGE_ID = "qr-bg-image";
const BG_OVERLAY_ID = "qr-bg-overlay";

export const applyBackgroundToPreviewSvg = (params: {
  container: HTMLDivElement;
  bgDataUrl: string | null;
  sizePx: number;
  marginPx: number;
  overlayColor?: string;
  overlayAlpha?: number;
}) => {
  const {
    container,
    bgDataUrl,
    sizePx,
    marginPx,
    overlayColor,
    overlayAlpha,
  } = params;

  const svg = container.querySelector("svg");
  if (!svg) return;

  // --- svg (чтобы не было "сжатия" и baseline-gap)
  (svg as SVGElement).style.display = "block";
  (svg as SVGElement).style.width = "100%";
  (svg as SVGElement).style.height = "100%";

  const existingLayer = svg.querySelector<SVGGElement>(`#${BG_LAYER_ID}`);
  if (existingLayer) existingLayer.remove();

  const hasImage = Boolean(bgDataUrl);
  const hasOverlay =
    Boolean((overlayColor || "").trim()) &&
    typeof overlayAlpha === "number" &&
    overlayAlpha > 0;

  if (!hasImage && !hasOverlay) return;

  const m = Math.max(0, marginPx);
  const x = m;
  const y = m;
  const w = Math.max(0, sizePx - m * 2);
  const h = Math.max(0, sizePx - m * 2);

  const layer = document.createElementNS(SVG_NS, "g");
  layer.setAttribute("id", BG_LAYER_ID);

  // 1) image
  if (bgDataUrl) {
    const image = document.createElementNS(SVG_NS, "image");
    image.setAttribute("id", BG_IMAGE_ID);

    image.setAttribute("href", bgDataUrl);
    image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", bgDataUrl);

    image.setAttribute("x", String(x));
    image.setAttribute("y", String(y));
    image.setAttribute("width", String(w));
    image.setAttribute("height", String(h));
    image.setAttribute("preserveAspectRatio", "xMidYMid slice");

    layer.appendChild(image);
  }

  // 2) overlay rect (над картинкой, но под QR)
  if (hasOverlay) {
    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("id", BG_OVERLAY_ID);

    rect.setAttribute("x", String(x));
    rect.setAttribute("y", String(y));
    rect.setAttribute("width", String(w));
    rect.setAttribute("height", String(h));

    rect.setAttribute("fill", (overlayColor || "").trim());
    rect.setAttribute("opacity", String(Math.min(1, Math.max(0, overlayAlpha!))));

    layer.appendChild(rect);
  }

  // вставляем слой в начало, но после defs (если defs есть)
  const defs = svg.querySelector("defs");
  if (defs && defs.nextSibling) {
    svg.insertBefore(layer, defs.nextSibling);
  } else if (defs) {
    svg.appendChild(layer);
  } else {
    svg.insertBefore(layer, svg.firstChild);
  }
};
