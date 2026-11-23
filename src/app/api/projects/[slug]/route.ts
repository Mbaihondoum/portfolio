import { slugSchema } from '@/lib/validators'
import { getPublishedProject } from '@/server/services/content'
import { toProject } from '@/server/services/dto'
import { jsonError, localeFrom, PUBLIC_CACHE } from '@/server/http/responses'

export async function GET(request: Request, ctx: RouteContext<'/api/projects/[slug]'>) {
  const { slug } = await ctx.params
  if (!slugSchema.safeParse(slug).success) return jsonError(404, 'not_found', 'Project not found')
  const project = await getPublishedProject(slug)
  if (!project) return jsonError(404, 'not_found', 'Project not found')
  return Response.json(
    { data: toProject(project, localeFrom(new URL(request.url))) },
    { headers: { 'Cache-Control': PUBLIC_CACHE, 'Access-Control-Allow-Origin': '*' } },
  )
}
