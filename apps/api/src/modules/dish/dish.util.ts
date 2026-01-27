export type VariantData = {
  name: string
  options: string[]
}

export type SkuCombination = {
  optionValues: string[]
  internalId: string // Unique key for generated SKU based on values
}

export function generateSkuCombinations(variants: VariantData[]): SkuCombination[] {
  if (variants.length === 0) return []

  // Extract options from each variant
  const optionsList = variants.map((v) => v.options)

  // Generate Cartesian product
  const combinations = cartesianProduct(optionsList)

  return combinations.map((combo) => ({
    optionValues: combo,
    internalId: combo.join('-'),
  }))
}

function cartesianProduct(arrays: string[][]): string[][] {
  return arrays.reduce<string[][]>(
    (acc, curr) => {
      const results: string[][] = []
      acc.forEach((a) => {
        curr.forEach((b) => {
          results.push([...a, b])
        })
      })
      return results
    },
    [[]],
  )
}
