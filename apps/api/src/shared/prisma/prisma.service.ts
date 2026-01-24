import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from 'src/generated/prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import envConfig from '../config'
import { queryLogExtension } from './query-log.extension'
import { softDeleteExtension } from './soft-delete.extension'

const extendedClientHelper = (client: PrismaClient) => client.$extends(softDeleteExtension())
type ExtendedClient = ReturnType<typeof extendedClientHelper>

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private _extendedClient: ExtendedClient | null = null

  constructor() {
    const connectionString = envConfig.DATABASE_URL
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    super({ adapter })
  }

  get extended() {
    if (!this._extendedClient) {
      let client = this.$extends(softDeleteExtension())
      if (envConfig.NODE_ENV === 'development') {
        client = client.$extends(queryLogExtension()) as any
      }
      this._extendedClient = client as unknown as ExtendedClient
    }
    return this._extendedClient
  }

  async onModuleInit() {
    await this.$connect()
  }

  async runTransaction<T>(fn: (tx: ExtendedClient) => Promise<T>): Promise<T> {
    return this.extended.$transaction(async (tx) => {
      return fn(tx as unknown as ExtendedClient)
    })
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
