import type { PropsWithChildren } from "react"

type IconButtonProps = PropsWithChildren<{
  handleClick: () => void
  className?: string
}>

export function IconButton({
  children,
  handleClick,
  className = "",
}: IconButtonProps) {
  return (
    <button
      onClick={handleClick}
      onKeyUp={(e) => {
        if (e.key === "Enter") {
          handleClick()
        }
      }}
      className={`
    p-2 cursor-pointer text-primary rounded-full bg-surface-elevated-web
		focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700
		transition-colors ${className}
  `}
      rel="noreferrer noopener"
      role="button"
    >
      {children}
    </button>
  )
}
