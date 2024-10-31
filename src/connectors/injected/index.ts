import {
  Permission,
  RequestFnCall,
  RpcMessage,
  RpcTypeToMessageMap,
  type StarknetWindowObject,
} from "@starknet-io/types-js"
import {
  Account,
  AccountInterface,
  ProviderInterface,
  ProviderOptions,
} from "starknet"
import {
  ConnectorNotConnectedError,
  ConnectorNotFoundError,
  UserRejectedRequestError,
} from "../../errors"
import { removeStarknetLastConnectedWallet } from "../../helpers/lastConnected"
import {
  ConnectOptions,
  Connector,
  type ConnectorData,
  type ConnectorIcons,
} from "../connector"
import {
  WALLET_NOT_FOUND_ICON_DARK,
  WALLET_NOT_FOUND_ICON_LIGHT,
} from "./constants"
/** Injected connector options. */
export interface InjectedConnectorOptions {
  /** The wallet id. */
  id: string
  /** Wallet human readable name. */
  name?: string
  /** Wallet icons. */
  icon?: ConnectorIcons
}

//  Icons used when the injected wallet is not installed
//  Icons from media kits
export const injectedWalletIcons = {
  argentX: {
    dark: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIzLjgxMyA1Ljk2NjFIMTYuMTE5MUMxNS44NjIgNS45NjYxIDE1LjY1NiA2LjE4NTMzIDE1LjY1MDQgNi40NTc4MkMxNS40OTQ5IDE0LjExNzQgMTEuNzE0NyAyMS4zODcyIDUuMjA4MTcgMjYuNTM2NUM1LjAwMTYgMjYuNjk5OCA0Ljk1NDU0IDI3LjAwNyA1LjEwNTU2IDI3LjIyODJMOS42MDcxNSAzMy44MjY1QzkuNzYwMjkgMzQuMDUxMSAxMC4wNTg3IDM0LjEwMTcgMTAuMjY4NyAzMy45MzY4QzE0LjMzNzEgMzAuNzM4MSAxNy42MDk1IDI2Ljg3OTUgMTkuOTY2MSAyMi42MDI1QzIyLjMyMjYgMjYuODc5NSAyNS41OTUyIDMwLjczODEgMjkuNjYzNiAzMy45MzY4QzI5Ljg3MzQgMzQuMTAxNyAzMC4xNzE4IDM0LjA1MTEgMzAuMzI1MiAzMy44MjY1TDM0LjgyNjggMjcuMjI4MkMzNC45Nzc2IDI3LjAwNyAzNC45MzA1IDI2LjY5OTggMzQuNzI0MSAyNi41MzY1QzI4LjIxNzQgMjEuMzg3MiAyNC40MzcyIDE0LjExNzQgMjQuMjgxOSA2LjQ1NzgyQzI0LjI3NjMgNi4xODUzMyAyNC4wNzAxIDUuOTY2MSAyMy44MTMgNS45NjYxWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTM0LjU4OTQgMTAuNzg2NEwzMy43NjI4IDguMjE1ODFDMzMuNTk0NyA3LjY5Mzk1IDMzLjE4NTIgNy4yODc0NCAzMi42NjQgNy4xMjY3MkwzMC4wOTgxIDYuMzMyNTlDMjkuNzQ0IDYuMjIyOTEgMjkuNzQwMiA1LjcxOTAyIDMwLjA5MzQgNS42MDQ2M0wzMi42NDYxIDQuNzcyNjdDMzMuMTY0NiA0LjYwMzQ1IDMzLjU2OTQgNC4xOTAzMiAzMy43MjkxIDMuNjY2NTZMMzQuNTE3IDEuMDgzNzJDMzQuNjI2IDAuNzI2MzYgMzUuMTI2NiAwLjcyMjU3MSAzNS4yNDEyIDEuMDc4MDZMMzYuMDY3NyAzLjY0ODU4QzM2LjIzNTggNC4xNzA0NSAzNi42NDUzIDQuNTc2OTggMzcuMTY2NSA0LjczODY0TDM5LjczMjQgNS41MzE4M0M0MC4wODY1IDUuNjQxNSA0MC4wOTAzIDYuMTQ1NCAzOS43MzcyIDYuMjYwNzRMMzcuMTg0NCA3LjA5MjY5QzM2LjY2NTkgNy4yNjA5NiAzNi4yNjExIDcuNjc0MSAzNi4xMDE1IDguMTk4ODFMMzUuMzEzNSAxMC43ODA3QzM1LjIwNDUgMTEuMTM4MSAzNC43MDM5IDExLjE0MTggMzQuNTg5NCAxMC43ODY0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==",
    light:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCA0MCA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIzLjgxMyA2LjQ2NjFIMTYuMTE5MUMxNS44NjIgNi40NjYxIDE1LjY1NiA2LjY4NTMzIDE1LjY1MDQgNi45NTc4MkMxNS40OTQ5IDE0LjYxNzQgMTEuNzE0NyAyMS44ODcyIDUuMjA4MTcgMjcuMDM2NUM1LjAwMTYgMjcuMTk5OCA0Ljk1NDU0IDI3LjUwNyA1LjEwNTU2IDI3LjcyODJMOS42MDcxNSAzNC4zMjY1QzkuNzYwMjkgMzQuNTUxMSAxMC4wNTg3IDM0LjYwMTcgMTAuMjY4NyAzNC40MzY4QzE0LjMzNzEgMzEuMjM4MSAxNy42MDk1IDI3LjM3OTUgMTkuOTY2MSAyMy4xMDI1QzIyLjMyMjYgMjcuMzc5NSAyNS41OTUyIDMxLjIzODEgMjkuNjYzNiAzNC40MzY4QzI5Ljg3MzQgMzQuNjAxNyAzMC4xNzE4IDM0LjU1MTEgMzAuMzI1MiAzNC4zMjY1TDM0LjgyNjggMjcuNzI4MkMzNC45Nzc2IDI3LjUwNyAzNC45MzA1IDI3LjE5OTggMzQuNzI0MSAyNy4wMzY1QzI4LjIxNzQgMjEuODg3MiAyNC40MzcyIDE0LjYxNzQgMjQuMjgxOSA2Ljk1NzgyQzI0LjI3NjMgNi42ODUzMyAyNC4wNzAxIDYuNDY2MSAyMy44MTMgNi40NjYxWiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTM0LjU4OTQgMTEuMjg2NEwzMy43NjI4IDguNzE1ODFDMzMuNTk0NyA4LjE5Mzk1IDMzLjE4NTIgNy43ODc0NCAzMi42NjQgNy42MjY3MkwzMC4wOTgxIDYuODMyNTlDMjkuNzQ0IDYuNzIyOTEgMjkuNzQwMiA2LjIxOTAyIDMwLjA5MzQgNi4xMDQ2M0wzMi42NDYxIDUuMjcyNjdDMzMuMTY0NiA1LjEwMzQ1IDMzLjU2OTQgNC42OTAzMiAzMy43MjkxIDQuMTY2NTZMMzQuNTE3IDEuNTgzNzJDMzQuNjI2IDEuMjI2MzYgMzUuMTI2NiAxLjIyMjU3IDM1LjI0MTIgMS41NzgwNkwzNi4wNjc3IDQuMTQ4NThDMzYuMjM1OCA0LjY3MDQ1IDM2LjY0NTMgNS4wNzY5OCAzNy4xNjY1IDUuMjM4NjRMMzkuNzMyNCA2LjAzMTgzQzQwLjA4NjUgNi4xNDE1IDQwLjA5MDMgNi42NDU0IDM5LjczNzIgNi43NjA3NEwzNy4xODQ0IDcuNTkyNjlDMzYuNjY1OSA3Ljc2MDk2IDM2LjI2MTEgOC4xNzQxIDM2LjEwMTUgOC42OTg4MUwzNS4zMTM1IDExLjI4MDdDMzUuMjA0NSAxMS42MzgxIDM0LjcwMzkgMTEuNjQxOCAzNC41ODk0IDExLjI4NjRaIiBmaWxsPSJibGFjayIvPgo8L3N2Zz4K",
  },
  braavos: {
    dark: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0zMjMuNDQgNDEuMzg4NkMzMjQuMTk4IDQyLjY3MjggMzIzLjE5NSA0NC4yNjAzIDMyMS43MDQgNDQuMjYwM0MyOTEuNTEgNDQuMjYwMyAyNjYuOTY1IDY4LjE2NTYgMjY2LjM4OSA5Ny44NzFDMjU2LjA1IDk1Ljk0MDcgMjQ1LjMzNyA5NS43OTU2IDIzNC43NTQgOTcuNTc4N0MyMzQuMDIzIDY4LjAwOSAyMDkuNTQgNDQuMjYwMyAxNzkuNDQ1IDQ0LjI2MDNDMTc3Ljk1MyA0NC4yNjAzIDE3Ni45NDkgNDIuNjcxNiAxNzcuNzA3IDQxLjM4NjVDMTkyLjMyMyAxNi42MzMgMjE5LjQ4MyAwIDI1MC41NzMgMEMyODEuNjY0IDAgMzA4LjgyNCAxNi42MzM5IDMyMy40NCA0MS4zODg2WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzIzMjRfNjE4NjkpIi8+CjxwYXRoIGQ9Ik00MTguNzU2IDIyNi44OTRDNDI2LjM3IDIyOS4yIDQzMy41ODEgMjIyLjUxNyA0MzEuMDM2IDIxNC45NzlDNDA0LjUwNyAxMzYuNDAxIDMxNi41MzUgMTA0LjM1OCAyNTAuMTU5IDEwNC4zNThDMTgzLjY3NCAxMDQuMzU4IDkzLjczOTEgMTM3LjQxOCA2OS4zMDUxIDIxNS4zMzFDNjYuOTU3NCAyMjIuODE4IDc0LjE0NjUgMjI5LjI3NSA4MS42NDc5IDIyNi45NzdMMjQ0LjI1IDE3Ny4xNTFDMjQ3LjU2OSAxNzYuMTM0IDI1MS4xMTYgMTc2LjEyOCAyNTQuNDM5IDE3Ny4xMzVMNDE4Ljc1NiAyMjYuODk0WiIgZmlsbD0idXJsKCNwYWludDFfbGluZWFyXzIzMjRfNjE4NjkpIi8+CjxwYXRoIGQ9Ik02OS43MTY1IDIzOS40MjZMMjQ0LjM3IDE4Ni40NTZDMjQ3LjY2OSAxODUuNDU2IDI1MS4xOTEgMTg1LjQ1MyAyNTQuNDkyIDE4Ni40NDhMNDMwLjIzMiAyMzkuNDUyQzQ0NC43NiAyNDMuODMzIDQ1NC43MDEgMjU3LjIxNiA0NTQuNzAxIDI3Mi4zOVY0MzAuNDgxQzQ1NC4wMjggNDY5LjA3IDQxOS4zNjIgNTAwIDM4MC43ODYgNTAwSDMxNi43MTJDMzEwLjM3OSA1MDAgMzA1LjI1IDQ5NC44NzcgMzA1LjI1IDQ4OC41NDNWNDMzLjExNUMzMDUuMjUgNDExLjI4OSAzMTguMTY3IDM5MS41MzUgMzM4LjE1NSAzODIuNzkyQzM2NC45NDkgMzcxLjA3MSAzOTYuNjQ2IDM1NS4yMTggNDAyLjYwOCAzMjMuNDA2QzQwNC41MzIgMzEzLjEzOCAzOTcuODM3IDMwMy4yMzQgMzg3LjU5NSAzMDEuMTk4QzM2MS42OTkgMjk2LjA1MSAzMzIuOTg5IDI5OC4wMzkgMzA4LjcxMSAzMDguODk4QzI4MS4xNSAzMjEuMjI1IDI3My45NCAzNDEuNzMxIDI3MS4yNzEgMzY5LjI3TDI2OC4wMzYgMzk4LjkzOEMyNjcuMDQ3IDQwOC4wMDUgMjU4LjU0NiA0MTQuOTUyIDI0OS40MjkgNDE0Ljk1MkMyMzkuOTk4IDQxNC45NTIgMjMyLjkyNiA0MDcuNzY5IDIzMS45MDMgMzk4LjM4OEwyMjguNzI4IDM2OS4yN0MyMjYuNDQyIDM0NS42ODEgMjIyLjI5OCAzMjIuNzY3IDE5Ny45MTIgMzExLjg2QzE3MC4wOTUgMjk5LjQxOSAxNDIuMTQxIDI5NS4yODcgMTEyLjQwNCAzMDEuMTk4QzEwMi4xNjIgMzAzLjIzNCA5NS40NjcgMzEzLjEzOCA5Ny4zOTEzIDMyMy40MDZDMTAzLjQwNSAzNTUuNDk1IDEzNC44NTQgMzcwLjk4NSAxNjEuODQ0IDM4Mi43OTJDMTgxLjgzMyAzOTEuNTM1IDE5NC43NSA0MTEuMjg5IDE5NC43NSA0MzMuMTE1VjQ4OC41MzNDMTk0Ljc1IDQ5NC44NjcgMTg5LjYyMiA1MDAgMTgzLjI4OSA1MDBIMTE5LjIxNEM4MC42Mzc0IDUwMCA0NS45NzE2IDQ2OS4wNyA0NS4yOTc5IDQzMC40ODFWMjcyLjM0OUM0NS4yOTc5IDI1Ny4xOTQgNTUuMjE0MiAyNDMuODI0IDY5LjcxNjUgMjM5LjQyNloiIGZpbGw9InVybCgjcGFpbnQyX2xpbmVhcl8yMzI0XzYxODY5KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzIzMjRfNjE4NjkiIHgxPSIyNDUuOTg2IiB5MT0iLTI3IiB4Mj0iNDI1LjQ5NiIgeTI9IjUwMi4zNzYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0Y1RDQ1RSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRjk2MDAiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDFfbGluZWFyXzIzMjRfNjE4NjkiIHgxPSIyNDUuOTg2IiB5MT0iLTI3IiB4Mj0iNDI1LjQ5NiIgeTI9IjUwMi4zNzYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0Y1RDQ1RSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRjk2MDAiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDJfbGluZWFyXzIzMjRfNjE4NjkiIHgxPSIyNDUuOTg2IiB5MT0iLTI3IiB4Mj0iNDI1LjQ5NiIgeTI9IjUwMi4zNzYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0Y1RDQ1RSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRjk2MDAiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4=",
    light:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0zMjMuNDQgNDEuMzg4NkMzMjQuMTk4IDQyLjY3MjggMzIzLjE5NSA0NC4yNjAzIDMyMS43MDQgNDQuMjYwM0MyOTEuNTEgNDQuMjYwMyAyNjYuOTY1IDY4LjE2NTYgMjY2LjM4OSA5Ny44NzFDMjU2LjA1IDk1Ljk0MDcgMjQ1LjMzNyA5NS43OTU2IDIzNC43NTQgOTcuNTc4N0MyMzQuMDIzIDY4LjAwOSAyMDkuNTQgNDQuMjYwMyAxNzkuNDQ1IDQ0LjI2MDNDMTc3Ljk1MyA0NC4yNjAzIDE3Ni45NDkgNDIuNjcxNiAxNzcuNzA3IDQxLjM4NjVDMTkyLjMyMyAxNi42MzMgMjE5LjQ4MyAwIDI1MC41NzMgMEMyODEuNjY0IDAgMzA4LjgyNCAxNi42MzM5IDMyMy40NCA0MS4zODg2WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzIzMjRfNjE4NjkpIi8+CjxwYXRoIGQ9Ik00MTguNzU2IDIyNi44OTRDNDI2LjM3IDIyOS4yIDQzMy41ODEgMjIyLjUxNyA0MzEuMDM2IDIxNC45NzlDNDA0LjUwNyAxMzYuNDAxIDMxNi41MzUgMTA0LjM1OCAyNTAuMTU5IDEwNC4zNThDMTgzLjY3NCAxMDQuMzU4IDkzLjczOTEgMTM3LjQxOCA2OS4zMDUxIDIxNS4zMzFDNjYuOTU3NCAyMjIuODE4IDc0LjE0NjUgMjI5LjI3NSA4MS42NDc5IDIyNi45NzdMMjQ0LjI1IDE3Ny4xNTFDMjQ3LjU2OSAxNzYuMTM0IDI1MS4xMTYgMTc2LjEyOCAyNTQuNDM5IDE3Ny4xMzVMNDE4Ljc1NiAyMjYuODk0WiIgZmlsbD0idXJsKCNwYWludDFfbGluZWFyXzIzMjRfNjE4NjkpIi8+CjxwYXRoIGQ9Ik02OS43MTY1IDIzOS40MjZMMjQ0LjM3IDE4Ni40NTZDMjQ3LjY2OSAxODUuNDU2IDI1MS4xOTEgMTg1LjQ1MyAyNTQuNDkyIDE4Ni40NDhMNDMwLjIzMiAyMzkuNDUyQzQ0NC43NiAyNDMuODMzIDQ1NC43MDEgMjU3LjIxNiA0NTQuNzAxIDI3Mi4zOVY0MzAuNDgxQzQ1NC4wMjggNDY5LjA3IDQxOS4zNjIgNTAwIDM4MC43ODYgNTAwSDMxNi43MTJDMzEwLjM3OSA1MDAgMzA1LjI1IDQ5NC44NzcgMzA1LjI1IDQ4OC41NDNWNDMzLjExNUMzMDUuMjUgNDExLjI4OSAzMTguMTY3IDM5MS41MzUgMzM4LjE1NSAzODIuNzkyQzM2NC45NDkgMzcxLjA3MSAzOTYuNjQ2IDM1NS4yMTggNDAyLjYwOCAzMjMuNDA2QzQwNC41MzIgMzEzLjEzOCAzOTcuODM3IDMwMy4yMzQgMzg3LjU5NSAzMDEuMTk4QzM2MS42OTkgMjk2LjA1MSAzMzIuOTg5IDI5OC4wMzkgMzA4LjcxMSAzMDguODk4QzI4MS4xNSAzMjEuMjI1IDI3My45NCAzNDEuNzMxIDI3MS4yNzEgMzY5LjI3TDI2OC4wMzYgMzk4LjkzOEMyNjcuMDQ3IDQwOC4wMDUgMjU4LjU0NiA0MTQuOTUyIDI0OS40MjkgNDE0Ljk1MkMyMzkuOTk4IDQxNC45NTIgMjMyLjkyNiA0MDcuNzY5IDIzMS45MDMgMzk4LjM4OEwyMjguNzI4IDM2OS4yN0MyMjYuNDQyIDM0NS42ODEgMjIyLjI5OCAzMjIuNzY3IDE5Ny45MTIgMzExLjg2QzE3MC4wOTUgMjk5LjQxOSAxNDIuMTQxIDI5NS4yODcgMTEyLjQwNCAzMDEuMTk4QzEwMi4xNjIgMzAzLjIzNCA5NS40NjcgMzEzLjEzOCA5Ny4zOTEzIDMyMy40MDZDMTAzLjQwNSAzNTUuNDk1IDEzNC44NTQgMzcwLjk4NSAxNjEuODQ0IDM4Mi43OTJDMTgxLjgzMyAzOTEuNTM1IDE5NC43NSA0MTEuMjg5IDE5NC43NSA0MzMuMTE1VjQ4OC41MzNDMTk0Ljc1IDQ5NC44NjcgMTg5LjYyMiA1MDAgMTgzLjI4OSA1MDBIMTE5LjIxNEM4MC42Mzc0IDUwMCA0NS45NzE2IDQ2OS4wNyA0NS4yOTc5IDQzMC40ODFWMjcyLjM0OUM0NS4yOTc5IDI1Ny4xOTQgNTUuMjE0MiAyNDMuODI0IDY5LjcxNjUgMjM5LjQyNloiIGZpbGw9InVybCgjcGFpbnQyX2xpbmVhcl8yMzI0XzYxODY5KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzIzMjRfNjE4NjkiIHgxPSIyNDUuOTg2IiB5MT0iLTI3IiB4Mj0iNDI1LjQ5NiIgeTI9IjUwMi4zNzYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0Y1RDQ1RSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRjk2MDAiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDFfbGluZWFyXzIzMjRfNjE4NjkiIHgxPSIyNDUuOTg2IiB5MT0iLTI3IiB4Mj0iNDI1LjQ5NiIgeTI9IjUwMi4zNzYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0Y1RDQ1RSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRjk2MDAiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDJfbGluZWFyXzIzMjRfNjE4NjkiIHgxPSIyNDUuOTg2IiB5MT0iLTI3IiB4Mj0iNDI1LjQ5NiIgeTI9IjUwMi4zNzYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0Y1RDQ1RSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRjk2MDAiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4=",
  },
}

