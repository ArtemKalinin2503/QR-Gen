import { Box, Slider, Typography } from "@mui/material";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

type FormSliderFieldProps<FormValues extends FieldValues> = {
  control: Control<FormValues>;
  name: Path<FormValues>;
  label: string;

  min?: number;
  max?: number;
  step?: number;

  disabled?: boolean;
};

function formatNumberForRu(value: number) {
  return String(value).replace(".", ",");
}

export function FormSliderField<FormValues extends FieldValues>({
  control,
  name,
  label,
  min = 0,
  max = 1,
  step = 0.1,
  disabled = false,
}: FormSliderFieldProps<FormValues>) {
  return (
    <Box>
      <Typography
        sx={{
          mb: 1,
          fontSize: "16px",
          lineHeight: "22px", 
        }}
        className="!font-semibold"
      >
        {label}
      </Typography>

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Box
            sx={{
              width: "354px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Typography
              sx={{
                flex: "0 0 32px",
                color: "text.secondary",
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: 400,
              }}
            >
              {formatNumberForRu(min)}
            </Typography>

            <Slider
              value={typeof field.value === "number" ? field.value : min}
              onChange={(_, nextValue) => field.onChange(nextValue as number)}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => formatNumberForRu(value as number)}
              sx={{
                flex: 1,

                "& .MuiSlider-rail": {
                  height: "2px",
                  borderRadius: "1px",
                },
                "& .MuiSlider-track": {
                  height: "2px",
                  borderRadius: "1px",
                },

                "& .MuiSlider-thumb": {
                  boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                },

                "& .MuiSlider-valueLabel": {
                  fontSize: "14px",
                  lineHeight: "20px",
                  fontWeight: 400,
                },
              }}
            />

            <Typography
              sx={{
                flex: "0 0 16px",
                textAlign: "right",
                color: "text.secondary",
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: 400,
              }}
            >
              {formatNumberForRu(max)}
            </Typography>
          </Box>
        )}
      />
    </Box>
  );
}
