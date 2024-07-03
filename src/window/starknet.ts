import type { StarknetWindowObject } from "@starknet-io/get-starknet-core"
import type { Permission } from "@starknet-io/types-js"
import {
  ConnectedStarknetWindowObject as ConnectedStarknetWindowObjectV3,
  IStarknetWindowObject as IStarknetWindowObjectV3,
} from "get-starknet-coreV3"
import type { ProviderInterface } from "starknet"
import type { ProviderInterface as ProviderInterface4 } from "starknet4"
import type { ProviderInterface as ProviderInterface5 } from "starknet5"

import type { AccountInterface } from "starknet"
import type { AccountInterface as AccountInterface4 } from "starknet4"
import type { AccountInterface as AccountInterface5 } from "starknet5"

type CommonOmittedProperties =
  | "on"
  | "off"
  | "request"
  | "icon"
  | "provider"
  | "account"

export type BackwardsCompatibleStarknetWindowObject = Omit<
  StarknetWindowObject,
  "provider" | "account"
> &
  Omit<IStarknetWindowObjectV3, CommonOmittedProperties> & {
    isConnected?: boolean
  } & {
    provider?: ProviderInterface | ProviderInterface5 | ProviderInterface4
    account?: AccountInterface | AccountInterface5 | AccountInterface4
  }

export type BackwardsCompatibleConnectedStarknetWindowObject = Omit<
  StarknetWindowObject,
  "provider" | "account"
> &
  Omit<ConnectedStarknetWindowObjectV3, CommonOmittedProperties> & {
    provider?: ProviderInterface | ProviderInterface5 | ProviderInterface4
    account?: AccountInterface | AccountInterface5 | AccountInterface4
  }

export type Variant = "argentX" | "argentWebWallet"

export interface GetArgentStarknetWindowObject {
  id: Variant
  icon: string
  name: string
  version: string
  host: string
}

export { Permission }
