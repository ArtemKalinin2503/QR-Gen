import React, { useEffect, useMemo, useRef, useState } from "react";
import { LinearProgress } from "@mui/material";
import QRCodeStyling from "qr-code-styling";
import { useShallow } from "zustand/react/shallow";

import type { GeneratorType } from "../model/types";
import { IconGenDownloadQr, IconResetParams } from "../../../shared/ui/icons";
import { generateQrCodes } from "../lib/generateQrCodes";
import { generateQrZipWithProgress } from "../lib/generateQrZipWithProgress";
import { useQrGeneratorStore } from "../../../store/qrGenerator.store";
import { buildQrCodeOptions } from "../lib/buildQrCodeOptions";

const IMAGE_EXTENSION = "svg";

const QR_COLOR = "#111827";
const BG_COLOR = "#FFFFFF";

// фон страницы под превью (когда не выбран фон-картинка)
const PAGE_BG_COLOR = "#F5F7FF";

export const OVERLAY_ALPHA = 0.35;
const UPDATE_DEBOUNCE_MS = 90;

type QrPreviewPanelProps = {
  generatorType: GeneratorType;
};

const downloadArchive = (file: Blob) => {
  const objectUrl = URL.createObjectURL(file);

  const link = document.createElement("a");
  link.href = objectUrl;

  const date = new Date().toJSON().split(".")[0];
  link.download = `qrcodes_${date}.zip`;

  link.click();
  link.remove();

  URL.revokeObjectURL(objectUrl);
};

