import { StarknetWindowObject } from "get-starknet-core"
import {
  IStarknetWindowObject as IStarknetWindowObjectV3,
  ConnectedStarknetWindowObject as ConnectedStarknetWindowObjectV3,
} from "get-starknet-coreV3"

type CommonOmittedProperties = "on" | "off" | "request" | "icon"

export type BackwardsCompatibleStarknetWindowObject = StarknetWindowObject &
  Omit<IStarknetWindowObjectV3, CommonOmittedProperties> & {
    isConnected?: boolean
  }

export type BackwardsCompatibleConnectedStarknetWindowObject =
  StarknetWindowObject &
    Omit<ConnectedStarknetWindowObjectV3, CommonOmittedProperties>
