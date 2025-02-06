export class ConnectAndSignSessionError extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = "ConnectAndSignSessionError"
    this.code = code
  }
}
