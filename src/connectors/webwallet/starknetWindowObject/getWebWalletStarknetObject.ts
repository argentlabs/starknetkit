import type { CreateTRPCProxyClient } from "@trpc/client"
import type { AppRouter } from "../helpers/trpc"
import type { WebWalletStarknetWindowObject } from "./argentStarknetWindowObject"
import { getArgentStarknetWindowObject } from "./argentStarknetWindowObject"
import { hideModal, showModal, updateSize } from "./wormhole"

type IframeProps = {
  iframe: HTMLIFrameElement
  backdrop: HTMLDivElement
}

export type ModalEvents =
  | {
      action: "show" | "hide"
      visible: boolean
    }
  | { action: "updateHeight"; height: number }
  | { action: "updateWidth"; width: number }
  | { action: "updateSize"; width: number; height: number }

export const getWebWalletStarknetObject = async (
  target: string,
  proxyLink: CreateTRPCProxyClient<AppRouter>,
  iframeProps?: IframeProps,
): Promise<WebWalletStarknetWindowObject> => {
  const globalWindow = typeof window !== "undefined" ? window : undefined
  if (!globalWindow) {
    throw new Error("window is not defined")
  }
  const starknetWindowObject = getArgentStarknetWindowObject(
    {
      host: globalWindow.location.origin,
      id: "argentWebWallet",
      icon: "https://www.ready.co/favicon.ico",
      name: "Web Wallet",
      version: "1.0.0",
    },
    proxyLink,
  )

  if (iframeProps) {
    const { iframe, backdrop } = iframeProps
    proxyLink.updateModal.subscribe(undefined, {
      onData(modalEvent: ModalEvents) {
        switch (modalEvent.action) {
          case "show":
            showModal(iframe, backdrop)
            break
          case "hide":
            hideModal(iframe, backdrop)
            break
          case "updateSize":
            updateSize(iframe, modalEvent.width, modalEvent.height)
            break
        }
      },
    })
  }

  return starknetWindowObject
}
