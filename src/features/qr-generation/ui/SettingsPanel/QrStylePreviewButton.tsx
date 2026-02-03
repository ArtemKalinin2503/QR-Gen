import { useEffect, useMemo, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import type { Options } from "qr-code-styling";

type QrStylePreviewButtonProps = {
  isActive: boolean;
  onClick: () => void;
  options: Options;
};

const PREVIEW_SIZE = 44;
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
    qrCode.append(containerRef.current);

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
        "relative h-[44px] w-[44px] overflow-hidden rounded-[8px] bg-white",
        // рамка + ховер + фокус
        isActive
          ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-white"
          : "ring-1 ring-[#9283C0] ring-offset-2 ring-offset-white hover:ring-brand-400",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        "transition-[box-shadow] duration-150",
      ].join(" ")}
    >
      <div ref={containerRef} className="h-full w-full" />
    </button>
  );
};
