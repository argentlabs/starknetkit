import css from "../theme.css"

export const getModalTarget = (): ShadowRoot => {
  const modalId = "starknetkit-modal-container"
  const existingElement = document.getElementById(modalId)

  if (existingElement) {
    if (existingElement.shadowRoot) {
      // element already exists, use the existing as target
      return existingElement.shadowRoot
    }
    // element exists but shadowRoot cannot be accessed
    // delete the element and create new
    existingElement.remove()
  }

  const element = document.createElement("div")
  // set id for future retrieval
  element.id = modalId
  document.body.appendChild(element)
  const target = element.attachShadow({ mode: "open" })

  const styleElement = document.createElement("style")
  styleElement.textContent = css
  target.appendChild(styleElement)

  return target
}