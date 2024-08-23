<!-- logo -->
<p align="center">
  <img width='300' src="https://starknetkit-website-git-blo-1541-argentlabs.vercel.app/starknetKit-logo.svg">
</p>

<!-- primary badges -->
<p align="center">
  <a href="https://www.npmjs.com/package/starknetkit">
    <img src='https://img.shields.io/npm/v/starknetkit' />
  </a>
  <a href="https://bundlephobia.com/package/starknetkit">
    <img src='https://img.shields.io/bundlephobia/minzip/starknet?color=success&label=size' />
  </a>
  <a href="https://www.npmjs.com/package/starknetkit">
    <img src='https://img.shields.io/npm/dt/starknetkit?color=blueviolet' />
  </a>
  <a href="https://github.com/argentlabs/starknetkit/blob/main/LICENSE/">
    <img src="https://img.shields.io/badge/license-MIT-black">
  </a>
</p>

## 🕹️ StarknetKit

Install starknetkit with `npm` or `yarn`

```bash
# latest official release (main branch)
$ npm install starknetkit

# or with yarn:
$ yarn add starknetkit
```

## Imports

After installation, we get access to different methods, such as `connect`, `disconnect`, etc which we should import for use in our application:

```js
import { connect, disconnect } from "starknetkit"
```

## Establishing a connection

To establish a wallet connection, we need to call the connect method which was imported earlier like this:

```js
const wallet = await connect()
```

By default, the list of connectors is:

- Argent X
- Braavos
- Argent mobile
- Argent webwallet

## Connect with specific connectors

```js
const webwallet = await connect([new WebWalletConnector()])

const argentMobileWallet = await connect([
  new ArgentMobileConnector()
])

const wallet = await connect([
  new InjectedConnector({ options: { id: "argentX" } }),
  new InjectedConnector({ options: { id: "braavos" } })
])
```

## Reconnect to a previously connected wallet on load:

```js
const wallet = await connect({ modalMode: "neverAsk" })
```

## Disconnect a wallet

```js
await disconnect({ clearLastWallet: true })
```

## Listen to account change

```js
const selectedConnectorWallet = getSelectedConnectorWallet()
selectedConnectorWallet.on("accountsChanged", () => {
  setWallet(prevState => {
    const updatedWallet = { ...prevState }
    updatedWallet.account = selectedConnectorWallet.account
    return updatedWallet
  })
})
```

## 📕 Guides

Guides can be found [here](https://www.starknetkit.com/docs)

## ✏️ Contributing

If you consider to contribute to this project please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## 📜 License

Copyright (c) 2023

Licensed under the [MIT license](./LICENSE.md).
