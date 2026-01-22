export const getPagination = ({
  totalItems,
  page,
  limit,
}: {
  totalItems: any
  page: number
  limit: number
}) => {
  const totalPages = Math.ceil(totalItems / limit)
  return {
    totalItems,
    totalPages,
    page,
    limit,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}
