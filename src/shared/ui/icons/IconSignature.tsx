import React from 'react'

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number
}

export const IconSignature = ({
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
      d="M17.379 4.62a2.122 2.122 0 0 1 0 3l-9.987 9.988a2.001 2.001 0 0 1-.929.526L3 19l.866-3.463a2 2 0 0 1 .526-.929l9.988-9.987a2.121 2.121 0 0 1 2.999 0Z"
      clipRule="evenodd"
    />
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m15.5 9.5-3-3M21 18l-1.094 1.094a3.094 3.094 0 0 1-4.375 0 3.1 3.1 0 0 0-4.376 0"
    />
  </svg>
)
