import { Box, Switch, Typography, OutlinedInput } from "@mui/material";

import { ZoneColorField } from "../../../../../shared/ui/inputs/ZoneColorField";
import { useQrGeneratorStore } from "../../../../../store/qrGenerator.store";

export const SignatureTab = () => {
  const qrSettings = useQrGeneratorStore((s) => s.qrSettings);
  const setQrSettings = useQrGeneratorStore((s) => s.setQrSettings);

  const isEnabled = qrSettings.signatureEnabled;

  return (
    <div className="pt-6">
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography sx={{ fontWeight: 700 }}>Добавить подпись</Typography>

        <Switch
          checked={Boolean(isEnabled)}
          onChange={(_, checked) => setQrSettings({ signatureEnabled: checked })}
        />
      </Box>

      <div className="mt-4 grid gap-4" style={{ opacity: isEnabled ? 1 : 0.5 }}>
        <div className="max-w-[520px]">
          <div className="mb-[5px] text-[14px] font-normal text-[#9283C0]">
            Подпись
          </div>

          <OutlinedInput
            value={qrSettings.signatureText}
            onChange={(event) =>
              setQrSettings({ signatureText: event.target.value })
            }
            placeholder="Подпись"
            disabled={!isEnabled}
            sx={{
              width: "100%",
              height: "44px",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              fontFamily: "Inter, sans-serif",

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

              "& .MuiOutlinedInput-input": {
                padding: "0 10px",
                height: "44px",
                fontSize: "14px",
                fontWeight: 400,
                color: "#313131",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1,
              },
            }}
          />
        </div>

        <ZoneColorField
          label="Цвет рамки"
          value={qrSettings.signatureBorderColor}
          onChange={(nextColor) => setQrSettings({ signatureBorderColor: nextColor })}
          disabled={!isEnabled}
        />
      </div>
    </div>
  );
};
