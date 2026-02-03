
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { ZoneColorField, type ZoneColorFieldProps } from "./ZoneColorField";

type FormZoneColorFieldProps<FormValues extends FieldValues> = {
  control: Control<FormValues>;
  name: Path<FormValues>;
} & Omit<ZoneColorFieldProps, "value" | "onChange">;

export function FormZoneColorField<FormValues extends FieldValues>({
  control,
  name,
  ...restProps
}: FormZoneColorFieldProps<FormValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <ZoneColorField
          {...restProps}
          value={field.value}
          onChange={field.onChange}
        />
      )}
    />
  );
}
