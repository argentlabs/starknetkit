import {
  StarknetkitCompoundConnector,
  StarknetkitConnector,
} from "../connectors"

export function extractConnector(
  connector: StarknetkitConnector | StarknetkitCompoundConnector,
  useFallback: boolean = false,
) {
  if (connector.isCompoundConnector) {
    return useFallback
      ? (connector as StarknetkitCompoundConnector).fallbackConnector
      : (connector as StarknetkitCompoundConnector).connector
  }
  return connector as StarknetkitConnector
}

export function findConnectorById(
  connectors: (StarknetkitConnector | StarknetkitCompoundConnector)[],
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
