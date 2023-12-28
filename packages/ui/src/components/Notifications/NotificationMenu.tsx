import { FC, useMemo } from "react"
import { CloseIcon } from "../../icons/CloseIcon"
import { NotificationItem } from "./NotificationItem"

// TODO: discuss structure
interface Notification {
  action: string
  description: string
  isUnread?: boolean
  time: string
}

interface NotificationMenuProps {
  notifications: Notification[]
  toggleMenu: () => void
}

const NotificationMenu: FC<NotificationMenuProps> = ({
  notifications,
  toggleMenu,
}) => {
  const totalUnread = useMemo(
    () =>
      notifications?.filter((notification) => notification.isUnread).length ??
      0,
    [notifications],
  )

  return (
    <div className="w-112.5 font-barlow shadow-list-item rounded-lg bg-white">
      <div className="flex flex-col px-5 py-4">
        <div className="flex justify-center">
          <h5 className="text-xl leading-6 font-semibold">Notifications</h5>
          {totalUnread > 0 && (
            <div
              className="flex rounded-full w-6 h-6 justify-center items-center ml-2"
              style={{ backgroundColor: "#29C5FF" }}
            >
              <span className="text-sm font-bold leading-3.5 letter text-white">
                {totalUnread}
              </span>
            </div>
          )}
          <div className="flex flex-1" />
          <CloseIcon cursor="pointer" onClick={toggleMenu} />
        </div>

        {notifications?.length > 0 ? (
          <div className="flex flex-col gap-1 p-2">
            {notifications?.map((notification) => (
              <NotificationItem {...notification} />
            ))}
          </div>
        ) : (
          <p className="font-barlow text-base text-start leading-5 font-medium text-neutral-600 px-5 pb-3">
            No new notifications
          </p>
        )}
      </div>
    </div>
  )
}

export { NotificationMenu }
