import { useEffect } from "react";
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

export function QrGeneratorSettingsForm({
  generatorType,
  control,
  watch,
  setValue,
}: QrGeneratorSettingsFormProps) {
  const hasSafeZone = watch("hasSafeZone");

  useEffect(() => {
    if (!hasSafeZone) return;

    setValue("safeZoneColor", watch("safeZoneColor") || "#FFFFFF", {
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [hasSafeZone, setValue, watch]);

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <DynamicFieldsBlock generatorType={generatorType} control={control} />

      <FormNumberPxField control={control} name="sizePx" label="Размер" min={1} step={1} />

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography sx={{ fontWeight: 700 }}>Охранная зона</Typography>

        <Controller
          control={control}
          name="hasSafeZone"
          render={({ field }) => (
            <Switch checked={Boolean(field.value)} onChange={(_, checked) => field.onChange(checked)} />
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
      </Box>

      <FormSliderField
        control={control}
        name="lineThickness"
        label="Толщина линий"
        min={0.1}
        max={1}
        step={0.5}
      />

      <FormSliderField
        control={control}
        name="verticalAlignmentScale"
        label="Точечная шкала выравнивания по вертикали"
        min={0.1}
        max={1}
        step={0.5}
      />

      <FormSliderField
        control={control}
        name="horizontalAlignmentScale"
        label="Точечная шкала выравнивания по горизонтали"
        min={0.1}
        max={1}
        step={0.5}
      />
    </Box>
  );
}


