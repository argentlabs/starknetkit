import { FC } from "react"
import { SuccessIcon } from "../../icons/SuccessIcon"

interface NotificationItemProps {
  action: string
  description: string
  isUnread?: boolean
  time: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNotificationClick?: (notification: any) => void // TODO: remove any
}

const NotificationItem: FC<NotificationItemProps> = ({
  action,
  description,
  isUnread,
  time,
  onNotificationClick,
}) => {
  const txHash = "0x123" // TODO: remove hardcoded txHash and get from transaction

  return (
    <button
      onClick={() =>
        onNotificationClick
          ? onNotificationClick({})
          : window.open(`https://starkscan.co/tx/${txHash}`, "_blank")
      }
      className="flex items-center px-6 py-5 border border-solid border-neutrals.200 rounded-lg w-full hover:bg-[#F0F0F0]"
    >
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
          <p className="font-barlow text-xs leading-4 font-normal text-neutral-400">
            {time}
          </p>
        </div>

        <div className="flex flex-1" />

        <div className="flex flex-col justify-center items-end relative w-6">
          {isUnread && (
            <div
              className="rounded-full w-2.5 h-2.5 mt-2"
              style={{ backgroundColor: "#29C5FF" }}
            />
          )}
        </div>
      </div>
    </button>
  )
}

export { NotificationItem }
