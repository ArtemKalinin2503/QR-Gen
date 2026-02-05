import { useEffect, useMemo } from "react";
import { Box, Switch, Typography } from "@mui/material";
import {
  Controller,
  type Control,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import type { GeneratorType } from "../../model/types";
import { FormZoneColorField } from "../../../../shared/ui/inputs/FormZoneColorField";
import { FormNumberPxField } from "../../../../shared/ui/inputs/FormNumberPxField";
import { FormSliderField } from "../../../../shared/ui/inputs/FormSliderField";
import { DynamicFieldsBlock } from "./DynamicFieldsBlock";
import {
  getMinQuietZonePx,
  getEffectiveQuietZonePx,
} from "../../lib/buildQrCodeOptions";

export type QrSettingsFormValues = {
  sizePx: number;
  hasSafeZone: boolean;
  safeZoneColor: string;
  safeZoneSizePx: number;

  lineThickness: number;
  verticalAlignmentScale: number;
  horizontalAlignmentScale: number;

  dynamicFields: Record<string, string | number | boolean>;
};

type QrGeneratorSettingsFormProps = {
  generatorType: GeneratorType;

  control: Control<QrSettingsFormValues>;
  watch: UseFormWatch<QrSettingsFormValues>;
  setValue: UseFormSetValue<QrSettingsFormValues>;
};

const RECOMMENDED_MIN_SIZE_PX = 200;
const RECOMMENDED_MAX_SIZE_PX = 2000;

export function QrGeneratorSettingsForm({
  generatorType,
  control,
  watch,
  setValue,
}: QrGeneratorSettingsFormProps) {
  const hasSafeZone = watch("hasSafeZone");
  const sizePx = watch("sizePx");
  const safeZoneSizePx = watch("safeZoneSizePx");

  useEffect(() => {
    if (!hasSafeZone) return;

    setValue("safeZoneColor", watch("safeZoneColor") || "#FFFFFF", {
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [hasSafeZone, setValue, watch]);

  const quietZoneHint = useMemo(() => {
    if (!hasSafeZone) return null;

    const normalizedSizePx = Number(sizePx) || 0;
    const normalizedRequestedPx = Number(safeZoneSizePx) || 0;

    if (normalizedSizePx <= 0) return null;

    const minPx = getMinQuietZonePx(normalizedSizePx);
    const effectivePx = getEffectiveQuietZonePx(
      normalizedSizePx,
      normalizedRequestedPx,
    );

    const isRaisedToMin =
      normalizedRequestedPx > 0 && normalizedRequestedPx < minPx;

    return {
      minPx,
      effectivePx,
      isRaisedToMin,
      sizePx: normalizedSizePx,
    };
  }, [hasSafeZone, sizePx, safeZoneSizePx]);

  const sizeHint = useMemo(() => {
    const normalizedSizePx = Number(sizePx) || 0;

    return {
      normalizedSizePx,
      isTooLarge: normalizedSizePx > RECOMMENDED_MAX_SIZE_PX,
      isTooSmall:
        normalizedSizePx > 0 && normalizedSizePx < RECOMMENDED_MIN_SIZE_PX,
    };
  }, [sizePx]);

  return (
    <Box sx={{ display: "grid", gap: "20px" }}>
      <DynamicFieldsBlock generatorType={generatorType} control={control} />

      <div>
        <FormNumberPxField
          control={control}
          name="sizePx"
          label="Размер"
          min={1}
          step={1}
          isSectionLabel
        />

        <div className="mt-2 text-[12px] leading-[16px] text-[#667085]">
          Рекомендуемый размер: {RECOMMENDED_MIN_SIZE_PX}–{RECOMMENDED_MAX_SIZE_PX}
          px.
        </div>

        {sizeHint.isTooLarge && (
          <div className="mt-2 text-[12px] leading-[16px] text-[#B42318]">
            Слишком большой размер может не сгенерироваться в браузере или занять
            заметное время. Попробуйте уменьшить до {RECOMMENDED_MAX_SIZE_PX}px.
          </div>
        )}

        {sizeHint.isTooSmall && (
          <div className="mt-2 text-[12px] leading-[16px] text-[#B42318]">
            Слишком маленький размер может хуже сканироваться. Рекомендуем от{" "}
            {RECOMMENDED_MIN_SIZE_PX}px.
          </div>
        )}
      </div>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography sx={{ fontWeight: 700 }}>Охранная зона</Typography>

        <Controller
          control={control}
          name="hasSafeZone"
          render={({ field }) => (
            <Switch
              checked={Boolean(field.value)}
              onChange={(_, checked) => field.onChange(checked)}
            />
          )}
        />
      </Box>

      <Box sx={{ display: "grid", gap: 2, opacity: hasSafeZone ? 1 : 0.5 }}>
        <FormZoneColorField
          control={control}
          name="safeZoneColor"
          label="Цвет зоны"
          disabled={!hasSafeZone}
        />

        <FormNumberPxField
          control={control}
          name="safeZoneSizePx"
          label="Размер зоны"
          min={0}
          step={1}
          disabled={!hasSafeZone}
        />

        {quietZoneHint && (
          <div className="text-[12px] leading-[16px] text-[#667085]">
            Минимальная охранная зона для размера {quietZoneHint.sizePx}px —{" "}
            {quietZoneHint.minPx}px.
            {quietZoneHint.isRaisedToMin && (
              <>
                {" "}
                В превью и при генерации будет использовано{" "}
                {quietZoneHint.effectivePx}px.
              </>
            )}
          </div>
        )}
      </Box>

      <Box sx={{ display: "grid", gap: "20px" }}>
        <FormSliderField
          control={control}
          name="lineThickness"
          label="Толщина линий"
          min={0.1}
          max={1}
          step={0.1}
        />

        <FormSliderField
          control={control}
          name="verticalAlignmentScale"
          label="Точечная шкала выравнивания по вертикали"
          min={0.1}
          max={1}
          step={0.1}
        />

        <FormSliderField
          control={control}
          name="horizontalAlignmentScale"
          label="Точечная шкала выравнивания по горизонтали"
          min={0.1}
          max={1}
          step={0.1}
        />
      </Box>  
    </Box>
  );
}
