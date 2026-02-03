import React from 'react'

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number
}

export const IconSectionText = ({
  size = 25,
  color = 'currentColor',
  ...svgProps
}: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 25 25"
    {...svgProps}
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.004 9.754h6.002M12.005 9.754v5.502"
    />
    <rect
      width={18.008}
      height={18.008}
      x={3.001}
      y={3.001}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      rx={5}
    />
  </svg>
)
