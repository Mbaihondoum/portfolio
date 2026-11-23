import { buildOpenApiDocument } from '@/lib/openapi'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return Response.json(buildOpenApiDocument(url), {
    headers: { 'Access-Control-Allow-Origin': '*' },
  })
}
