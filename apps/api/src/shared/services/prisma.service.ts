import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@repo/db'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import envConfig from '../config'
import { softDeleteExtension } from '@repo/db'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = envConfig.DATABASE_URL
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    super({ adapter })
  }

  get extended() {
    return this.$extends(softDeleteExtension())
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
