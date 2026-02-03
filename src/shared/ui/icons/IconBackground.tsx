import React from 'react'

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number
}

export const IconBackground = ({
  size = 24,
  color = 'currentColor',
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
      d="M14.778 7H9.222A2.222 2.222 0 0 0 7 9.222v5.556C7 16.005 7.995 17 9.222 17h5.556A2.222 2.222 0 0 0 17 14.778V9.221A2.222 2.222 0 0 0 14.778 7Z"
      clipRule="evenodd"
    />
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10.51 10.157a.25.25 0 1 1-.353.354.25.25 0 0 1 .353-.354M17 11.5a4.822 4.822 0 0 0-5.5 5.5M15 21h2a4 4 0 0 0 4-4v-1.4M8.4 3H7a4 4 0 0 0-4 4v1.4M3 15.6V17a4 4 0 0 0 4 4h1.4M21 8.4V7a4 4 0 0 0-4-4h-2"
    />
  </svg>
)
