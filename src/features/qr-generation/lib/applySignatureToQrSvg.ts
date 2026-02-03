const SVG_NS = "http://www.w3.org/2000/svg";

const parseViewBox = (viewBox: string | null) => {
  if (!viewBox) return null;

  const parts = viewBox.trim().split(/\s+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return null;

  const [minX, minY, width, height] = parts;
  return { minX, minY, width, height };
};

const splitTextToLines = (text: string, maxCharsPerLine: number) => {
  const safeText = text.trim();
  if (!safeText) return [];

  const words = safeText.split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
      continue;
    }

    const next = `${currentLine} ${word}`;
    if (next.length <= maxCharsPerLine) {
      currentLine = next;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;
  }

  if (currentLine) lines.push(currentLine);
  return lines;
};

export const applySignatureToQrSvg = (
  svgText: string,
  params: {
    isEnabled: boolean;
    text: string;
    borderColor: string; // цвет рамки (и фон подписи)
    backgroundColor: string; 
    sizePx: number;
  },
): string => {
  if (!params.isEnabled) return svgText;

  const signatureText = (params.text || "").trim();
  if (!signatureText) return svgText;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  if (doc.querySelector("parsererror")) return svgText;

  const originalSvg = doc.querySelector("svg");
  if (!originalSvg) return svgText;

  const vb = parseViewBox(originalSvg.getAttribute("viewBox"));
  const wAttr = originalSvg.getAttribute("width");
  const hAttr = originalSvg.getAttribute("height");

  const vbMinX = vb?.minX ?? 0;
  const vbMinY = vb?.minY ?? 0;

  const vbWidth =
    vb?.width ??
    (wAttr && Number.isFinite(Number(wAttr)) ? Number(wAttr) : params.sizePx);

  const vbHeight =
    vb?.height ??
    (hAttr && Number.isFinite(Number(hAttr)) ? Number(hAttr) : params.sizePx);

  // пропорции как в превью (400px)
  const fontSize = Math.round((params.sizePx * 48) / 400);
  const signatureHeight = Math.round((params.sizePx * 140) / 400);

  const paddingX = Math.round((params.sizePx * 24) / 400);
  const paddingY = Math.round((params.sizePx * 18) / 400);

  // рамка как в UI
  const borderWidth = Math.max(1, Math.round((params.sizePx * 3) / 400));
  const radius = Math.round((params.sizePx * 10) / 400);

  const totalWidth = vbWidth + borderWidth * 2;
  const totalHeight = vbHeight + signatureHeight + borderWidth * 2;

  const wrapper = doc.createElementNS(SVG_NS, "svg");
  wrapper.setAttribute("xmlns", SVG_NS);
  wrapper.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  // итоговый size: QR-size + подпись, как “карточка”
  wrapper.setAttribute("width", String(params.sizePx));
  wrapper.setAttribute("height", String(params.sizePx + signatureHeight));
  wrapper.setAttribute(
    "viewBox",
    `${vbMinX} ${vbMinY} ${totalWidth} ${totalHeight}`,
  );

  const safeBorderColor = (params.borderColor || "#000000").trim();
  const safeBgColor = (params.backgroundColor || "#FFFFFF").trim();

  // OUTER FRAME (заливка рамкой, как в UI)
  const frame = doc.createElementNS(SVG_NS, "rect");
  frame.setAttribute("x", String(vbMinX));
  frame.setAttribute("y", String(vbMinY));
  frame.setAttribute("width", String(totalWidth));
  frame.setAttribute("height", String(totalHeight));
  frame.setAttribute("fill", safeBorderColor);
  frame.setAttribute("rx", String(radius));
  frame.setAttribute("ry", String(radius));
  wrapper.appendChild(frame);

  // CLIP (аналог overflow:hidden)
  const clipId = `qr_clip_${Math.random().toString(16).slice(2)}`;

  const defs = doc.createElementNS(SVG_NS, "defs");
  const clipPath = doc.createElementNS(SVG_NS, "clipPath");
  clipPath.setAttribute("id", clipId);

  const clipRect = doc.createElementNS(SVG_NS, "rect");
  clipRect.setAttribute("x", String(vbMinX + borderWidth));
  clipRect.setAttribute("y", String(vbMinY + borderWidth));
  clipRect.setAttribute("width", String(Math.max(0, totalWidth - borderWidth * 2)));
  clipRect.setAttribute("height", String(Math.max(0, totalHeight - borderWidth * 2)));
  clipRect.setAttribute("rx", String(Math.max(0, radius - borderWidth)));
  clipRect.setAttribute("ry", String(Math.max(0, radius - borderWidth)));

  clipPath.appendChild(clipRect);
  defs.appendChild(clipPath);
  wrapper.appendChild(defs);

  const content = doc.createElementNS(SVG_NS, "g");
  content.setAttribute("clip-path", `url(#${clipId})`);
  wrapper.appendChild(content);

  // Внутренний фон QR-области (на случай, если SVG QR прозрачный)
  const innerBg = doc.createElementNS(SVG_NS, "rect");
  innerBg.setAttribute("x", String(vbMinX + borderWidth));
  innerBg.setAttribute("y", String(vbMinY + borderWidth));
  innerBg.setAttribute("width", String(vbWidth));
  innerBg.setAttribute("height", String(vbHeight));
  innerBg.setAttribute("fill", safeBgColor);
  content.appendChild(innerBg);

  // QR-контент (переносим как есть) с offset = borderWidth
  const gQr = doc.createElementNS(SVG_NS, "g");
  gQr.setAttribute("transform", `translate(${borderWidth}, ${borderWidth})`);
  Array.from(originalSvg.childNodes).forEach((node) => {
    gQr.appendChild(node.cloneNode(true));
  });
  content.appendChild(gQr);

  const signBg = doc.createElementNS(SVG_NS, "rect");
  signBg.setAttribute("x", String(vbMinX + borderWidth));
  signBg.setAttribute("y", String(vbMinY + borderWidth + vbHeight));
  signBg.setAttribute("width", String(vbWidth));
  signBg.setAttribute("height", String(signatureHeight));
  signBg.setAttribute("fill", safeBorderColor);
  content.appendChild(signBg);

  // перенос строк
  const availableWidth = vbWidth - paddingX * 2;
  const approxCharWidth = fontSize * 0.62;
  const maxCharsPerLine = Math.max(6, Math.floor(availableWidth / approxCharWidth));
  const lines = splitTextToLines(signatureText.toUpperCase(), maxCharsPerLine);

  const lineHeight = Math.round(fontSize * 1.05);
  const textBlockHeight = (lines.length || 1) * lineHeight;

  const textStartY =
    vbMinY +
    borderWidth +
    vbHeight +
    Math.max(paddingY, Math.floor((signatureHeight - textBlockHeight) / 2)) +
    fontSize;

  const textCenterX = vbMinX + borderWidth + vbWidth / 2;

  lines.forEach((line, index) => {
    const t = doc.createElementNS(SVG_NS, "text");
    t.setAttribute("x", String(textCenterX));
    t.setAttribute("y", String(textStartY + index * lineHeight));
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("fill", "#FFFFFF");
    t.setAttribute("font-family", "Inter, sans-serif");
    t.setAttribute("font-weight", "600");
    t.setAttribute("font-size", String(fontSize));
    t.textContent = line;
    content.appendChild(t);
  });

  return new XMLSerializer().serializeToString(wrapper);
};
