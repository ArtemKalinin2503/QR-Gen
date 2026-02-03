import React from 'react'

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number
}

export const IconBusinessCard = ({
  size = 22,
  color = 'currentColor',
  ...svgProps
}: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={19}
    fill="none"
    viewBox="0 0 22 19"
    {...svgProps}
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8.841 5.409a2.25 2.25 0 1 1-3.182 3.182 2.25 2.25 0 0 1 3.182-3.182"
    />
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M.75 15.75V2.791C.75 1.664 1.664.75 2.791.75H18.75a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-16a2 2 0 0 1-2-2Z"
      clipRule="evenodd"
    />
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13.75 6.75h4M16.15 10.75h-2.4M10.845 13.75a3.17 3.17 0 0 0-.792-1.154 3.172 3.172 0 0 0-2.157-.846H6.604c-.8 0-1.57.302-2.157.846a3.17 3.17 0 0 0-.792 1.154"
    />
  </svg>
)
