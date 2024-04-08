import type { CreateTRPCProxyClient } from "@trpc/client"
import type { AppRouter } from "../helpers/trpc"
import type { WebWalletStarknetWindowObject } from "./argentStarknetWindowObject"
import { getArgentStarknetWindowObject } from "./argentStarknetWindowObject"
import { hideModal, setIframeHeight, showModal } from "./wormhole"
import { mapTargetUrlToNodeUrl } from "../helpers/mapTargetUrlToNodeUrl"
import { ProviderInterface, RpcProvider } from "starknet"

type IframeProps = {
  modal: HTMLDivElement
  iframe: HTMLIFrameElement
}

type ModalEvents =
  | {
      action: "show" | "hide"
      visible: boolean
    }
  | { action: "updateHeight"; height: number }

export const getWebWalletStarknetObject = async (
  target: string,
  proxyLink: CreateTRPCProxyClient<AppRouter>,
  provider?: ProviderInterface,
  iframeProps?: IframeProps,
): Promise<WebWalletStarknetWindowObject> => {
  const globalWindow = typeof window !== "undefined" ? window : undefined
  if (!globalWindow) {
    throw new Error("window is not defined")
  }

  const nodeUrl = mapTargetUrlToNodeUrl(target)
  const defaultProvider = provider ?? new RpcProvider({ nodeUrl })
  const starknetWindowObject = getArgentStarknetWindowObject(
    {
      host: globalWindow.location.origin,
      id: "argentWebWallet",
      icon: "https://www.argent.xyz/favicon.ico",
      name: "Argent Web Wallet",
      version: "1.0.0",
    },
    defaultProvider,
    proxyLink,
  )

  if (iframeProps) {
    const { iframe, modal } = iframeProps

    proxyLink.updateModal.subscribe.apply(null, [
      undefined,
      {
        onData(modalEvent: ModalEvents) {
          switch (modalEvent.action) {
            case "show":
              showModal(modal)
              break
            case "hide":
              hideModal(modal)
              break
            case "updateHeight":
              setIframeHeight(iframe, modalEvent.height)
          }
        },
      },
    ])
  }

  return starknetWindowObject
}
