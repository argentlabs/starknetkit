import { useEffect, useState, type ReactNode } from "react"

import type {
  Connector,
  ConnectorIcons,
  StarknetkitCompoundConnector,
  StarknetkitConnector,
} from "../connectors"

import {
  extractConnector,
  isCompoundConnector,
  getConnectorMeta,
} from "../helpers/connector"

import { Header } from "./components/Header"
import { Connecting } from "./layouts/Connecting"
import { FailedLogin } from "./layouts/FailedLogin"
import { Success } from "./layouts/Success"

import css from "../theme.css?inline"

const ERROR_MAPPING = {
  "0001": "Connecting to fallback connector",
}

type StarknetReactWrapperProps = {
  children: (props: {
    name: string
    icon: ConnectorIcons
    connectAsyncWrapped: () => Promise<void>
  }) => ReactNode
  connector: Connector | StarknetkitConnector | StarknetkitCompoundConnector
  connectAsyncFunction: ({
    connector,
  }: {
    connector: Connector
  }) => Promise<void>
  dappName: string
  theme?: "dark" | "light"
}

function StarknetReactWrapper({
  children,
  connector,
  connectAsyncFunction,
  dappName,
  theme,
}: StarknetReactWrapperProps) {
  const themeMode =
    theme || window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  const [status, setStatus] = useState<"none" | "init" | "success" | "fail">(
    "none",
  )

  const isCompound = isCompoundConnector(connector)
  const mainConnector = extractConnector(connector) as Connector
  const fallbackConnector = extractConnector(connector, true) as Connector
  const connectorMeta = getConnectorMeta(connector)

  useEffect(() => {
    if (mainConnector && isCompound) {
      const onConnectionStatus = (
        cb: (status: "init" | "success" | "fail" | "fallback") => void,
      ) => {
        mainConnector?.on("connectionStatus", cb as any)
      }

      onConnectionStatus(function (newStatus) {
        if (newStatus !== "fallback") {
          setStatus((prevStatus) => {
            if (prevStatus === "none" && newStatus === "fail") {
              return prevStatus
            }
            return newStatus
          })
        }
      })
    }

    return () => {
      if (mainConnector) {
        mainConnector.off("connectionStatus")
      }
    }
  }, [isCompound, mainConnector])

  useEffect(() => {
    if (status === "success") {
      setTimeout(() => {
        setStatus("none")
      }, 500)
    }
  }, [status])

  async function connectAsyncWrapped() {
    let resolve: (args: any) => void
    let reject: (args: { message: string }) => void

    await new Promise((res, rej) => {
      resolve = res
      reject = rej

      const onConnectionStatus = (
        cb: (status: "init" | "success" | "fail" | "fallback") => void,
      ) => {
        mainConnector?.on("connectionStatus", cb as any)
      }

      onConnectionStatus((status) => {
        if (status === "fallback") {
          reject({ message: ERROR_MAPPING["0001"] })
        }
      })

      connectAsyncFunction({ connector: mainConnector }).then(() => {
        resolve(true)
      })
    }).catch(async (error) => {
      if (status !== "fail" && error.message === ERROR_MAPPING["0001"]) {
        await connectAsyncFunction({ connector: fallbackConnector })
      } else {
        reject(error)
      }
    })
  }

  if (!children) {
    return null
  }

  return (
    <>
      {isCompound && status !== "none" && (
        <>
          <style>{css}</style>
          <div
            className={`${themeMode} fixed w-full h-full z-[9999] modal-font inset-0 flex items-center justify-center backdrop-blur-sm bg-black/25`}
          >
            <main
              role="dialog"
              className={`
            rounded-3xl bg-surface-default shadow-modal dark:shadow-none flex flex-col
            z-[9999] w-full max-w-[380px] mx-6 p-6 text-center gap-8 min-h-[570px]
          `}
            >
              <Header
                title={dappName}
                subtitle="Connect to"
                showBackButton={false}
                showCloseButton={true}
                handleBack={() => {}}
                handleClose={() => {
                  setStatus("none")
                }}
              />

              {status === "init" && (
                <Connecting
                  theme={themeMode}
                  walletName="Ready Wallet"
                  showFallback={Boolean(fallbackConnector)}
                  handleFallback={async () => {
                    setStatus("none")
                    mainConnector?.emit("connectionStatus", "fallback")
                  }}
                />
              )}

              {status === "fail" && (
                <FailedLogin
                  walletName="Ready Wallet"
                  handleRetry={connectAsyncWrapped}
                  showFallback={Boolean(fallbackConnector)}
                  handleFallback={async () => {
                    setStatus("none")
                    mainConnector?.emit("connectionStatus", "fallback")
                  }}
                />
              )}

              {status === "success" && <Success />}
            </main>
          </div>
        </>
      )}
      {children({
        connectAsyncWrapped,
        ...connectorMeta,
      })}
    </>
  )
}
