import type { SVGProps } from "react"

const FailureIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M4.89573 4.78578C4.87632 4.80271 4.85736 4.82041 4.83888 4.83889C4.8204 4.85737 4.80269 4.87633 4.78577 4.89574C2.98572 6.72348 1.875 9.23203 1.875 12C1.875 17.5919 6.40812 22.125 12 22.125C14.7679 22.125 17.2764 21.0143 19.1042 19.2143C19.1236 19.1974 19.1426 19.1796 19.1611 19.1611C19.1796 19.1426 19.1974 19.1236 19.2143 19.1042C21.0143 17.2765 22.125 14.7679 22.125 12C22.125 6.40812 17.5919 1.875 12 1.875C9.23202 1.875 6.72346 2.98572 4.89573 4.78578ZM7.2838 5.69282C8.59846 4.70821 10.2311 4.125 12 4.125C16.3492 4.125 19.875 7.65076 19.875 12C19.875 13.7689 19.2918 15.4015 18.3072 16.7162L7.2838 5.69282ZM16.7162 18.3072C15.4015 19.2918 13.7689 19.875 12 19.875C7.65076 19.875 4.125 16.3492 4.125 12C4.125 10.2311 4.7082 8.59847 5.69281 7.28381L16.7162 18.3072Z"
      fill="#DB3B4E"
    />
  </svg>
)

export { FailureIcon }