export class InjectedConnector extends Connector {
  private _wallet?: StarknetWindowObject
  private readonly _options: InjectedConnectorOptions

  constructor({ options }: { options: InjectedConnectorOptions }) {
    super()
    this._options = options
  }

  get id(): string {
    return this._options.id
  }

  get name(): string {
    this.ensureWallet()
    return this._options.name ?? this._wallet?.name ?? this._options.id
  }

  get icon(): ConnectorIcons {
    this.ensureWallet()
    const defaultIcon = {
      dark:
        injectedWalletIcons[this.id as keyof typeof injectedWalletIcons]
          ?.dark || WALLET_NOT_FOUND_ICON_DARK,
      light:
        injectedWalletIcons[this.id as keyof typeof injectedWalletIcons]
          ?.light || WALLET_NOT_FOUND_ICON_LIGHT,
    }

    return this._options.icon || this._wallet?.icon || defaultIcon
  }

  available(): boolean {
    this.ensureWallet()
    return this._wallet !== undefined
  }

  async chainId(): Promise<bigint> {
    this.ensureWallet()
    const locked = await this.isLocked()

    if (!this._wallet || locked) {
      throw new ConnectorNotConnectedError()
    }

    try {
      const chainIdHex = await this.request({ type: "wallet_requestChainId" })
      return BigInt(chainIdHex)
    } catch {
      throw new ConnectorNotFoundError()
    }
  }

