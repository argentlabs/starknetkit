import { getDevice } from "../../../../helpers/getDevice"
import Modal from "../../../../modal/Modal.svelte"
import { Layout, type ModalWallet } from "../../../../types/modal"
import { getModalTarget } from "../../../../helpers/modal"
import type { StarknetkitConnector } from "../../../connector"
import { isInArgentMobileAppBrowser } from "../../helpers"

const device = getDevice()

export interface RequestArguments {
  method: string
  params?: unknown[] | object
}

const iframeStyleOnlyQR = {
  width: "245px",
  height: "245px",
  borderRadius: "40px",
  zIndex: "99999",
  backgroundColor: "white",
  border: "none",
  outline: "none",
}

const overlayHtmlOnlyQR = `
  <div id="argent-mobile-modal-container" style="position: relative; display: flex; justify-content: center; align-items: center">
    <iframe class="argent-iframe" allow="clipboard-write"></iframe>
  </div>
`

interface Urls {
  readonly desktop: string
  readonly ios: string
  readonly android: string
}

type ModalWalletExtended = ModalWallet & { dappName: string }

class ArgentModal {
  public bridgeUrl = "https://login.ready.co"
  public mobileUrl = "ready://"
  public type: "overlay" | "window" = "overlay"
  public wcUri?: string

  private overlay?: HTMLDivElement
  private popupWindow?: Window
  private closingTimeout?: NodeJS.Timeout
  private standaloneConnectorModal?: Modal

  public showWalletConnectModal(
    wcUri: string,
    modalWallet: ModalWalletExtended,
  ) {
    const wcParam = encodeURIComponent(wcUri)
    const href = encodeURIComponent(window.location.href)

    this.showModal(
      {
        desktop: `${this.bridgeUrl}?wc=${wcParam}&href=${href}&device=desktop&onlyQR=true`,
        ios: `${this.mobileUrl}app/wc?uri=${wcParam}&href=${href}&device=mobile&onlyQR=true`,
        android: `${this.mobileUrl}app/wc?uri=${wcParam}&href=${href}&device=mobile&onlyQR=true`,
      },
      modalWallet,
    )
  }

  public getWalletConnectQR(wcUri: string) {
    const wcParam = encodeURIComponent(wcUri)
    const href = encodeURIComponent(window.location.href)

    this.getQR({
      desktop: `${this.bridgeUrl}?wc=${wcParam}&href=${href}&device=desktop&onlyQR=true`,
      ios: `${this.mobileUrl}app/wc?uri=${wcParam}&href=${href}&device=mobile&onlyQR=true`,
      android: `${this.mobileUrl}app/wc?uri=${wcParam}&href=${href}&device=mobile&onlyQR=true`,
    })
  }

  private openMobileApp(urls: Urls) {
    const toMobileApp = document.createElement("button")
    toMobileApp.style.display = "none"
    toMobileApp.addEventListener("click", () => {
      window.location.href = urls[device]
    })
    toMobileApp.click()
  }

  private getQR(urls: Urls) {
    if (["android", "ios"].includes(device)) {
      this.openMobileApp(urls)
      return
    }

    const overlay = document.createElement("div")
    const shadow = document.querySelector("#starknetkit-modal-container")

    if (shadow?.shadowRoot) {
      const slot = shadow.shadowRoot.querySelector(".qr-code-slot")

      if (slot) {
        slot.innerHTML = overlayHtmlOnlyQR
        document.body.appendChild(overlay)
        this.overlay = overlay

        const iframe = slot.querySelector("iframe") as HTMLIFrameElement
        iframe.setAttribute("src", urls.desktop)

        for (const [key, value] of Object.entries(iframeStyleOnlyQR)) {
          iframe.style[key as any] = value
        }
      } else {
        throw new Error("Cannot find QR code slot")
      }
    } else {
      throw new Error("Cannot find modal")
    }
  }

  public showApprovalModal(_: RequestArguments): void {
    const href = encodeURIComponent(window.location.href)

    const urls = {
      desktop: `${this.bridgeUrl}?action=sign&device=desktop&href=${href}`,
      ios: `${this.mobileUrl}app/wc/request?href=${href}&device=mobile`,
      android: `${this.mobileUrl}app/wc/request?href=${href}&device=mobile`,
    }

    if (!isInArgentMobileAppBrowser()) {
      this.getModal(undefined, Layout.approval)

      if (["android", "ios"].includes(device)) {
        this.openMobileApp(urls)
        return
      }
      return
    }
    /*
    //https://docs.walletconnect.com/2.0/web3wallet/mobileLinking?platform=ios#ios-wallet-support
    Additionally when there is a signing request triggered by the dapp it will hit the deep link with an incomplete URI,
    this should be ignored and not considered valid as it's only used for automatically redirecting the users to approve or reject a signing request.
    */
    this.showModal(urls, undefined)
  }

  public closeModal(
    {
      success,
      isRequest,
    }: Partial<{ success: boolean; isRequest: boolean }> = {
      success: false,
      isRequest: false,
    },
  ) {
    const modal = this.standaloneConnectorModal
    if (success) {
      modal?.$set({ layout: Layout.success })
      setTimeout(() => modal?.$destroy(), 500)
    } else {
      if (!isRequest) {
        modal?.$set({ layout: Layout.loginFailure })
      } else {
        modal?.$set({ layout: Layout.requestFailure })
        setTimeout(() => modal?.$destroy(), 500)
      }
    }
  }

  private getModal(
    modalWallet?: ModalWalletExtended,
    modalLayout: Layout = Layout.qrCode,
  ) {
    this.standaloneConnectorModal = new Modal({
      target: getModalTarget(),
      props: {
        layout: modalLayout,
        dappName: modalWallet?.dappName,
        showBackButton: false,
        selectedWallet: modalWallet,
        callback: async (wallet: ModalWallet | null) => {
          try {
            const connector = wallet?.connector as StarknetkitConnector

            this.standaloneConnectorModal?.$destroy()
            await connector?.connect()
          } catch (err) {
            this.standaloneConnectorModal?.$set({ layout: Layout.loginFailure })
          }
        },
      },
    })
  }

  private showModal(urls: Urls, modalWallet?: ModalWalletExtended) {
    this.getModal(modalWallet, Layout.qrCode)

    this.getQR(urls)
  }
}

export const argentModal = new ArgentModal()
