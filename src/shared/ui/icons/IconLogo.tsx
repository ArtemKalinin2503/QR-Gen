import React from 'react'

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number
}

export const IconLogo = ({
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
      d="M21 15.999V8.001a1.99 1.99 0 0 0-1.002-1.728L12.99 2.26a1.991 1.991 0 0 0-1.979 0L4.002 6.273A1.99 1.99 0 0 0 3 8v7.997a1.99 1.99 0 0 0 1.002 1.728l7.008 4.013a1.991 1.991 0 0 0 1.979 0l7.008-4.013A1.987 1.987 0 0 0 21 15.999Z"
      clipRule="evenodd"
    />
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m12 12-8.71 5.03M12 12l8.71-5.03M12 12V2M12 12v10M12 12 3.29 6.97M12 12l8.71 5.03"
    />
  </svg>
)
