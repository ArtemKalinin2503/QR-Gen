import React from 'react';

import { Box, Slider, Typography } from '@mui/material';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

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
  return String(value).replace('.', ',');
}

export function FormSliderField<FormValues extends FieldValues>({
  control,
  name,
  label,
  min = 0,
  max = 1,
  step = 0.5,
  disabled = false,
}: FormSliderFieldProps<FormValues>) {
  return (
    <Box>
      <Typography sx={{ mb: 1, fontWeight: 600 }}>{label}</Typography>

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ width: 44, color: 'text.secondary' }}>
              {formatNumberForRu(min)}
            </Typography>

            <Slider
              value={typeof field.value === 'number' ? field.value : min}
              onChange={(_, nextValue) => field.onChange(nextValue as number)}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => formatNumberForRu(value as number)}
              sx={{
                flex: 1,

                '& .MuiSlider-thumb': {
                  boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                },
              }}
            />

            <Typography sx={{ width: 32, textAlign: 'right', color: 'text.secondary' }}>
              {formatNumberForRu(max)}
            </Typography>
          </Box>
        )}
      />
    </Box>
  );
}
