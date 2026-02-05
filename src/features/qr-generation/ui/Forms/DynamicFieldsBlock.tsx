import { Box, OutlinedInput } from "@mui/material";
import { Controller, type Control } from "react-hook-form";

import type { GeneratorType } from "../../model/types";
import type { QrSettingsFormValues } from "./QrGeneratorSettingsForm";

type DynamicFieldsBlockProps = {
  generatorType: GeneratorType;
  control: Control<QrSettingsFormValues>;
};

type FormTextFieldProps = {
  control: Control<QrSettingsFormValues>;
  name: `dynamicFields.${string}`;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url";
  className?: string;
};

const FormTextField = ({
  control,
  name,
  label,
  placeholder,
  type = "text",
  className,
}: FormTextFieldProps) => {
  const resolvedLabel = (label || placeholder || "").trim();

  return (
    <div className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const value = typeof field.value === "string" ? field.value : "";
          const hasValue = Boolean(value.trim());

          return (
            <div className="relative">
              {hasValue && resolvedLabel && (
                <div
                  className="pointer-events-none absolute left-[8px] top-[4px] z-10 bg-white px-[4px] text-[12px] font-normal leading-[16px]"
                  style={{ color: "#9283C0" }}
                >
                  {resolvedLabel}
                </div>
              )}

              <OutlinedInput
                value={value}
                onChange={(event) => field.onChange(event.target.value)}
                placeholder={placeholder}
                type={type}
                sx={{
                  width: "100%",
                  height: "45px",
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
                    padding: hasValue ? "20px 12px 8px" : "0 12px",
                    height: "45px",
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "#313131",
                    fontFamily: "Inter, sans-serif",
                    lineHeight: 1.2,
                    boxSizing: "border-box",
                  },

                  "& .MuiOutlinedInput-input::placeholder": {
                    color: "#9283C0",
                    opacity: 1,
                  },
                }}
              />
            </div>
          );
        }}
      />
    </div>
  );
};

export const DynamicFieldsBlock = ({
  generatorType,
  control,
}: DynamicFieldsBlockProps) => {
  if (generatorType === "registry") return null;

  if (generatorType === "individual") {
    return (
      <Box sx={{ display: "grid", gap: 2 }}>
        <div className="text-[16px] font-semibold text-gray-900">Ссылка</div>

        <FormTextField
          control={control}
          name="dynamicFields.url"
          label=""
          placeholder="URL"
          type="url"
          className="max-w-[440px]"
        />
      </Box>
    );
  }

  if (generatorType === "businessCard") {
    return (
      <Box sx={{ display: "grid", gap: 2 }}>
        <div className="text-[16px] font-semibold text-gray-900">Данные</div>

        <div className="grid grid-cols-3 gap-4">
          <FormTextField
            control={control}
            name="dynamicFields.lastName"
            label=""
            placeholder="Фамилия"
          />
          <FormTextField
            control={control}
            name="dynamicFields.firstName"
            label=""
            placeholder="Имя"
          />
          <FormTextField
            control={control}
            name="dynamicFields.middleName"
            label=""
            placeholder="Отчество"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormTextField
            control={control}
            name="dynamicFields.phone"
            label=""
            placeholder="Контактный телефон"
            type="tel"
          />
          <FormTextField
            control={control}
            name="dynamicFields.email"
            label=""
            placeholder="E-mail"
            type="email"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormTextField
            control={control}
            name="dynamicFields.company"
            label=""
            placeholder="Компания"
          />
          <FormTextField
            control={control}
            name="dynamicFields.position"
            label=""
            placeholder="Должность"
          />
        </div>
      </Box>
    );
  }

  if (generatorType === "text") {
    return (
      <Box sx={{ display: "grid", gap: 2 }}>
        <div className="text-[16px] font-semibold text-gray-900">Текст</div>

        <FormTextField
          control={control}
          name="dynamicFields.text"
          label=""
          placeholder="Введите текст"
          className="max-w-[440px]"
        />
      </Box>
    );
  }

  if (generatorType === "email") {
    return (
      <Box sx={{ display: "grid", gap: 2 }}>
        <div className="text-[16px] font-semibold text-gray-900">
          Адрес почты
        </div>

        <FormTextField
          control={control}
          name="dynamicFields.email"
          label=""
          placeholder="Введите e-mail"
          type="email"
          className="max-w-[440px]"
        />
      </Box>
    );
  }

  return null;
};
