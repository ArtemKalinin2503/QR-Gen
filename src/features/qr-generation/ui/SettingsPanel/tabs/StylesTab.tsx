import type { Options } from "qr-code-styling";
import { useQrGeneratorStore } from "../../../../../store/qrGenerator.store";
import { ZoneColorField } from "../../../../../shared/ui/inputs/ZoneColorField";
import { QrStylePreviewButton } from "../QrStylePreviewButton";

type DotType = NonNullable<NonNullable<Options["dotsOptions"]>["type"]>;
type CornerSquareType =
  NonNullable<NonNullable<Options["cornersSquareOptions"]>["type"]>;
type CornerDotType =
  NonNullable<NonNullable<Options["cornersDotOptions"]>["type"]>;

// Наборы - Стиль формы
const DOT_TYPES = [
  "dots",
  "rounded",
  "square",
  "extra-rounded",
  "classy",
  "classy-rounded",
] as const satisfies readonly DotType[];

// Наборы - Стиль внешних границ
const CORNER_SQUARE_TYPES = [
  "square",
  "extra-rounded",
  "dot",
] as const satisfies readonly CornerSquareType[];

// Наборы - Стиль внутренних границ
const CORNER_DOT_TYPES = [
  "dot",
  "rounded",
  "square",
] as const satisfies readonly CornerDotType[];

type PreviewFocus = "dots" | "cornersSquare" | "cornersDot";

const PREVIEW_BG_COLOR = "#FFFFFF";
const INACTIVE_COLOR = "#D1D5DB";

const buildPreviewOptions = (params: {
  focus: PreviewFocus;

  dotsType: DotType;
  dotsColor: string;

  cornersSquareType: CornerSquareType;
  cornersSquareColor: string;

  cornersDotType: CornerDotType;
  cornersDotColor: string;
}): Options => {
  const dotsColor =
    params.focus === "dots" ? params.dotsColor : INACTIVE_COLOR;

  const cornersSquareColor =
    params.focus === "cornersSquare"
      ? params.cornersSquareColor
      : INACTIVE_COLOR;

  const cornersDotColor =
    params.focus === "cornersDot" ? params.cornersDotColor : INACTIVE_COLOR;

  return {
    backgroundOptions: { color: PREVIEW_BG_COLOR },

    dotsOptions: { type: params.dotsType, color: dotsColor },

    cornersSquareOptions: {
      type: params.cornersSquareType,
      color: cornersSquareColor,
    },

    cornersDotOptions: {
      type: params.cornersDotType,
      color: cornersDotColor,
    },
  };
};

export const StylesTab = () => {
  const qrSettings = useQrGeneratorStore((state) => state.qrSettings);
  const setQrSettings = useQrGeneratorStore((state) => state.setQrSettings);

  return (
    <div className="pt-6">
      {/* Стиль формы */}
      <div className="mb-8">
        <div className="text-[16px] font-semibold text-gray-900">Стиль формы</div>

        <div className="mt-3 flex flex-wrap gap-2">
          {DOT_TYPES.map((dotsType) => (
            <QrStylePreviewButton
              key={dotsType}
              isActive={qrSettings.dotsType === dotsType}
              onClick={() =>
                setQrSettings({ dotsTypeMode: "manual", dotsType })
              }
              options={buildPreviewOptions({
                focus: "dots",
                dotsType,
                dotsColor: qrSettings.dotsColor,
                cornersSquareType: qrSettings.cornersSquareType,
                cornersSquareColor: qrSettings.cornersSquareColor,
                cornersDotType: qrSettings.cornersDotType,
                cornersDotColor: qrSettings.cornersDotColor,
              })}
            />
          ))}
        </div>

        <div className="mt-3">
          <ZoneColorField
            label="Цвет"
            value={qrSettings.dotsColor}
            onChange={(nextColor) => setQrSettings({ dotsColor: nextColor })}
          />
        </div>
      </div>

      {/* Стиль внешних границ */}
      <div className="mb-8">
        <div className="text-[16px] font-semibold text-gray-900">
          Стиль внешних границ
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {CORNER_SQUARE_TYPES.map((cornersSquareType) => (
            <QrStylePreviewButton
              key={cornersSquareType}
              isActive={qrSettings.cornersSquareType === cornersSquareType}
              onClick={() =>
                setQrSettings({
                  cornersSquareTypeMode: "manual",
                  cornersSquareType,
                })
              }
              options={buildPreviewOptions({
                focus: "cornersSquare",
                dotsType: qrSettings.dotsType,
                dotsColor: qrSettings.dotsColor,
                cornersSquareType,
                cornersSquareColor: qrSettings.cornersSquareColor,
                cornersDotType: qrSettings.cornersDotType,
                cornersDotColor: qrSettings.cornersDotColor,
              })}
            />
          ))}
        </div>

        <div className="mt-3">
          <ZoneColorField
            label="Цвет"
            value={qrSettings.cornersSquareColor}
            onChange={(nextColor) =>
              setQrSettings({ cornersSquareColor: nextColor })
            }
          />
        </div>
      </div>

      {/* Стиль внутренних границ */}
      <div>
        <div className="text-[16px] font-semibold text-gray-900">
          Стиль внутренних границ
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {CORNER_DOT_TYPES.map((cornersDotType) => (
            <QrStylePreviewButton
              key={cornersDotType}
              isActive={qrSettings.cornersDotType === cornersDotType}
              onClick={() =>
                setQrSettings({ cornersDotTypeMode: "manual", cornersDotType })
              }
              options={buildPreviewOptions({
                focus: "cornersDot",
                dotsType: qrSettings.dotsType,
                dotsColor: qrSettings.dotsColor,
                cornersSquareType: qrSettings.cornersSquareType,
                cornersSquareColor: qrSettings.cornersSquareColor,
                cornersDotType,
                cornersDotColor: qrSettings.cornersDotColor,
              })}
            />
          ))}
        </div>

        <div className="mt-3">
          <ZoneColorField
            label="Цвет"
            value={qrSettings.cornersDotColor}
            onChange={(nextColor) =>
              setQrSettings({ cornersDotColor: nextColor })
            }
          />
        </div>
      </div>
    </div>
  );
};
