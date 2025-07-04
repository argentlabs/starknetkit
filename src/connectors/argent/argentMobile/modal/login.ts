import SignClient from "@walletconnect/sign-client"
import type { SignClientTypes } from "@walletconnect/types"
import { RpcProvider, constants } from "starknet"
import type { NamespaceAdapter, NamespaceAdapterOptions } from "./adapter"
import { argentModal } from "./argentModal"
import { resetWalletConnect } from "../../../../helpers/resetWalletConnect"
import { type ModalWallet } from "../../../../types/modal"

// Using NetworkName as a value.
const Network: typeof constants.NetworkName = constants.NetworkName

export interface IArgentLoginOptions {
  projectId?: string
  name?: string
  description?: string
  url?: string
  icons?: string[]
  chainId?: string | number
  rpcUrl?: string
  bridgeUrl?: string
  mobileUrl?: string
  modalType?: "overlay" | "window"
  walletConnect?: SignClientTypes.Options
  onlyQRCode?: boolean
  modalWallet?: ModalWallet
}

export const login = async <TAdapter extends NamespaceAdapter>(
  {
    projectId,
    chainId,
    name,
    description,
    rpcUrl,
    bridgeUrl = getBridgeUrl(chainId),
    mobileUrl = getMobileUrl(chainId),
    modalType = "overlay",
    url,
    icons,
    walletConnect,
    onlyQRCode,
    modalWallet,
  }: IArgentLoginOptions,
  Adapter: new (options: NamespaceAdapterOptions) => TAdapter,
): Promise<TAdapter | null> => {
  if (!bridgeUrl) {
    throw new Error("bridgeUrl is required")
  }

  if (!mobileUrl) {
    throw new Error("mobileUrl is required")
  }
  argentModal.bridgeUrl = bridgeUrl
  argentModal.mobileUrl = mobileUrl
  argentModal.type = modalType

  const signClientOptions = {
    projectId,
    metadata: {
      name: name ?? "Unknown dapp",
      description: description ?? "Unknown dapp description",
      url: url ?? "#",
      icons: icons ?? [],
      ...walletConnect?.metadata,
    },
  }

  const client = await SignClient.init(signClientOptions)

  // TODO: remove provider and use rpcUrl directly
  const provider = new RpcProvider({ nodeUrl: rpcUrl })

  const adapter = new Adapter({ client, chainId, rpcUrl, provider })

  client.on("session_event", (_) => {
    // Handle session events, such as "chainChanged", "accountsChanged", etc.
  })

  client.on("session_update", ({ topic, params }) => {
    const { namespaces } = params
    const session = client.session.get(topic)
    // Overwrite the `namespaces` of the existing session with the incoming one.
    // Integrate the updated session state into your dapp state.
    adapter.updateSession({ ...session, namespaces })
  })

  client.on("session_delete", () => {
    // Session was deleted -> reset the dapp state, clean up from user session, etc.
  })

  try {
    const session = client.session.getAll().find(adapter.isValidSession)
    if (session) {
      adapter.updateSession(session)
      return adapter
    }

    const params = { requiredNamespaces: adapter.getRequiredNamespaces() }

    resetWalletConnect()
    // wait for cookies to be removed and reset the websocket for walletconnect
    await new Promise((resolve) => setTimeout(resolve, 200))
    const { uri, approval } = await client.connect(params)

    // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
    if (uri) {
      if (onlyQRCode) {
        argentModal.getWalletConnectQR(uri)
      } else {
        argentModal.showWalletConnectModal(uri, {
          ...modalWallet,
          dappName: name || "",
        } as ModalWallet & { dappName: string })
      }
      argentModal.wcUri = uri

      // Await session approval from the wallet.
      const session = await approval()
      adapter.updateSession(session)
      argentModal.closeModal({ success: true })
    }

    return adapter
  } catch (error) {
    console.error("@argent/login::error")
    argentModal.closeModal()
    return null
  }
}

const getBridgeUrl = (chainId: unknown) => {
  if (!chainId) {
    throw new Error(
      `Unknown or unsupported chainId (${chainId}), either specify a supported chain or set bridgeUrl.`,
    )
  }
  const chainIdNumber = parseInt(`${chainId}`)
  if (
    String(chainId).startsWith(Network.SN_SEPOLIA) ||
    chainIdNumber === 11155111 // sepolia numeric value
  ) {
    return "https://mobile-login.hydrogen.argent47.net"
  }

  if (
    String(chainId).startsWith(Network.SN_MAIN) ||
    chainIdNumber === 1 // mainnet numeric value
  ) {
    return "https://login.argent.xyz"
  }
}

const getMobileUrl = (chainId: unknown) => {
  if (!chainId) {
    throw new Error(
      `Unknown or unsupported chainId (${chainId}), either specify a supported chain or set mobileUrl.`,
    )
  }
  const chainIdNumber = parseInt(`${chainId}`)
  if (
    String(chainId).startsWith(Network.SN_SEPOLIA) ||
    chainIdNumber === 11155111 // sepolia numeric value
  ) {
    return "argent-dev://"
  }

  if (
    String(chainId).startsWith(Network.SN_MAIN) ||
    chainIdNumber === 1 // mainnet numeric value
  ) {
    return "argent://"
  }
}
