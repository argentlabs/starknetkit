import { IconButton } from "./IconButton"

type HeaderProps = {
  title: string
  subtitle: string
  showBackButton: boolean
  showCloseButton: boolean
  handleBack: () => void
  handleClose: () => void
}

export function Header({
  title,
  subtitle,
  showBackButton,
  showCloseButton,
  handleBack,
  handleClose,
}: HeaderProps) {
  return (
    <header className={`flex items-center justify-center flex-col relative`}>
      {showBackButton && (
        <IconButton handleClick={handleBack} className="absolute top-0 left-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.55383 1.24376C8.83406 1.54808 8.81134 2.01905 8.50309 2.2957L4.37567 6L8.50309 9.7043C8.81134 9.98095 8.83406 10.4519 8.55383 10.7562C8.2736 11.0606 7.79654 11.083 7.48828 10.8063L2.74691 6.55102C2.58965 6.40989 2.5 6.20981 2.5 6C2.5 5.79019 2.58965 5.59012 2.74691 5.44898L7.48828 1.19367C7.79654 0.917013 8.2736 0.93944 8.55383 1.24376Z"
              fill="currentColor"
            />
          </svg>
        </IconButton>
      )}
      <hgroup>
        <h2 className={`text-p3 text-secondary font-semibold`}>{subtitle}</h2>
        {!!title && (
          <h1
            className={`text-[24px] text-primary font-semibold max-w-[240px] overflow-hidden whitespace-nowrap text-ellipsis`}
          >
            {title}
          </h1>
        )}
      </hgroup>
      {showCloseButton && (
        <IconButton
          handleClick={handleClose}
          className="absolute top-0 right-0"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.77275 3.02275C9.99242 2.80308 9.99242 2.44692 9.77275 2.22725C9.55308 2.00758 9.19692 2.00758 8.97725 2.22725L6 5.20451L3.02275 2.22725C2.80308 2.00758 2.44692 2.00758 2.22725 2.22725C2.00758 2.44692 2.00758 2.80308 2.22725 3.02275L5.20451 6L2.22725 8.97725C2.00758 9.19692 2.00758 9.55308 2.22725 9.77275C2.44692 9.99242 2.80308 9.99242 3.02275 9.77275L6 6.79549L8.97725 9.77275C9.19692 9.99242 9.55308 9.99242 9.77275 9.77275C9.99242 9.55308 9.99242 9.19692 9.77275 8.97725L6.79549 6L9.77275 3.02275Z"
              fill="currentColor"
            />
          </svg>
        </IconButton>
      )}
    </header>
  )
}
