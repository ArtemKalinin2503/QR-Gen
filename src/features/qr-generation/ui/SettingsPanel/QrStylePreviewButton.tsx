import { useEffect, useMemo, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import type { Options } from "qr-code-styling";

type QrStylePreviewButtonProps = {
  isActive: boolean;
  onClick: () => void;
  options: Options;
};

const BUTTON_SIZE = 50;
const PREVIEW_SIZE = 42;
const PREVIEW_DATA = "preview";

export const QrStylePreviewButton = ({
  isActive,
  onClick,
  options,
}: QrStylePreviewButtonProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);

  const mergedOptions = useMemo<Options>(
    () => ({
      width: PREVIEW_SIZE,
      height: PREVIEW_SIZE,
      type: "svg",
      data: PREVIEW_DATA,
      margin: 0,
      qrOptions: { errorCorrectionLevel: "M" },
      ...options,
    }),
    [options],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const qrCode = new QRCodeStyling(mergedOptions);

    qrInstanceRef.current = qrCode;
    containerRef.current.innerHTML = "";
    qrCode.append(containerRef.current);

    requestAnimationFrame(() => {
      const svg = containerRef.current?.querySelector("svg");
      if (!svg) return;

      svg.style.display = "block";
      svg.style.width = "100%";
      svg.style.height = "100%";
    });

    return () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = "";
      qrInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const qrCode = qrInstanceRef.current;
    if (!qrCode) return;

    qrCode.update(mergedOptions);
  }, [mergedOptions]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={[
        `h-[${BUTTON_SIZE}px] w-[${BUTTON_SIZE}px]`,
        "relative overflow-hidden rounded-[8px] bg-white p-[4px]",
        "border border-[#9283C0] hover:border-brand-400",
        isActive ? "ring-4 ring-brand-500" : "",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500",
        "transition-[border-color,box-shadow] duration-150",
      ].join(" ")}
    >
      <div ref={containerRef} className="h-full w-full" />
    </button>
  );
};
