import React from 'react'

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number
}

export const IconEmail = ({
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
      d="M16 12a4 4 0 1 1-4-4 4 4 0 0 1 4 4v1.5a2.5 2.5 0 1 0 5 0V12a9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 12.444 8.315 8.974 8.974 0 0 0 1.689-.929"
    />
  </svg>
)
