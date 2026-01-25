import { Injectable } from '@nestjs/common'
import { TRPCContext } from 'nestjs-trpc'
import { Request, Response } from 'express'
import { AccessTokenPayload } from '@/shared/types/jwt.payload'
import { REQUEST_USER_KEY } from '@repo/constants'

@Injectable()
export class AppContext implements TRPCContext {
  create({ req, res }: { req: Request; res: Response }) {
    const user = (req as any)[REQUEST_USER_KEY] as AccessTokenPayload | undefined
    return { req, res, user }
  }
}

export type Context = ReturnType<AppContext['create']>
