import { z } from "zod"

export type Hex = `0x${string}`

const baseHexSchema = z
  .string()
  .min(2)
  .regex(/^0x[a-fA-F0-9]*$/)

export const hexSchema = z.custom<Hex>((value) => {
  const { success } = baseHexSchema.safeParse(value)
  return success
})
