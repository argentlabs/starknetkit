const applyModalStyle = (iframe: HTMLIFrameElement) => {
  // middle of the screen
  iframe.style.position = "fixed"
  iframe.style.top = "50%"
  iframe.style.left = "50%"
  iframe.style.transform = "translate(-50%, -50%)"
  iframe.style.width = "380px"
  iframe.style.height = "420px"
  iframe.style.border = "none"

  // round corners
  iframe.style.borderRadius = "40px"
  // box shadow
  iframe.style.boxShadow = "0px 4px 20px rgba(0, 0, 0, 0.5)"

  const background = document.createElement("div")
  background.style.display = "none"
  background.style.position = "fixed"
  background.style.top = "0"
  background.style.left = "0"
  background.style.right = "0"
  background.style.bottom = "0"
  background.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
  background.style.zIndex = "99999"
  ;(background.style as any).backdropFilter = "blur(4px)"

  background.appendChild(iframe)

  return background
}

export const showModal = (modal: HTMLDivElement) => {
  modal.style.display = "block"
}

export const hideModal = (modal: HTMLDivElement) => {
  modal.style.display = "none"
}

export const setIframeHeight = (modal: HTMLIFrameElement, height: number) => {
  modal.style.height = `min(${height || 420}px, 100%)`
}

export const setIframeWidth = (modal: HTMLIFrameElement, height: number) => {
  modal.style.width = `min(${height || 380}px, 100%)`
}

export const setIframeSize = (
  modal: HTMLIFrameElement,
  width: number,
  height: number,
) => {
  modal.style.width = `min(${width || 380}px, 100%)`
  modal.style.height = `min(${height || 420}px, 100%)`
}

export const createModal = async (targetUrl: string, shouldShow: boolean) => {
  // make sure target url has always /iframes/comms as the path
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
  iframe.id = "argent-webwallet-iframe"

  const modal = applyModalStyle(iframe)
  modal.style.display = shouldShow ? "block" : "none"
  modal.id = "argent-webwallet-modal"

  // append the modal to the body
  window.document.body.appendChild(modal)

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

  return { iframe, modal }
}
