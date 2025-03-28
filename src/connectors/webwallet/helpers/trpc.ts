import { Permission } from "@starknet-io/types-js"
import type { CreateTRPCProxyClient } from "@trpc/client"
import { createTRPCProxyClient, loggerLink, splitLink } from "@trpc/client"
import { initTRPC } from "@trpc/server"
import { popupLink, windowLink } from "trpc-browser/link"
import { z } from "zod"
import {
  RpcCallSchema,
  RpcCallsArraySchema,
  StarknetMethodArgumentsSchemas,
  deployAccountContractSchema,
} from "../../../types/window"
import { DEFAULT_WEBWALLET_URL } from "../constants"
import {
  connectAndSignSessionInputSchema,
  connectAndSignSessionOutputSchema,
} from "./schema"

const t = initTRPC.create({
  isServer: false,
  allowOutsideOfServer: true,
})

let popupOrigin = DEFAULT_WEBWALLET_URL
let popupLocation = ""
let popupParams = ""

interface SetPopupOptions {
  width?: number
  height?: number
  origin?: string
  location?: string
  atLeftBottom?: boolean
}

export const setPopupOptions = ({
  width = 775,
  height = 385,
  origin,
  location,
  atLeftBottom = false,
}: SetPopupOptions) => {
  const parentWidth =
    window?.outerWidth ?? window?.innerWidth ?? window?.screen.width ?? 0
  const parentHeight =
    window?.outerHeight ?? window?.innerHeight ?? window?.screen.height ?? 0
  const parentLeft = window?.screenLeft ?? window?.screenX ?? 0
  const parentTop = window?.screenTop ?? window?.screenY ?? 0

  const x = atLeftBottom ? 0 : parentLeft + parentWidth / 2 - width / 2
  const y = atLeftBottom
    ? window.screen.availHeight + 10
    : parentTop + parentHeight / 2 - height / 2

  popupOrigin = origin ?? popupOrigin
  popupLocation = location ?? popupLocation
  popupParams = `width=${width},height=${height},top=${y},left=${x},toolbar=no,menubar=no,scrollbars=no,location=no,status=no,popup=1`
}

// TODO: abstract AppRouter in order to have one single source of truth
// At the moment, this is needed
const appRouter = t.router({
  authorize: t.procedure.output(z.boolean()).mutation(async () => {
    return true
  }),
  connect: t.procedure.mutation(async () => ""),
  connectWebwallet: t.procedure
    .input(
      z.object({
        theme: z.enum(["light", "dark", "auto"]).optional(),
      }),
    )
    .output(
      z.object({
        account: z.string().array().optional(),
        chainId: z.string().optional(),
      }),
    )
    .mutation(async () => ({})),
  connectWebwalletSSO: t.procedure
    .input(
      z.object({ token: z.string(), authorizedPartyId: z.string().optional() }),
    )
    .output(
      z.object({
        account: z.string().array().optional(),
        chainId: z.string().optional(),
      }),
    )
    .mutation(async () => ({})),
  connectAndSignSession: t.procedure
    .input(connectAndSignSessionInputSchema)
    .output(connectAndSignSessionOutputSchema)
    .mutation(async () => ({})),
  enable: t.procedure.output(z.string()).mutation(async () => ""),
  execute: t.procedure
    .input(StarknetMethodArgumentsSchemas.execute)
    .output(z.string())
    .mutation(async () => ""),
  signMessage: t.procedure
    .input(StarknetMethodArgumentsSchemas.signMessage)
    .output(z.string().array())
    .mutation(async () => []),
  getLoginStatus: t.procedure
    .output(
      z.object({
        isLoggedIn: z.boolean(),
        hasSession: z.boolean().optional(),
        isPreauthorized: z.boolean().optional(),
      }),
    )
    .mutation(async () => {
      // placeholder
      return {
        isLoggedIn: true,
      }
    }),

  // RPC Messages
  requestAccounts: t.procedure
    .input(z.object({ silent_mode: z.boolean().optional() })) // TODO: update in webwallet to use silent_mode
    .output(z.string().array())
    .mutation(async () => []),
  requestChainId: t.procedure.output(z.string()).mutation(async () => ""),
  signTypedData: t.procedure
    .input(StarknetMethodArgumentsSchemas.signMessage)
    .output(z.string().array())
    .mutation(async () => []),
  getPermissions: t.procedure
    .output(z.array(z.enum([Permission.ACCOUNTS])))
    .mutation(async () => {
      return [Permission.ACCOUNTS]
    }),
  addInvokeTransaction: t.procedure
    .input(RpcCallSchema.or(RpcCallsArraySchema))
    .output(z.string())
    .mutation(async (_) => ""),

  addStarknetChain: t.procedure.mutation((_) => {
    throw Error("not implemented")
  }),
  switchStarknetChain: t.procedure.mutation((_) => {
    throw Error("not implemented")
  }),
  watchAsset: t.procedure.mutation((_) => {
    throw Error("not implemented")
  }),
  updateModal: t.procedure.subscription(async () => {
    return
  }),
  deploymentData: t.procedure
    .output(deployAccountContractSchema)
    .mutation(async () => {
      return {
        address: "",
        calldata: [],
        version: 0,
        class_hash: "",
        salt: "",
      }
    }),
})

export type AppRouter = typeof appRouter

type TRPCProxyClientOptions = {
  iframe?: Window
}

export const trpcProxyClient = ({
  iframe,
}: TRPCProxyClientOptions): CreateTRPCProxyClient<AppRouter> =>
  createTRPCProxyClient<AppRouter>({
    links: [
      loggerLink({
        enabled: (opts) => {
          return (
            (process.env.NODE_ENV === "development" &&
              typeof window !== "undefined") ||
            (process.env.NODE_ENV === "development" &&
              opts.direction === "down" &&
              opts.result instanceof Error)
          )
        },
      }),
      splitLink({
        condition(opts) {
          // throw if iframe is not defined & type is subscription
          if (!iframe && opts.type === "subscription") {
            throw new Error(
              "subscription is not supported without an iframe window",
            )
          }

          // equal needed for typescript check
          return Boolean(iframe)
        },
        true: windowLink({
          window: window,
          postWindow: iframe,
          postOrigin: "*",
        }),
        false: popupLink({
          listenWindow: window,
          createPopup: () => {
            let popup: Window | null = null
            const webwalletBtn = document.createElement("button")
            webwalletBtn.style.display = "none"
            webwalletBtn.addEventListener("click", () => {
              popup = window.open(
                `${popupOrigin}${popupLocation}`,
                "popup",
                popupParams,
              )
            })
            webwalletBtn.click()

            // make sure popup is defined
            ;(async () => {
              while (!popup) {
                await new Promise((resolve) => setTimeout(resolve, 100))
              }
            })()

            if (!popup) {
              throw new Error("Could not open popup")
            }
            return popup
          },
          postOrigin: "*",
        }),
      }),
    ],
  })
