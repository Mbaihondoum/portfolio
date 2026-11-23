import Image, { type ImageProps } from 'next/image'

/** next/image that skips optimisation for SVG placeholders (served as-is). */
export function ProjectImage({ alt, ...props }: ImageProps) {
  const src = typeof props.src === 'string' ? props.src : ''
  const unoptimized = src.endsWith('.svg') || src.startsWith('/api/files/')
  return <Image alt={alt} {...props} unoptimized={unoptimized || props.unoptimized} />
}
