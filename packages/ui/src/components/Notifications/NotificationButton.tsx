import { FC, useEffect, useRef, useState } from "react"
import { BellIcon } from "../../icons/BellIcon"
import { NotificationMenu } from "./NotificationMenu"

interface Notification {
  action: string
  description: string
  isUnread?: boolean
  time: string
}

interface NotificationButtonProps {
  address?: string
  hasNotifications?: boolean
  notifications: Notification[]
}

const NotificationButton: FC<NotificationButtonProps> = ({
  hasNotifications,
  notifications,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const toggleMenu = () => {
    setIsOpen((prev) => !prev)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center shadow-list-item rounded-lg h-10 w-10 bg-white"
      >
        <div className="relative">
          <BellIcon className="w-6 h-6" />
          {hasNotifications && (
            <div className="w-[10px] h-[10px] absolute top-0 right-1 rounded-full p-1 z-10 bg-white">
              <div className="w-2 h-2 bg-[#29C5FF] rounded-full absolute transform -translate-y-2/3"></div>
            </div>
          )}
        </div>
      </button>
      <div
        className={`absolute top-10 mt-0.5 w-50 rounded-lg shadow-lg z-20 text-black bg-white ${
          !isOpen ? "hidden" : ""
        }`}
      >
        <NotificationMenu
          notifications={notifications}
          toggleMenu={toggleMenu}
        />
      </div>
    </div>
  )
}

export { NotificationButton }