  async ready(): Promise<boolean> {
    this.ensureWallet()

    if (!this._wallet) {
      return false
    }

    const permissions: Permission[] = await this.request({
      type: "wallet_getPermissions",
    })

    return permissions?.includes(Permission.ACCOUNTS)
  }

  async account(
    provider: ProviderOptions | ProviderInterface,
  ): Promise<AccountInterface> {
    this.ensureWallet()
    const locked = await this.isLocked()

    if (locked || !this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    const accounts = await this.request({
      type: "wallet_requestAccounts",
      params: { silent_mode: true },
    })

    return new Account(provider, accounts[0], "")
  }

  async connect(params: ConnectOptions): Promise<ConnectorData> {
    this.ensureWallet()

    if (!this._wallet) {
      throw new ConnectorNotFoundError()
    }

    let accounts: string[]
    try {
      accounts = await this.request(
        params
          ? {
              type: "wallet_requestAccounts",
              params,
            }
          : {
              type: "wallet_requestAccounts",
            },
      )
    } catch {
      throw new UserRejectedRequestError()
    }

    if (!accounts) {
      throw new UserRejectedRequestError()
    }

    this._wallet.on("accountsChanged", async (accounts) => {
      await this.onAccountsChanged(accounts)
    })

    this._wallet.on("networkChanged", (chainId, accounts) => {
      this.onNetworkChanged(chainId, accounts)
    })

    await this.onAccountsChanged(accounts)

    const [account] = accounts

    const chainId = await this.chainId()
    /**
     * @dev This emit ensures compatibility with starknet-react
     */
    this.emit("connect", { account, chainId })

    return {
      account,
      chainId,
    }
  }

  async disconnect(): Promise<void> {
    this.ensureWallet()
    removeStarknetLastConnectedWallet()

    if (!this._wallet) {
      throw new ConnectorNotFoundError()
    }

    /**
     * @dev This emit ensures compatibility with starknet-react
     */
    this.emit("disconnect")
  }

  async request<T extends RpcMessage["type"]>(
    call: RequestFnCall<T>,
  ): Promise<RpcTypeToMessageMap[T]["result"]> {
    this.ensureWallet()

    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    try {
      return await this._wallet.request(call)
    } catch {
      throw new UserRejectedRequestError()
    }
  }

  private async isLocked() {
    const accounts = await this.request({
      type: "wallet_requestAccounts",
      params: { silent_mode: true },
    })

    return accounts.length === 0
  }

  private ensureWallet() {
    // biome-ignore lint/suspicious/noExplicitAny: any
    const global_object: Record<string, any> = globalThis

    const wallet: StarknetWindowObject =
      global_object?.[`starknet_${this._options.id}`]

    if (wallet) {
      this._wallet = wallet
    }
  }

  private async onAccountsChanged(accounts?: string[]): Promise<void> {
    if (!accounts) {
      /**
       * @dev This emit ensures compatibility with starknet-react
       */
      this.emit("disconnect")
    } else {
      const [account] = accounts

      if (account) {
        const chainId = await this.chainId()
        /**
         * @dev This emit ensures compatibility with starknet-react
         */
        this.emit("change", { account, chainId })
      } else {
        /**
         * @dev This emit ensures compatibility with starknet-react
         */
        this.emit("disconnect")
      }
    }
  }

  private onNetworkChanged(chainIdHex?: string, accounts?: string[]): void {
    if (chainIdHex) {
      const chainId = BigInt(chainIdHex)
      const [account] = accounts || []
      /**
       * @dev This emit ensures compatibility with starknet-react
       */
      this.emit("change", { chainId, account })
    } else {
      /**
       * @dev This emit ensures compatibility with starknet-react
       */
      this.emit("change", {})
    }
  }

  get wallet(): StarknetWindowObject {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }
    return this._wallet
  }
}
