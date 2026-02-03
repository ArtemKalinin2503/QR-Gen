import React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

export const IconStylesQr = ({
  size = 20,
  color = "currentColor",
  ...svgProps
}: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    {...svgProps}
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8 9H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1ZM8 21H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1ZM20 9h-4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1Z"
      clipRule="evenodd"
    />
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M7 12h2M12 5V3M16 12h-3a1 1 0 0 1-1-1V9M4 12H3M15 18h-2a1 1 0 0 0-1 1v2M12 15h6M21 15v5a1 1 0 0 1-1 1h-5M6 5.99c-.003 0-.005.002-.005.005S5.997 6 6 6s.005-.002.005-.005S6.003 5.99 6 5.99M17.995 5.995c-.003 0-.005.002-.005.005s.002.005.005.005S18 6.003 18 6s-.002-.005-.005-.005M18.995 11.995c-.003 0-.005.002-.005.005s.002.005.005.005S19 12.003 19 12s-.002-.005-.005-.005"
    />
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M17.995 17.995c-.003 0-.005.002-.005.005s.002.005.005.005S18 18.003 18 18s-.002-.005-.005-.005M6.005 17.995c-.003 0-.005.002-.005.005s.002.005.005.005.005-.002.005-.005-.002-.005-.005-.005"
    />
  </svg>
);
