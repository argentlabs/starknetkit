import { FC, useEffect, useMemo, useState } from "react"
import { CloseIcon } from "../../icons/CloseIcon"
import { SuccessIcon } from "../../icons/SuccessIcon"

type vertical = "top" | "center" | "bottom"
type horizontal = "left" | "center" | "right"

interface ActivityToastProps {
  action: string
  description: string
  showToast?: boolean
  closeToast: () => void
  duration?: 1000 | 2000 | 3000 | 4000 | 5000
  vertical?: vertical
  horizontal?: horizontal
}

const durationMap = {
  1000: "duration-1000",
  2000: "duration-2000",
  3000: "duration-3000",
  4000: "duration-4000",
  5000: "duration-5000",
}

const ActivityToast: FC<ActivityToastProps> = ({
  action,
  description,
  showToast,
  closeToast,
  duration = 5000,
  vertical = "bottom",
  horizontal = "center",
}) => {
  return showToast ? (
    <ActivityToastComponent
      action={action}
      description={description}
      closeToast={closeToast}
      duration={duration}
      vertical={vertical}
      horizontal={horizontal}
    />
  ) : null
}

const ActivityToastComponent: FC<ActivityToastProps> = ({
  action,
  description,
  closeToast,
  duration = 5000,
  vertical = "bottom",
  horizontal = "center",
}) => {
  const [isActive, setIsActive] = useState(true)
  useEffect(() => {
    // ensure that the toast is visible, setting the width to full for the progression bar
    setTimeout(() => setIsActive(false), 10)
    const timeout = setTimeout(() => closeToast(), duration)
    return () => {
      closeToast()
      clearTimeout(timeout)
    }
  }, [])

  const position = useMemo(() => {
    let v, h

    switch (horizontal) {
      case "left":
        h = `left-2`
        break
      case "center":
        h = `left-2/4 transform -translate-x-2/4`
        break
      case "right":
        h = `right-2`
        break
      default:
        h = `left-2/4`
        break
    }

    switch (vertical) {
      case "top":
        v = `top-2`
        break
      case "center":
        v = `top-2/4 transform -translate-y-2/4`
        break
      case "bottom":
        v = `bottom-2`
        break
      default:
        v = `top-2/4`
        break
    }

    return `${v} ${h}`
  }, [vertical, horizontal])

  return (
    <div className={`fixed ${position}`}>
      <div className="relative p-5 bg-white rounded-lg overflow-hidden shadow-lg border border-solid border-neutrals.200 w-96">
        <div className="flex flex-1">
          <div className="flex flex-col justify-center mr-4">
            {/* TODO: remove hardcoded icon - wait for transaction info */}
            <SuccessIcon />
          </div>
          <div className="flex flex-col items-start">
            <h5 className="font-barlow text-xl leading-6 font-semibold">
              {action}
            </h5>
            <p className="font-barlow text-base text-start leading-5 font-medium text-neutral-600 mt-0.5 mb-1">
              {description}
            </p>
          </div>

          <div className="flex flex-1" />

          <div className="flex flex-col justify-center items-end relative w-6">
            <CloseIcon cursor="pointer" onClick={closeToast} />
          </div>
        </div>
        <div
          className={`absolute bottom-0 left-0 right-0 h-1 transition-all ${
            durationMap[duration]
          } ease-linear ${isActive ? "w-full" : "w-0"}`}
          style={{ backgroundColor: "#197AA6" }}
        />
      </div>
    </div>
  )
}

export { ActivityToast }
