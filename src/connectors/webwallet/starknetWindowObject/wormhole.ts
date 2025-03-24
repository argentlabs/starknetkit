import { ENABLE_POPUP_HEIGHT, ENABLE_POPUP_WIDTH } from "../helpers/popupSizes"

const applyModalStyle = (iframe: HTMLIFrameElement) => {
  iframe.style.display = "none"
  iframe.style.borderRadius = "40px"
  iframe.style.inset = "0"
  iframe.style.position = "fixed"
  iframe.style.top = "50%"
  iframe.style.left = "50%"
  iframe.style.transform = "translate(-50%, -50%)"
  iframe.style.backgroundColor = "transparent"
  iframe.style.zIndex = "999999"
  iframe.style.height = `${ENABLE_POPUP_HEIGHT}px`
  iframe.style.width = `${ENABLE_POPUP_WIDTH}px`
}

export const showModal = (
  iframe: HTMLIFrameElement,
  backdrop: HTMLDivElement,
) => {
  iframe.style.display = "block"
  backdrop.style.display = "block"
}

export const hideModal = (
  iframe: HTMLIFrameElement,
  backdrop: HTMLDivElement,
) => {
  iframe.style.display = "none"
  backdrop.style.display = "none"
}

export const updateSize = (
  iframe: HTMLIFrameElement,
  width: number,
  height: number,
) => {
  iframe.style.width = `${width}px`
  iframe.style.height = `${height}px`
}
export const iframeId = "argent-webwallet-iframe"

export const createModal = async (targetUrl: string, shouldShow: boolean) => {
  // make sure target url has always /iframes/comms as the path
  const backdropId = "argent-webwallet-backdrop"
  const url = new URL(targetUrl)
  url.pathname = "/iframes/comms"
  targetUrl = url.toString()

  const iframe = document.createElement("iframe")
  iframe.src = targetUrl
  ;(iframe as any).loading = "eager"
  iframe.sandbox.add(
    "allow-scripts",
    "allow-same-origin",
    "allow-forms",
    "allow-top-navigation",
    "allow-popups",
  )
  iframe.allow = "clipboard-write"
  iframe.id = iframeId
  iframe.setAttribute("allowtransparency", "true")
  iframe.setAttribute("transparent", "true")

  applyModalStyle(iframe)
  iframe.style.display = shouldShow ? "block" : "none"

  const backdrop = document.createElement("div")
  backdrop.id = backdropId
  backdrop.style.position = "fixed"
  backdrop.style.inset = "0"
  backdrop.style.backgroundColor = "rgba(0,0,0,0.5)"
  backdrop.style.zIndex = "999998"
  backdrop.style.width = "100dvw"
  backdrop.style.height = "100dvh"
  backdrop.style.backdropFilter = "blur(4px)"

  const existingElement = document.getElementById(iframeId)
  if (existingElement) {
    // element exists but shadowRoot cannot be accessed
    // delete the element and create new
    existingElement.remove()
    document.getElementById(backdropId)?.remove()
  }
  window.document.body.appendChild(iframe)

  // wait for the iframe to load
  await new Promise<void>((resolve, reject) => {
    const pid = setTimeout(
      () => reject(new Error("Timeout while loading an iframe")),
      20000,
    )

    iframe.addEventListener("load", async () => {
      clearTimeout(pid)
      resolve()
    })
  })

  window.document.body.appendChild(backdrop)

  return { iframe, backdrop }
}
