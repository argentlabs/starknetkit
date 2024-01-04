import { FC } from "react"
import { BellIcon } from "../icons/BellIcon"

interface NotificationButtonProps {
  address?: string
  hasNotifications?: boolean
}

const NotificationButton: FC<NotificationButtonProps> = ({
  hasNotifications,
}) => {
  return (
    <button
      onClick={() => console.log("asd")}
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
  )
}

export { NotificationButton }
