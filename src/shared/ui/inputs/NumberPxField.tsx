import { OutlinedInput } from "@mui/material";

export type NumberPxFieldProps = {
  value: number | "";
  onChange: (nextValue: number | "") => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;

  disabled?: boolean;
  className?: string;
};

const clamp = (value: number, min?: number, max?: number) => {
  const withMin = min === undefined ? value : Math.max(min, value);
  return max === undefined ? withMin : Math.min(max, withMin);
};

export const NumberPxField = ({
  value,
  onChange,
  label,
  min,
  max,
  step = 1,
  disabled = false,
  className,
}: NumberPxFieldProps) => {
  const setNext = (nextValue: number) => onChange(clamp(nextValue, min, max));

  const increase = () => {
    const currentValue = value === "" ? 0 : value;
    setNext(currentValue + step);
  };

  const decrease = () => {
    const currentValue = value === "" ? 0 : value;
    setNext(currentValue - step);
  };

  const onInputChange = (rawValue: string) => {
    if (!rawValue) {
      onChange("");
      return;
    }

    const nextValue = Number(rawValue);

    if (Number.isNaN(nextValue)) return;

    setNext(nextValue);
  };

  return (
    <div className={className}>
      {label && (
        <div className="mb-[5px] text-[14px] font-normal text-[#9283C0]">
          {label}
        </div>
      )}

      <div className="relative w-full max-w-[125px]">
        <OutlinedInput
          value={value}
          onChange={(event) => onInputChange(event.target.value)}
          disabled={disabled}
          type="number"
          inputProps={{ min, max, step }}
          sx={{
            width: "100%",
            height: "35px",
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
              padding: "0 54px 0 10px", // место под px + стрелки
              height: "35px",
              fontSize: "14px",
              fontWeight: 400,
              color: "#313131",
              fontFamily: "Inter, sans-serif",
              lineHeight: 1,
            },

            /* убираем нативные стрелки браузера */
            "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
              { WebkitAppearance: "none", margin: 0 },
            "& input[type=number]": { MozAppearance: "textfield" },
          }}
        />

        {/* px + кастомный степпер */}
        <div className="pointer-events-none absolute right-[6px] top-1/2 flex -translate-y-1/2 items-center gap-2">
          <div className="pointer-events-none absolute right-[6px] top-1/2 flex -translate-y-1/2 items-center gap-1">
            <div className="text-[14px] font-normal text-[#9283C0]">px</div>

            <div className="pointer-events-auto flex flex-col max-h-[20px]">
              <button
                type="button"
                onClick={increase}
                disabled={disabled}
                className="flex h-[12px] w-[12px] items-center justify-center disabled:opacity-50"
                aria-label="Увеличить"
              >
                <span className="inline-block h-0 w-0 border-x-[4px] border-x-transparent border-b-[6px] border-b-[#9283C0]" />
              </button>

              <button
                type="button"
                onClick={decrease}
                disabled={disabled}
                className="flex h-[12px] w-[12px] items-center justify-center disabled:opacity-50"
                aria-label="Уменьшить"
              >
                <span className="inline-block h-0 w-0 border-x-[4px] border-x-transparent border-t-[6px] border-t-[#9283C0]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
