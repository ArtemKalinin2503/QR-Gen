import React from 'react'

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number
}

export const IconResetParams = ({
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
      d="m7.327 17.364-1.69 1a9 9 0 0 0 12.727 0c2.497-2.497 3.211-6.094 2.16-9.23M16.673 6.636l1.69-1a9 9 0 0 0-12.727 0c-2.497 2.497-3.211 6.095-2.16 9.23M11.996 9v1.131M11.996 14.626v1.131M9.073 10.69l.98.557M13.956 13.51l.962.558M9.073 14.068l.98-.558M13.956 11.247l.962-.558"
    />
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M11.996 10.126a2.252 2.252 0 1 1 0 4.505 2.252 2.252 0 0 1 0-4.505"
    />
  </svg>
)
