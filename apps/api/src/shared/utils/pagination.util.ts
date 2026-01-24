export interface PaginationResult<T> {
  data: T[]
  pagination: {
    totalItems: number
    totalPages: number
    page: number
    limit: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface PaginationOptions {
  page: number
  limit: number
}

export function createPaginationResult<T>(
  data: T[],
  total: number,
  options: PaginationOptions,
): PaginationResult<T> {
  const { page, limit } = options
  const totalPages = Math.ceil(total / limit)

  return {
    data,
    pagination: {
      totalItems: total,
      totalPages,
      page,
      limit,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}
