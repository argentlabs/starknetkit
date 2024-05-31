import { constants } from "starknet"
import { MAINNET_WHITELIST_URL, TESTNET_WHITELIST_URL } from "../constants"

const CACHE_NAME = "allowed-dapps"

type AllowedDappsJsonResponse = {
  allowedDapps: string[]
}

export const fetchAllowedDapps = async (
  network: constants.NetworkName,
): Promise<AllowedDappsJsonResponse> => {
  const url =
    network === constants.NetworkName.SN_MAIN
      ? MAINNET_WHITELIST_URL
      : TESTNET_WHITELIST_URL
  try {
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(url)

    if (cachedResponse) {
      const cachedTimestamp = parseInt(
        cachedResponse.headers.get("X-Cache-Timestamp") ?? "0",
        10,
      )
      const currentTimestamp = new Date().getTime()
      const timeDiff = currentTimestamp - cachedTimestamp
      const hoursDiff = timeDiff / (1000 * 60 * 60)

      if (hoursDiff < 24) {
        return cachedResponse.json()
      }
    }

    const response = await fetch(url)
    const clonedHeaders = new Headers(response.headers)

    // Store the current timestamp in a custom header
    clonedHeaders.set("X-Cache-Timestamp", new Date().getTime().toString())

    // Read JSON data from the original response
    const responseData = await response.json()

    // Create a new response with the cloned headers and original JSON data
    const responseToCache = new Response(JSON.stringify(responseData), {
      status: response.status,
      statusText: response.statusText,
      headers: clonedHeaders,
    })

    // Open the cache and add the response to it
    const updatedCache = await caches.open(CACHE_NAME)
    await updatedCache.put(url, responseToCache)

    return responseData
  } catch (error) {
    throw new Error(error as any)
  }
}
