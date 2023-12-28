import type { SVGProps } from "react"

const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M19.5455 6.0455C19.9848 5.60616 19.9848 4.89384 19.5455 4.4545C19.1062 4.01517 18.3938 4.01517 17.9545 4.4545L12 10.409L6.0455 4.4545C5.60616 4.01517 4.89384 4.01517 4.4545 4.4545C4.01517 4.89384 4.01517 5.60616 4.4545 6.0455L10.409 12L4.4545 17.9545C4.01517 18.3938 4.01517 19.1062 4.4545 19.5455C4.89384 19.9848 5.60616 19.9848 6.0455 19.5455L12 13.591L17.9545 19.5455C18.3938 19.9848 19.1062 19.9848 19.5455 19.5455C19.9848 19.1062 19.9848 18.3938 19.5455 17.9545L13.591 12L19.5455 6.0455Z"
      fill="#BFBFBF"
    />
  </svg>
)

export { CloseIcon }
