import React from 'react'

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number
}

export const IconDelete = ({
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
      d="M15.95 6.5V4.25c0-.69-.56-1.25-1.25-1.25H9.2c-.691 0-1.25.56-1.25 1.25V6.5M18.69 6.5l-.956 12.423A2.25 2.25 0 0 1 15.491 21H8.408a2.25 2.25 0 0 1-2.243-2.077L5.209 6.5M19.95 6.5h-16M11.95 11.688v4"
    />
  </svg>
)