const buildPreviewData = (
  generatorType: GeneratorType,
  dynamicFields: Record<string, unknown>,
) => {
  if (generatorType === "registry") return "";

  if (generatorType === "individual") return String(dynamicFields.url ?? "");
  if (generatorType === "text") return String(dynamicFields.text ?? "");

  if (generatorType === "email") {
    const email = String(dynamicFields.email ?? "");
    return email ? `mailto:${email}` : "";
  }

  if (generatorType === "businessCard") {
    const firstName = String(dynamicFields.firstName ?? "");
    const lastName = String(dynamicFields.lastName ?? "");
    const middleName = String(dynamicFields.middleName ?? "");
    const phone = String(dynamicFields.phone ?? "");
    const email = String(dynamicFields.email ?? "");
    const company = String(dynamicFields.company ?? "");
    const position = String(dynamicFields.position ?? "");

    const fullName = [lastName, firstName, middleName]
      .filter(Boolean)
      .join(" ")
      .trim();

    const nameParts = [lastName, firstName, middleName]
      .map((p) => p || "")
      .join(";");

    const vcardLines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${nameParts}`,
      fullName ? `FN:${fullName}` : "",
      company ? `ORG:${company}` : "",
      position ? `TITLE:${position}` : "",
      phone ? `TEL;TYPE=CELL:${phone}` : "",
      email ? `EMAIL:${email}` : "",
      "END:VCARD",
    ].filter(Boolean);

    return vcardLines.join("\n");
  }

  return "";
};

const getSquareSize = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const height = rect.height || rect.width;
  return Math.floor(Math.min(rect.width, height));
};

const getMinQuietZonePreviewPx = (previewSize: number) => {
  const approxModulePx = previewSize / 41;
  const minByModules = 4 * approxModulePx;
  const minByPercent = previewSize * 0.1;

  return Math.ceil(Math.max(minByModules, minByPercent));
};

export const QrPreviewPanel = ({ generatorType }: QrPreviewPanelProps) => {
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [progress, setProgress] = useState<{
    done: number;
    total: number;
    errors: number;
    statusText: string;
    isDone: boolean;
  } | null>(null);

  const [reportHint, setReportHint] = useState("");

  const rowsCount = useQrGeneratorStore((s) => s.registry.rowsCount);
  const registryPreviewData = useQrGeneratorStore(
    (s) => s.registry.rows[0]?.[1] ?? "",
  );

  const registryValidationErrorsCount = useQrGeneratorStore(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (s) => (s as any).registry?.validationErrors?.length ?? 0,
  );

  const resetQrSettings = useQrGeneratorStore((s) => s.resetQrSettings);

  const logoDataUrl = useQrGeneratorStore((s) => s.logo.dataUrl);
  const backgroundDataUrl = useQrGeneratorStore((s) => s.background.dataUrl);

  const dynamicFields = useQrGeneratorStore((s) => s.qrSettings.dynamicFields);

  // UI слой для оверлея (который тонирует background image)
  const overlayColor = useQrGeneratorStore((s) => s.qrSettings.backgroundColor);

  // подпись
  const signatureEnabled = useQrGeneratorStore((s) =>
    Boolean(s.qrSettings.signatureEnabled),
  );
  const signatureText = useQrGeneratorStore((s) =>
    String(s.qrSettings.signatureText ?? ""),
  );
  const signatureBorderColor = useQrGeneratorStore((s) =>
    String(s.qrSettings.signatureBorderColor ?? "#000000"),
  );

  // safe zone в превью (UI-слоем)
  const hasSafeZone = useQrGeneratorStore((s) => s.qrSettings.hasSafeZone);
  const safeZoneColor = useQrGeneratorStore((s) => s.qrSettings.safeZoneColor);
  const safeZoneSizePx = useQrGeneratorStore((s) => s.qrSettings.safeZoneSizePx);
  const sizePx = useQrGeneratorStore((s) => s.qrSettings.sizePx);

  const normalizedUrl = String(dynamicFields.url ?? "").trim();
  const normalizedText = String(dynamicFields.text ?? "").trim();
  const normalizedEmail = String(dynamicFields.email ?? "").trim();

  const hasAnyBusinessCardField = [
    dynamicFields.firstName,
    dynamicFields.lastName,
    dynamicFields.middleName,
    dynamicFields.phone,
    dynamicFields.email,
    dynamicFields.company,
    dynamicFields.position,
  ]
    .map((value) => String(value ?? "").trim())
    .some(Boolean);

  // размер превью — по контейнеру внутри рамки
  const previewHostRef = useRef<HTMLDivElement | null>(null);
  const [previewSizePx, setPreviewSizePx] = useState(400);

  useEffect(() => {
    const element = previewHostRef.current;
    if (!element) return;

    let rafId = 0;

    const updateSize = () => {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const nextSize = getSquareSize(element);

        // защита от временных значений (0 / маленьких), из-за которых превью “схлопывается”
        if (nextSize < 200) return;

        setPreviewSizePx((prev) => (prev === nextSize ? prev : nextSize));
      });
    };

    updateSize();

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(element);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  const previewScale = sizePx > 0 ? previewSizePx / sizePx : 0.4;

  // В превью показываем минимум зоны (чтобы это выглядело “заливкой”, а не линией)
  const safeZonePreviewPx = hasSafeZone
    ? Math.max(
        0,
        Math.round(safeZoneSizePx * previewScale),
        getMinQuietZonePreviewPx(previewSizePx),
      )
    : 0;

  // safe zone рисуем UI-слоем (inset), поэтому внутри QR margin выключаем
  const qrSettingsForQr = useQrGeneratorStore(
    useShallow((s) => {
      const q = s.qrSettings;
      const hasBgImage = Boolean(s.background.dataUrl);

      return {
        sizePx: q.sizePx,
        hasSafeZone: false,
        safeZoneColor: q.safeZoneColor,
        safeZoneSizePx: 0,

        lineThickness: q.lineThickness,
        verticalAlignmentScale: q.verticalAlignmentScale,
        horizontalAlignmentScale: q.horizontalAlignmentScale,

        dotsTypeMode: q.dotsTypeMode,
        dotsType: q.dotsType,
        dotsColor: q.dotsColor,

        cornersSquareTypeMode: q.cornersSquareTypeMode,
        cornersSquareType: q.cornersSquareType,
        cornersSquareColor: q.cornersSquareColor,

        cornersDotTypeMode: q.cornersDotTypeMode,
        cornersDotType: q.cornersDotType,
        cornersDotColor: q.cornersDotColor,

        logoBackgroundEnabled: q.logoBackgroundEnabled,
        logoBackgroundColor: q.logoBackgroundColor,
        logoSizePx: q.logoSizePx,

        // чтобы qr.update не мигал при background image
        backgroundColor: hasBgImage ? "__IGNORED__" : q.backgroundColor,
        backgroundAutoPickEnabled: q.backgroundAutoPickEnabled,
      };
    }),
  );

  const previewDataBase = useMemo(() => {
    if (generatorType === "registry") return registryPreviewData;
    return buildPreviewData(generatorType, dynamicFields);
  }, [generatorType, registryPreviewData, dynamicFields]);

  const previewData =
    (generatorType === "registry" && rowsCount === 0) ||
    (generatorType === "businessCard" && !hasAnyBusinessCardField)
      ? ""
      : previewDataBase;

  const previewDataForRender = previewData || " ";

  const hasRegistryValidationErrors =
    generatorType === "registry" && registryValidationErrorsCount > 0;

  const canGenerate =
    (generatorType === "registry" && rowsCount > 0 && !hasRegistryValidationErrors) ||
    (generatorType === "individual" && Boolean(normalizedUrl)) ||
    (generatorType === "text" && Boolean(normalizedText)) ||
    (generatorType === "email" && Boolean(normalizedEmail)) ||
    (generatorType === "businessCard" && hasAnyBusinessCardField);

  const shouldDimPreview =
    (generatorType === "registry" && rowsCount === 0) ||
    (generatorType === "individual" && !normalizedUrl) ||
    (generatorType === "text" && !normalizedText) ||
    (generatorType === "email" && !normalizedEmail) ||
    (generatorType === "businessCard" && !hasAnyBusinessCardField);

  const isGenerateDisabled = !canGenerate || isGenerating;

  const qrContainerRef = useRef<HTMLDivElement | null>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);

  const debounceTimerRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingOptionsRef = useRef<Parameters<QRCodeStyling["update"]>[0] | null>(
    null,
  );

  const flushUpdate = () => {
    if (rafIdRef.current !== null) return;

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;

      const qrCode = qrInstanceRef.current;
      const pending = pendingOptionsRef.current;
      pendingOptionsRef.current = null;

      if (!qrCode || !pending) return;

      qrCode.update(pending);

      const svg = qrContainerRef.current?.querySelector("svg");
      if (svg) {
        svg.style.display = "block";
        svg.style.width = "100%";
        svg.style.height = "100%";
      }
    });
  };

  const scheduleUpdate = (options: Parameters<QRCodeStyling["update"]>[0]) => {
    pendingOptionsRef.current = options;

    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = null;
      flushUpdate();
    }, UPDATE_DEBOUNCE_MS);
  };

  useEffect(() => {
    if (!qrContainerRef.current) return;

    const qrCode = new QRCodeStyling({
      width: previewSizePx,
      height: previewSizePx,
      type: "svg",
      data: " ",
      margin: 0,
      qrOptions: { errorCorrectionLevel: "M" },
      backgroundOptions: { color: "transparent" },
      dotsOptions: { type: "rounded", color: QR_COLOR },
      cornersSquareOptions: { type: "extra-rounded", color: QR_COLOR },
      cornersDotOptions: { type: "dot", color: QR_COLOR },
    });

    qrInstanceRef.current = qrCode;
    qrContainerRef.current.innerHTML = "";
    qrCode.append(qrContainerRef.current);

    requestAnimationFrame(() => {
      const svg = qrContainerRef.current?.querySelector("svg");
      if (svg) {
        svg.style.display = "block";
        svg.style.width = "100%";
        svg.style.height = "100%";
      }
    });

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      if (!qrContainerRef.current) return;
      qrContainerRef.current.innerHTML = "";
      qrInstanceRef.current = null;
      pendingOptionsRef.current = null;
    };
  }, [previewSizePx]);

  useEffect(() => {
    const hasBgImage = Boolean(backgroundDataUrl);
    const normalizedBackgroundColor = String(qrSettingsForQr.backgroundColor || "").trim();
    const backgroundFallbackColor = hasBgImage
      ? "transparent"
      : (normalizedBackgroundColor ? BG_COLOR : "transparent");

    const nextOptions = buildQrCodeOptions({
      data: previewDataForRender,
      sizePx: previewSizePx,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      qrSettings: qrSettingsForQr as any,
      logoBase64: logoDataUrl ?? null,
      qrColor: QR_COLOR,
      backgroundFallbackColor,
      forceTransparentBackground: hasBgImage,
    });

    scheduleUpdate(nextOptions);
  }, [
    backgroundDataUrl,
    logoDataUrl,
    previewDataForRender,
    qrSettingsForQr,
    previewSizePx,
  ]);

  const onGenerateClick = () => {
    setError("");
    setReportHint("");

    if (hasRegistryValidationErrors) {
      setError("Реестр содержит ошибки. Исправьте их перед генерацией.");
      return;
    }

    setIsGenerating(true);
    setProgress(null);

    const { registry, qrSettings: snapshotSettings, logo, background } =
      useQrGeneratorStore.getState();

    const rows: [string, string][] =
      generatorType === "registry" ? registry.rows : [["qr-code", previewData]];

    const logoBase64 = logo.dataUrl ?? null;

    if (generatorType === "registry") {
      generateQrZipWithProgress({
        rows,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        qrSettings: snapshotSettings as any,
        logoBase64,
        imageExtension: IMAGE_EXTENSION,
        backgroundDataUrl: background.dataUrl,
        backgroundOverlayColor: snapshotSettings.backgroundColor,
        backgroundOverlayAlpha: OVERLAY_ALPHA,
        onProgress: (nextProgress) => {
          setProgress({
            ...nextProgress,
            isDone: nextProgress.done === nextProgress.total,
          });
        },
      })
        .then((result) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const zip = (result as any).zip as Blob;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const errors = Number((result as any).errors ?? 0);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const generationErrors = (result as any).generationErrors as
            | Array<{ lineNumber: number; fileName: string; message: string }>
            | undefined;

          downloadArchive(zip);

          if (errors > 0) {
            setReportHint(
              generationErrors?.length
                ? "Отчёт по ошибкам добавлен в архив (generation_errors_*.csv)."
                : "Отчёт по ошибкам добавлен в архив.",
            );
          }

          setProgress((prev) =>
            prev
              ? {
                  ...prev,
                  isDone: true,
                  statusText: errors ? "Готово с ошибками" : "Готово",
                  errors,
                }
              : {
                  done: rows.length,
                  total: rows.length,
                  errors,
                  statusText: errors ? "Готово с ошибками" : "Готово",
                  isDone: true,
                },
          );
        })
        .catch((generateError) => {
          setError(
            `Ошибка генерации QR-кодов: ${(generateError as Error).message}`,
          );
        })
        .finally(() => setIsGenerating(false));

      return;
    }

    generateQrCodes({
      rows,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      qrSettings: snapshotSettings as any,
      logoBase64,
      imageExtension: IMAGE_EXTENSION,
      backgroundDataUrl: background.dataUrl,
      backgroundOverlayColor: snapshotSettings.backgroundColor,
      backgroundOverlayAlpha: OVERLAY_ALPHA,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
      .then(downloadArchive)
      .catch((generateError) => {
        setError(
          `Ошибка генерации QR-кодов: ${(generateError as Error).message}`,
        );
      })
      .finally(() => setIsGenerating(false));
  };

  const onResetClick = () => {
    resetQrSettings();
    setError("");
    setReportHint("");
  };

  const signatureLabel = (signatureText || "").trim();
  const shouldShowSignature = signatureEnabled && Boolean(signatureLabel);

  const hasBgImage = Boolean(backgroundDataUrl);
  const shouldShowOverlay = hasBgImage;
  // Когда нет фон-картинки — под QR должен быть фон страницы (светло-серый)
  const previewBaseBackground = hasBgImage
    ? overlayColor || BG_COLOR
    : PAGE_BG_COLOR;

  const previewCardStyle: React.CSSProperties = {
    width: previewSizePx,
    borderRadius: 10,
    overflow: "hidden",
    boxSizing: "border-box",
  };

  const previewOuterStyle: React.CSSProperties = {
    width: "100%",
    height: previewSizePx,
    backgroundColor: hasSafeZone ? safeZoneColor : previewBaseBackground,
    position: "relative",
  };

  const normalizedOverlayColor = String(overlayColor || "").trim();

  const previewInnerStyle: React.CSSProperties = {
    position: "absolute",
    inset: safeZonePreviewPx,
    overflow: "hidden",
    // если нет bg-image — фон прозрачный, чтобы “просвечивал” previewOuterStyle
    backgroundColor: hasBgImage
      ? normalizedOverlayColor || BG_COLOR
      : normalizedOverlayColor || PAGE_BG_COLOR,
    backgroundImage: hasBgImage ? `url(${backgroundDataUrl})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  return (
    <div>
      <div
        className={`rounded-[10px] border border-brand-500 ${
          hasSafeZone ? "p-0" : "p-[28px]"
        } ${shouldDimPreview ? "opacity-50" : "opacity-100"}`}
      >
        <div ref={previewHostRef} className="w-full aspect-square">
          <div style={previewCardStyle}>
            <div style={previewOuterStyle}>
              <div style={previewInnerStyle}>
                {shouldShowOverlay && (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: overlayColor || BG_COLOR,
                      opacity: OVERLAY_ALPHA,
                      zIndex: 1,
                      pointerEvents: "none",
                    }}
                  />
                )}

                <div className="absolute inset-0" style={{ zIndex: 2 }}>
                  <div ref={qrContainerRef} className="h-full w-full" />
                </div>
              </div>
            </div>

            {shouldShowSignature && (
              <div
                style={{
                  backgroundColor: signatureBorderColor,
                  padding: "18px 18px 22px",
                }}
              >
                <div
                  style={{
                    color: "#FFFFFF",
                    fontSize: 48,
                    fontWeight: 600,
                    lineHeight: 1.05,
                    textAlign: "center",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    textTransform: "uppercase",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {signatureLabel}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {reportHint && (
        <div className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {reportHint}
        </div>
      )}

      <button
        type="button"
        onClick={onGenerateClick}
        disabled={isGenerateDisabled}
        className="
          mt-5 flex w-full items-center justify-center gap-2
          rounded-[10px] bg-brand-500 px-5 py-[15px]
          text-[14px] font-semibold text-white
          disabled:cursor-not-allowed disabled:opacity-60
        "
      >
        <IconGenDownloadQr size={20} className="text-white" />
        {isGenerating ? "Генерация..." : "Сгенерировать"}
      </button>

      <button
        type="button"
        onClick={onResetClick}
        disabled={isGenerating}
        className="
          mt-[20px] flex w-full items-center justify-center gap-2
          rounded-[10px] border border-brand-500 px-5 py-[15px]
          text-[14px] font-semibold text-brand-500
          disabled:cursor-not-allowed disabled:opacity-60
        "
      >
        <IconResetParams size={20} className="text-brand-500" />
        Сбросить параметры
      </button>

      {generatorType === "registry" && progress && (
        <div className="mt-4 rounded-[10px] bg-white p-4 shadow-card">
          <div className="flex items-center justify-between text-sm text-gray-800">
            <div>{progress.statusText}</div>
            <div>
              {progress.done} из {progress.total}
            </div>
          </div>

          <div className="mt-3">
            <LinearProgress
              variant="determinate"
              value={progress.total ? (progress.done / progress.total) * 100 : 0}
            />
          </div>

          {progress.errors > 0 && (
            <div className="mt-2 text-xs text-red-700">
              Ошибок при генерации: {progress.errors}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
