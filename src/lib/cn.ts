/** Joins class names, skipping falsy values (tiny clsx). */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}
