import type { SVGProps } from "react"

const ProfileIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M7.715 14.693a7.125 7.125 0 1 1 8.57 0 11.619 11.619 0 0 1 5.783 4.995 1.125 1.125 0 1 1-1.949 1.124 9.376 9.376 0 0 0-16.238 0 1.125 1.125 0 0 1-1.95-1.124 11.625 11.625 0 0 1 5.784-4.995ZM7.125 9a4.875 4.875 0 1 1 4.951 4.874h-.152A4.875 4.875 0 0 1 7.125 9Z"
      clipRule="evenodd"
    />
  </svg>
)

export { ProfileIcon }
