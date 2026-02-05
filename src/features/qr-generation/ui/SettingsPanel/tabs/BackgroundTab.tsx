import { useEffect, useRef, useState } from "react";
import { Box, Switch, Typography } from "@mui/material";
import { MuiColorInput } from "mui-color-input";
import { FileUploadField } from "../../../../../shared/ui/file-upload/FileUploadField";
import { useQrGeneratorStore } from "../../../../../store/qrGenerator.store";
import { fileToDataUrl } from "../../../lib/fileToDataUrl";
import { autoPickOverlayColor } from "../../../lib/autoPickOverlayColor";

const BG_ACCEPT = {
  "image/svg+xml": [".svg"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
} as const;

const BG_FORMATS_HINT = "SVG, PNG, JPG, JPEG";

const OVERLAY_ALPHA = 0.35;

const normalizeHex = (value: string) => String(value || "").trim();

export const BackgroundTab = () => {
  const background = useQrGeneratorStore((s) => s.background);
  const setBackgroundFile = useQrGeneratorStore((s) => s.setBackgroundFile);
  const setBackgroundError = useQrGeneratorStore((s) => s.setBackgroundError);
  const resetBackground = useQrGeneratorStore((s) => s.resetBackground);

  const qrSettings = useQrGeneratorStore((s) => s.qrSettings);
  const setQrSettings = useQrGeneratorStore((s) => s.setQrSettings);

  const selectedFile = background.fileName
    ? { name: background.fileName, size: background.fileSize }
    : null;

  const onFileSelected = async (file: File) => {
    const dataUrl = await fileToDataUrl(file);

    setBackgroundFile({
      fileName: file.name,
      fileSize: file.size,
      dataUrl,
    });
  };

  const isBgSelected = Boolean(background.dataUrl);

  // основной цвет модулей QR (для контраста)
  const qrMainColor = normalizeHex(qrSettings.dotsColor) || "#000000";

  const lastAutoPickedRef = useRef<string | null>(null);
  const [isAutoPicking, setIsAutoPicking] = useState(false);

  const runAutoPick = async () => {
    const bg = background.dataUrl;
    if (!bg) return;

    setIsAutoPicking(true);

    const next = await autoPickOverlayColor({
      bgDataUrl: bg,
      qrHexColor: qrMainColor,
      overlayAlpha: OVERLAY_ALPHA,
      minContrast: 4.5,
    });

    setIsAutoPicking(false);

    if (!next) return;
    if (lastAutoPickedRef.current === next) return;

    lastAutoPickedRef.current = next;
    setQrSettings({ backgroundColor: next });
  };

  // 1) При включенном автоподборе пересчитываем при смене картинки/цвета QR
  useEffect(() => {
    if (!background.dataUrl) return;
    if (!qrSettings.backgroundAutoPickEnabled) return;

    void runAutoPick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [background.dataUrl, qrMainColor, qrSettings.backgroundAutoPickEnabled]);

  // 2) Если удалили картинку — автоподбор выключаем
  useEffect(() => {
    if (background.dataUrl) return;
    if (!qrSettings.backgroundAutoPickEnabled) return;

    lastAutoPickedRef.current = null;
    setQrSettings({ backgroundAutoPickEnabled: false });
  }, [background.dataUrl, qrSettings.backgroundAutoPickEnabled, setQrSettings]);

  const onToggleAutoPick = async (checked: boolean) => {
    setQrSettings({ backgroundAutoPickEnabled: checked });
    lastAutoPickedRef.current = null;

    if (checked && background.dataUrl) {
      await runAutoPick();
    }
  };

  const backgroundColorRaw = normalizeHex(qrSettings.backgroundColor);

  const isTransparent = !backgroundColorRaw;

  const colorInputValue = isTransparent ? "#FFFFFF" : backgroundColorRaw;

  const onBackgroundColorChange = (nextColor: string) => {
    // если пользователь руками меняет цвет — вырубить автоподбор (иначе перезатрёт)
    if (qrSettings.backgroundAutoPickEnabled) {
      setQrSettings({ backgroundAutoPickEnabled: false });
    }

    setQrSettings({ backgroundColor: normalizeHex(nextColor) });
  };

  return (
    <div className="pt-6">
      <FileUploadField
        title=""
        accept={BG_ACCEPT}
        formatsHint={BG_FORMATS_HINT}
        selectedFile={selectedFile}
        icon={null}
        onFileSelected={onFileSelected}
        onDelete={resetBackground}
        error={background.error}
        onError={setBackgroundError}
        showPreviewImage
        previewSrc={background.dataUrl}
      />

      <div className="mt-6 grid gap-4">
        <div className="min-w-[240px]">
          <div className="mb-[5px] text-[14px] font-normal text-[#9283C0]">
            Цвет фона
          </div>

          <div className="relative w-[270px]">
            {isTransparent && (
              <div className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-[14px] font-normal text-[#98A2B3]">
                Прозрачный
              </div>
            )}

            <MuiColorInput
              value={colorInputValue}
              onChange={onBackgroundColorChange}
              format="hex"
              isAlphaHidden
              disabled={isAutoPicking}
              sx={{
                width: "270px",

                "& .MuiOutlinedInput-root": {
                  height: "44px",
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  paddingRight: "4px",
                  fontFamily: "Inter, sans-serif",
                },

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#9283C0",
                },

                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#9283C0",
                },

                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#9283C0",
                  borderWidth: "1px",
                },

                // когда "прозрачный" — прячем hex, чтобы не путать
                "& .MuiOutlinedInput-input": {
                  paddingLeft: "0px",
                  paddingRight: "0px",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: isTransparent ? "transparent" : "#313131",
                  fontFamily: "Inter, sans-serif",
                },

                "& .MuiOutlinedInput-input::selection": {
                  backgroundColor: "rgba(146, 131, 192, 0.25)",
                },

                // палитра справа
                "& .MuiInputAdornment-positionStart": {
                  order: 2,
                  marginLeft: "12px",
                  marginRight: 0,
                },

                "& .MuiColorInput-Button": {
                  width: "110px",
                  height: "36px",
                  borderRadius: "6px",
                  border: "1px solid #9283C0",
                  backgroundColor: "#FFFFFF",
                },
              }}
            />
          </div>
        </div>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ fontWeight: 400 }}>
            Автоподбор цвета{isAutoPicking ? "…" : ""}
          </Typography>

          <Switch
            checked={qrSettings.backgroundAutoPickEnabled}
            onChange={(_, checked) => void onToggleAutoPick(checked)}
            disabled={!isBgSelected || isAutoPicking}
          />
        </Box>
      </div>
    </div>
  );
};
