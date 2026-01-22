import { inferAsyncReturnType } from '@trpc/server'
import { Request, Response } from 'express' // Nếu dùng Express

export function createContext({ req, res }: { req: Request; res: Response }) {
  return { req, res }
}

export type Context = inferAsyncReturnType<typeof createContext>
