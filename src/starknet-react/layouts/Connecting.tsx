import { injectedWalletIcons } from "../../connectors"
import { FallbackConnector } from "../components/FallbackConnector"

type ConnectingProps = {
  theme: "dark" | "light"
  walletName: string
  showFallback: boolean
  handleFallback: () => void
}

export function Connecting({
  theme,
  walletName,
  showFallback,
  handleFallback,
}: ConnectingProps) {
  return (
    <section className="flex flex-col justify-center items-center flex-grow">
      <div className="flex flex-col h-full justify-center items-center gap-4 w-full flex-grow">
        <div className="bg-button-secondary rounded-full p-5">
          <img
            src={injectedWalletIcons["argentX"][theme]}
            className="w-8 h-8 rounded"
            alt=""
          />
        </div>

        <h3 className="text-primary text-h4 font-bold">
          Connecting to {walletName}...
        </h3>
      </div>

      {showFallback && <FallbackConnector handleClick={handleFallback} />}
    </section>
  )
}
