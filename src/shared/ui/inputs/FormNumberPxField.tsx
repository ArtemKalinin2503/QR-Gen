import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { NumberPxField, type NumberPxFieldProps } from "./NumberPxField";

type FormNumberPxFieldProps<FormValues extends FieldValues> = {
  control: Control<FormValues>;
  name: Path<FormValues>;
} & Omit<NumberPxFieldProps, "value" | "onChange">;

export function FormNumberPxField<FormValues extends FieldValues>({
  control,
  name,
  ...restProps
}: FormNumberPxFieldProps<FormValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <NumberPxField
          {...restProps}
          value={field.value}
          onChange={field.onChange}
        />
      )}
    />
  );
}
