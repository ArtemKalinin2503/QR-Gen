import { Box } from "@mui/material";
import { FileUploadField } from "../../../../../shared/ui/file-upload/FileUploadField";
import { NumberPxField } from "../../../../../shared/ui/inputs/NumberPxField";
import { ZoneColorField } from "../../../../../shared/ui/inputs/ZoneColorField";
import { useQrGeneratorStore } from "../../../../../store/qrGenerator.store";
import { fileToDataUrl } from "../../../lib/fileToDataUrl";

const LOGO_ACCEPT = {
  "image/svg+xml": [".svg"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
} as const;

const LOGO_FORMATS_HINT = "SVG, PNG, JPG, JPEG";

export const LogoTab = () => {
  const logo = useQrGeneratorStore((state) => state.logo);

  const setLogoFile = useQrGeneratorStore((state) => state.setLogoFile);
  const setLogoError = useQrGeneratorStore((state) => state.setLogoError);
  const resetLogo = useQrGeneratorStore((state) => state.resetLogo);

  const qrSettings = useQrGeneratorStore((state) => state.qrSettings);
  const setQrSettings = useQrGeneratorStore((state) => state.setQrSettings);

  const selectedFile = logo.fileName
    ? { name: logo.fileName, size: logo.fileSize }
    : null;

  const onFileSelected = async (file: File) => {
    const dataUrl = await fileToDataUrl(file);

    setLogoFile({
      fileName: file.name,
      fileSize: file.size,
      dataUrl,
    });
  };

  const isLogoSelected = Boolean(logo.dataUrl);

  const qrSizePx = qrSettings.sizePx;
  const maxLogoSizePx = Math.floor(qrSizePx * 0.3);
  const isLogoSizeLimited = qrSettings.logoSizePx > maxLogoSizePx;

  return (
    <div className="pt-6">
      <FileUploadField
        title=""
        accept={LOGO_ACCEPT}
        formatsHint={LOGO_FORMATS_HINT}
        selectedFile={selectedFile}
        icon={<div className="text-[12px] font-normal text-brand-500">SVG</div>}
        onFileSelected={onFileSelected}
        onDelete={resetLogo}
        error={logo.error}
        onError={setLogoError}
        showPreviewImage
        previewSrc={logo.dataUrl}
      />

      <div className="mt-[20px] grid gap-4">
        <Box sx={{ opacity: isLogoSelected ? 1 : 0.5 }}>
          <ZoneColorField
            label="Цвет фона"
            value={qrSettings.logoBackgroundColor}
            onChange={(nextColor) =>
              setQrSettings({ logoBackgroundColor: nextColor })
            }
            disabled={!isLogoSelected}
          />
        </Box>

        <NumberPxField
          label="Размер логотипа"
          value={qrSettings.logoSizePx}
          onChange={(nextValue) => {
            if (nextValue === "") {
              setQrSettings({ logoSizePx: 0 });
              return;
            }
            setQrSettings({ logoSizePx: nextValue });
          }}
          step={1}
          clampOnBlur={false}
          disabled={!isLogoSelected}
        />

        {isLogoSelected && qrSettings.logoSizePx > 0 && isLogoSizeLimited && (
          <div className="mt-2 text-[12px] leading-[16px] text-[#667085]">
            Максимальный размер логотипа — {maxLogoSizePx}px (30% от размера QR). В результате значение будет ограничено.
          </div>
        )}
      </div>
    </div>
  );
};
