export interface Balance {
  amount: bigint
  decimals: number
  symbol: string
}

export function formatBalance(
  { amount, decimals, symbol }: Balance,
  decimalsToDisplay: number = 4,
): string {
  const bigIntString = amount.toString().padStart(decimals + 1, "0")
  const integerPart = bigIntString.slice(0, bigIntString.length - decimals)
  const decimalPart = bigIntString.slice(
    bigIntString.length - decimals,
    bigIntString.length - decimals + decimalsToDisplay,
  )

  const fullNumber = `${integerPart}.${decimalPart}`.replace(/\.?0+$/, "")
  if (fullNumber.match(/0(\.0)?$/) && amount !== BigInt(0)) {
    // show like <0.0001 instead of 0.0 with respect to decimalsToDisplay
    return `< ${integerPart}.${decimalPart.replace(/0$/, "1")} ${symbol}`
  }
  return `${fullNumber} ${symbol}`
}
