export type PublicRpcNode = {
  mainnet: string
  testnet: string
}

// Public RPC nodes
export const BLAST_RPC_NODE: PublicRpcNode = {
  mainnet: "https://starknet-mainnet.public.blastapi.io",
  testnet: "https://starknet-testnet.public.blastapi.io",
} as const

export const LAVA_RPC_NODE: PublicRpcNode = {
  mainnet: "https://rpc.starknet.lava.build",
  testnet: "https://rpc.starknet-testnet.lava.build",
} as const

export const PUBLIC_RPC_NODES = [BLAST_RPC_NODE, LAVA_RPC_NODE] as const

export function getRandomPublicRPCNode() {
  const randomIndex = Math.floor(Math.random() * PUBLIC_RPC_NODES.length)
  return PUBLIC_RPC_NODES[randomIndex]
}
