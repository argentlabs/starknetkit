import { z } from "zod"
import { CallSchema, typedDataSchema } from "../../../types/window"

export const connectAndSignSessionInputSchema = z.object({
  callbackData: z.string().optional(),
  approvalRequests: z.array(
    z.object({
      tokenAddress: z.string(),
      amount: z.string(),
      spender: z.string(),
    }),
  ),
  sessionTypedData: typedDataSchema,
})

export const connectAndSignSessionOutputSchema = z.object({
  account: z.string().array().optional(),
  chainId: z.string().optional(),
  signature: z.string().array().optional(),
  approvalTransactionHash: z.string().optional(),
  deploymentPayload: z.any().optional(),
  approvalRequestsCalls: z.array(CallSchema).optional(),
  errorCode: z
    .enum([
      "USER_REJECTED",
      "ACCOUNT_NOT_DEPLOYED",
      "NOT_ENOUGH_BALANCE",
      "NOT_ENOUGH_BALANCE_DEPLOYMENT",
      "GENERIC_ERROR",
    ])
    .optional(),
})

export type ConnectAndSignSessionInput = z.infer<
  typeof connectAndSignSessionInputSchema
>

export type ConnectAndSignSessionOutput = z.infer<
  typeof connectAndSignSessionOutputSchema
>
