import {} from 'hono'

declare module 'hono' {
  interface ContextRenderer {
    (content: string | Promise<string>): Response | Promise<Response>
  }

  interface Env {
    Variables: {}
    Bindings: {}
  }
}
