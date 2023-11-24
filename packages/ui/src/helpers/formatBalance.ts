export interface Unit {
  amount: bigint
  decimals: number
}

export interface Balance {
  amount: bigint
  decimals: number
  symbol: string
}

function parseAmount(
  { amount, decimals }: Unit,
  decimalsToDisplay: number = decimals,
): {
  integerPart: string
  decimalPart: string
} {
  const bigIntString = amount.toString().padStart(decimals + 1, "0")
  const integerPart = bigIntString.slice(0, bigIntString.length - decimals)
  const decimalPart = bigIntString.slice(
    bigIntString.length - decimals,
    bigIntString.length - decimals + decimalsToDisplay,
  )

  return {
    integerPart,
    decimalPart,
  }
}

export function formatUnit(
  { amount, decimals }: Unit,
  decimalsToDisplay?: number,
): string {
  const { integerPart, decimalPart } = parseAmount(
    { amount, decimals },
    decimalsToDisplay,
  )

  return `${integerPart}.${decimalPart}`.replace(/\.?0+$/, "")
}

export function formatBalance(
  { amount, decimals, symbol }: Balance,
  decimalsToDisplay: number = 4,
): string {
  const { integerPart, decimalPart } = parseAmount(
    { amount, decimals },
    decimalsToDisplay,
  )

  const fullNumber = `${integerPart}.${decimalPart}`.replace(/\.?0+$/, "")
  if (fullNumber.match(/0(\.0)?$/) && amount !== BigInt(0)) {
    // show like <0.0001 instead of 0.0 with respect to decimalsToDisplay
    return `< ${integerPart}.${decimalPart.replace(/0$/, "1")} ${symbol}`
  }
  return `${fullNumber} ${symbol}`
}
