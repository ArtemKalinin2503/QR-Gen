import { MuiColorInput } from "mui-color-input";

export type ZoneColorFieldProps = {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  disabled?: boolean;
};

export const ZoneColorField = ({
  value,
  onChange,
  label = "Цвет зоны",
  disabled = false,
}: ZoneColorFieldProps) => {
  return (
    <div className="min-w-[240px]">
      <div className="mb-[5px] text-[14px] font-normal text-[#9283C0]">
        {label}
      </div>

      <MuiColorInput
        value={value}
        onChange={onChange}
        format="hex"
        isAlphaHidden
        disabled={disabled}
        sx={{
          width: "270px",

          "& .MuiOutlinedInput-root": {
            height: "44px",
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
            paddingRight: "4px",
            fontFamily: "Inter, sans-serif",
          },

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
            paddingLeft: "0px",
            paddingRight: "0px",
            fontSize: "14px",
            fontWeight: 400,
            color: "#313131",
            fontFamily: "Inter, sans-serif",
          },

          /* палитра справа */
          "& .MuiInputAdornment-positionStart": {
            order: 2,
            marginLeft: "12px",
            marginRight: 0,
          },

          "& .MuiColorInput-Button": {
            width: "110px",
            height: "36px",
            borderRadius: "6px",
            border: "1px solid #9283C0",
            backgroundColor: "#FFFFFF",
          },
        }}
      />
    </div>
  );
};
