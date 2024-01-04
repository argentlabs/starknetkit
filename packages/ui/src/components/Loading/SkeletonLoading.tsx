import { FC } from "react"

const SkeletonLoading: FC = () => (
  <>
    <style>
      {`.skeleton {
            animation: skeleton-loading 1s linear infinite alternate;
          }
          
          @keyframes skeleton-loading {
            0% {
              background-color: hsl(200, 20%, 80%);
            }
            100% {
              background-color: hsl(200, 20%, 95%);
            }
          }
        `}
    </style>
    <div className={`skeleton flex flex-1 w-full h-full`} />
  </>
)

export { SkeletonLoading }
