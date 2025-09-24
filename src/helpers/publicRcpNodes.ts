export type PublicRpcNode = {
  mainnet: string
  testnet: string
}

// Public RPC nodes
export const CHAINSTACK_RPC_NODE: PublicRpcNode = {
  mainnet:
    "https://starknet-mainnet.core.chainstack.com/5b78befd1967e1ab160a38e1b7fa77db",
  testnet:
    "https://starknet-sepolia.core.chainstack.com/c35d78cd3e49108a4598e148cb569b90",
} as const

export const LAVA_RPC_NODE: PublicRpcNode = {
  mainnet: "https://rpc.starknet.lava.build",
  testnet: "https://rpc.starknet-sepolia.lava.build",
} as const

export const PUBLIC_RPC_NODES = [CHAINSTACK_RPC_NODE, LAVA_RPC_NODE] as const

export function getRandomPublicRPCNode() {
  const randomIndex = Math.floor(Math.random() * PUBLIC_RPC_NODES.length)
  return PUBLIC_RPC_NODES[randomIndex]
}
