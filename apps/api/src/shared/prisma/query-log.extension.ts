import { Prisma } from 'src/generated/prisma/client'

export function queryLogExtension() {
  return Prisma.defineExtension({
    name: 'query-log',
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          const start = performance.now()
          const result = await query(args)
          const end = performance.now()
          const time = end - start
          console.log(
            `\x1b[36m[Prisma Query]\x1b[0m \x1b[33m${model}.${operation}\x1b[0m took \x1b[32m${time.toFixed(
              2,
            )}ms\x1b[0m`,
          )
          return result
        },
      },
    },
  })
}
