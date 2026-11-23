import { cacheLife } from 'next/cache'

/** Current year, cached (keeps pages prerenderable with Cache Components). */
export async function currentYear() {
  'use cache'
  cacheLife('days')
  return new Date().getFullYear()
}
