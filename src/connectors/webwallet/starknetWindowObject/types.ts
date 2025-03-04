export type Hex = `0x${string}`

export type Address = Hex

export type ApprovalRequest = {
  tokenAddress: Address
  amount: string
  spender: Address
}
