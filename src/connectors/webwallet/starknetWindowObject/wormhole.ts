const applyModalStyle = (iframe: HTMLIFrameElement) => {
  iframe.style.display = "none"
  iframe.style.border = "none"
  iframe.style.inset = "0"
  iframe.style.position = "fixed"
  iframe.style.width = "100%"
  iframe.style.height = "100%"
  iframe.style.backgroundColor = "rgba(0,0,0,0.5);"
  iframe.style.zIndex = "999999"
}

export const showModal = (iframe: HTMLIFrameElement) => {
  iframe.style.display = "block"
}

export const hideModal = (iframe: HTMLIFrameElement) => {
  iframe.style.display = "none"
}

export const createModal = async (targetUrl: string, shouldShow: boolean) => {
  // make sure target url has always /iframes/comms as the path
  const iframeId = "argent-webwallet-iframe"
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
  iframe.allow = "clipboard-write allowtransparency"
  iframe.id = iframeId
  iframe.setAttribute("allowtransparency", "true")
  iframe.setAttribute("transparent", "true")

  applyModalStyle(iframe)
  iframe.style.display = shouldShow ? "block" : "none"

  const existingElement = document.getElementById(iframeId)

  if (existingElement) {
    // element exists but shadowRoot cannot be accessed
    // delete the element and create new
    existingElement.remove()
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

  return { iframe }
}
