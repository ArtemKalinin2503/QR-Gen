import React from 'react'

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number
}

export const IconGenDownloadQr = ({
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
      d="M12 16a4 4 0 0 1 4-4 4 4 0 0 1-4-4 4 4 0 0 1-4 4 4 4 0 0 1 4 4Z"
      clipRule="evenodd"
    />
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M21 12a9 9 0 1 1-9-9"
    />
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M19 8a3 3 0 0 1 3-3 3 3 0 0 1-3-3 3 3 0 0 1-3 3 3 3 0 0 1 3 3Z"
      clipRule="evenodd"
    />
  </svg>
)
