export const setStarknetLastConnectedWallet = (id: string) => {
  localStorage.setItem("starknetLastConnectedWallet", id)
}

export const removeStarknetLastConnectedWallet = () => {
  localStorage.removeItem("starknetLastConnectedWallet")
}
