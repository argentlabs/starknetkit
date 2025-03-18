export class ConnectAndSignSessionError extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = "ConnectAndSignSessionError"
    this.code = code
  }
}

export class WebwalletError extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = "WebwalletError"
    this.code = code
  }
}
