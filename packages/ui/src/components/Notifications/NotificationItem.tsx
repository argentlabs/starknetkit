import { FC } from "react"

interface NotificationItemProps {
  action: string
  description: string
  isUnread?: boolean
  time: string
}

const NotificationItem: FC<NotificationItemProps> = ({
  action,
  description,
  isUnread,
  time,
}) => {
  return (
    <button
      onClick={() => console.log("TODO")}
      className="flex items-center px-6 py-5 border border-solid border-neutrals.200 rounded-lg w-full hover:bg-[#F0F0F0]"
    >
      <div className="flex flex-1">
        <div className="flex flex-col justify-center mr-4">
          {/* TODO: remove hardcode - decide how to manage icons in notifications */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.9016 10.564C17.3511 10.1351 17.3679 9.423 16.939 8.97345C16.5101 8.52389 15.798 8.50713 15.3484 8.93601L10.6225 13.4445L8.65225 11.5617C8.20306 11.1324 7.49093 11.1486 7.06167 11.5978C6.63241 12.0469 6.64856 12.7591 7.09775 13.1883L9.84463 15.8133C10.2792 16.2286 10.9635 16.2289 11.3984 15.814L16.9016 10.564Z"
              fill="#08A681"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M12 1.875C6.40812 1.875 1.875 6.40812 1.875 12C1.875 17.5919 6.40812 22.125 12 22.125C17.5919 22.125 22.125 17.5919 22.125 12C22.125 6.40812 17.5919 1.875 12 1.875ZM4.125 12C4.125 7.65076 7.65076 4.125 12 4.125C16.3492 4.125 19.875 7.65076 19.875 12C19.875 16.3492 16.3492 19.875 12 19.875C7.65076 19.875 4.125 16.3492 4.125 12Z"
              fill="#08A681"
            />
          </svg>
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
