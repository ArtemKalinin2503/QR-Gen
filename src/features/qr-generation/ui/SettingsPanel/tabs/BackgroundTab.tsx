import { Box, Switch, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { FileUploadField } from "../../../../../shared/ui/file-upload/FileUploadField";
import { ZoneColorField } from "../../../../../shared/ui/inputs/ZoneColorField";
import { useQrGeneratorStore } from "../../../../../store/qrGenerator.store";
import { fileToDataUrl } from "../../../lib/fileToDataUrl";
import { autoPickOverlayColor } from "../../../lib/autoPickOverlayColor";

const BG_ACCEPT = {
  "image/svg+xml": [".svg"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
} as const;

const BG_FORMATS_HINT = "SVG, PNG, JPG, JPEG";

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

  // основной цвет QR (для контраста)
  const qrMainColor = qrSettings.dotsColor || "#000000";

  const lastAutoPickedRef = useRef<string | null>(null);
  const [isAutoPicking, setIsAutoPicking] = useState(false);

  const runAutoPick = async () => {
    const bg = background.dataUrl;
    if (!bg) return;

    setIsAutoPicking(true);
    try {
      const next = await autoPickOverlayColor({
        bgDataUrl: bg,
        qrHexColor: qrMainColor,
        minContrast: 4.5,
      });

      if (!next) return;
      if (lastAutoPickedRef.current === next) return;

      lastAutoPickedRef.current = next;
      setQrSettings({ backgroundColor: next });
    } finally {
      setIsAutoPicking(false);
    }
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

    // при включении — сразу пересчитать и обновить backgroundColor
    if (checked && background.dataUrl) {
      await runAutoPick();
    }
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
      />

      <div className="mt-6 grid gap-4">
        <ZoneColorField
          label="Цвет фона"
          value={qrSettings.backgroundColor}
          onChange={(nextColor) => {
            // если пользователь руками меняет цвет — вырубить автоподбор
            // (иначе он перезатрёт)
            if (qrSettings.backgroundAutoPickEnabled) {
              setQrSettings({ backgroundAutoPickEnabled: false });
            }
            setQrSettings({ backgroundColor: nextColor });
          }}
          disabled={isAutoPicking}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ fontWeight: 400 }}>
            Автоподбор цвета
            {isAutoPicking ? "…" : ""}
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
