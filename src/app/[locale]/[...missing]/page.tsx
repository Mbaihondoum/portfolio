import { notFound } from 'next/navigation'

/** Unknown paths under a locale render the localized 404 (with layout). */
export default function CatchAll() {
  notFound()
}
