import React from 'react'

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number
}

export const IconGenerationQr = ({
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
      d="m10.004 13.005.954.954a4.002 4.002 0 0 0 5.659 0l3.032-3.032a4.643 4.643 0 0 0 0-6.566 4.643 4.643 0 0 0-6.566 0l-.887.888"
    />
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m14.006 10.004-.954-.953a4.001 4.001 0 0 0-5.659 0l-3.032 3.032a4.643 4.643 0 0 0 0 6.566 4.643 4.643 0 0 0 6.566 0l.887-.889"
    />
  </svg>
)
