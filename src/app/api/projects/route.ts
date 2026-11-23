import { PROJECT_CATEGORIES, type ProjectCategory } from '@/lib/types'
import { getPublishedProjects } from '@/server/services/content'
import { toProjectSummary } from '@/server/services/dto'
import { localeFrom, PUBLIC_CACHE } from '@/server/http/responses'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const locale = localeFrom(url)
  const category = url.searchParams.get('category')
  const projects = await getPublishedProjects()
  const filtered = PROJECT_CATEGORIES.includes(category as ProjectCategory)
    ? projects.filter((p) => p.category === category)
    : projects
  return Response.json(
    { data: filtered.map((p) => toProjectSummary(p, locale)) },
    { headers: { 'Cache-Control': PUBLIC_CACHE, 'Access-Control-Allow-Origin': '*' } },
  )
}
