import { describe, expect, it } from 'vitest'
import { reorder } from '@/components/admin/use-sortable'

describe('reorder', () => {
  const list = ['a', 'b', 'c', 'd']
  it('moves an item down and up', () => {
    expect(reorder(list, 0, 2)).toEqual(['b', 'c', 'a', 'd'])
    expect(reorder(list, 3, 1)).toEqual(['a', 'd', 'b', 'c'])
  })
  it('returns the same list for no-op or out-of-range moves', () => {
    expect(reorder(list, 1, 1)).toBe(list)
    expect(reorder(list, 0, -1)).toBe(list)
    expect(reorder(list, 3, 4)).toBe(list)
  })
  it('does not mutate the input', () => {
    reorder(list, 0, 3)
    expect(list).toEqual(['a', 'b', 'c', 'd'])
  })
})
