export type PaginationOptions = {
  page: number
  limit: number
}

export type PaginatedResult<T> = {
  total: number
  data: T[]
}

export const paginate = async <T>(
  model: any, // Typed as any to support generic Prisma delegates
  args: any = {},
  options: PaginationOptions,
): Promise<PaginatedResult<T>> => {
  const { page, limit } = options
  const skip = (page - 1) * limit

  const [total, data] = await Promise.all([
    model.count({ where: args.where }),
    model.findMany({
      ...args,
      skip,
      take: limit,
    }),
  ])

  return { total, data }
}
