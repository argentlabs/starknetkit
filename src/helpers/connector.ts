import {
  Connector,
  StarknetkitCompoundConnector,
  StarknetkitConnector,
} from "../connectors"

export function isCompoundConnector(
  connector: Connector | StarknetkitConnector | StarknetkitCompoundConnector,
): boolean {
  return (connector as StarknetkitCompoundConnector).isCompoundConnector
}

export function extractConnector(
  connector: Connector | StarknetkitConnector | StarknetkitCompoundConnector,
  useFallback: boolean = false,
) {
  const isCompound = isCompoundConnector(connector)

  if (isCompound) {
    return useFallback
      ? (connector as StarknetkitCompoundConnector).fallbackConnector
      : (connector as StarknetkitCompoundConnector).connector
  }
  return connector as StarknetkitConnector
}

export function getConnectorMeta(
  connector: Connector | StarknetkitConnector | StarknetkitCompoundConnector,
) {
  const isCompound = isCompoundConnector(connector)
  const _connector = extractConnector(connector)

  const icon = isCompound ? connector.icon : _connector?.icon || ""
  const name = isCompound ? connector.name : _connector?.name || ""

  return {
    icon,
    name,
  }
}

export function findConnectorById(
  connectors: (
    | Connector
    | StarknetkitConnector
    | StarknetkitCompoundConnector
  )[],
  id: string | null,
) {
  const connector = connectors.find((c) => {
    if (!c) {
      return false
    }
    return extractConnector(c)?.id === id
  })

  if (!connector) {
    return null
  }
  return extractConnector(connector)
}
