import { getSkills } from '@/server/services/content'
import { toSkill } from '@/server/services/dto'
import { PUBLIC_CACHE } from '@/server/http/responses'

export async function GET() {
  const skills = await getSkills()
  return Response.json(
    { data: skills.map(toSkill) },
    { headers: { 'Cache-Control': PUBLIC_CACHE, 'Access-Control-Allow-Origin': '*' } },
  )
}
