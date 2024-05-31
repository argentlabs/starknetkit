import type { StarknetWindowObject } from "starknet-types"
import { login } from "./login"
import type { IArgentLoginOptions } from "./login"
import { StarknetAdapter } from "./starknet/adapter"

export type { StarknetWindowObject, IArgentLoginOptions }

export const getStarknetWindowObject = async (
  options: IArgentLoginOptions,
): Promise<StarknetWindowObject | null> => login(options, StarknetAdapter)
