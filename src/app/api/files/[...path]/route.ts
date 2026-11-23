import { readLocalUpload } from '@/server/storage'

/** Serves files uploaded with STORAGE_DRIVER=local (dev / Docker). */
export async function GET(_request: Request, ctx: RouteContext<'/api/files/[...path]'>) {
  const { path } = await ctx.params
  const file = await readLocalUpload(path)
  if (!file) return new Response('Not found', { status: 404 })
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      'Content-Type': file.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      ...(file.contentType === 'application/pdf' ? { 'Content-Disposition': 'inline' } : {}),
    },
  })
}
