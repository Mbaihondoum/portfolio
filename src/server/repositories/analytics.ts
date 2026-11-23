import 'server-only'
import { and, desc, gte, isNotNull, sql } from 'drizzle-orm'
import { db } from '@/server/db/client'
import { pageViews } from '@/server/db/schema'

export type NewPageView = typeof pageViews.$inferInsert

export const analyticsRepository = {
  async record(view: NewPageView) {
    await db().insert(pageViews).values(view)
  },

  /** Daily views for the last `days` days, zero-filled. */
  async dailyViews(days: number) {
    const rows = await db().execute<{ day: string; views: number }>(sql`
      select to_char(d.day, 'YYYY-MM-DD') as day, coalesce(count(v.id), 0)::int as views
      from generate_series(current_date - ${days - 1}::int, current_date, interval '1 day') as d(day)
      left join ${pageViews} v on v.created_at >= d.day and v.created_at < d.day + interval '1 day'
      group by d.day order by d.day
    `)
    return [...rows]
  },

  async totals(since: Date) {
    const [row] = await db()
      .select({
        views: sql<number>`count(*)::int`,
        projectViews: sql<number>`count(${pageViews.projectSlug})::int`,
      })
      .from(pageViews)
      .where(gte(pageViews.createdAt, since))
    return row ?? { views: 0, projectViews: 0 }
  },

  async topPaths(since: Date, limit = 8) {
    return db()
      .select({ key: pageViews.path, count: sql<number>`count(*)::int` })
      .from(pageViews)
      .where(gte(pageViews.createdAt, since))
      .groupBy(pageViews.path)
      .orderBy(desc(sql`count(*)`))
      .limit(limit)
  },

  async topProjects(since: Date, limit = 6) {
    return db()
      .select({ key: pageViews.projectSlug, count: sql<number>`count(*)::int` })
      .from(pageViews)
      .where(and(gte(pageViews.createdAt, since), isNotNull(pageViews.projectSlug)))
      .groupBy(pageViews.projectSlug)
      .orderBy(desc(sql`count(*)`))
      .limit(limit)
  },

  async byCountry(since: Date, limit = 8) {
    return db()
      .select({
        key: sql<string>`coalesce(${pageViews.country}, '??')`,
        count: sql<number>`count(*)::int`,
      })
      .from(pageViews)
      .where(gte(pageViews.createdAt, since))
      .groupBy(sql`1`)
      .orderBy(desc(sql`count(*)`))
      .limit(limit)
  },

  async byDevice(since: Date) {
    return db()
      .select({ key: pageViews.device, count: sql<number>`count(*)::int` })
      .from(pageViews)
      .where(gte(pageViews.createdAt, since))
      .groupBy(pageViews.device)
      .orderBy(desc(sql`count(*)`))
  },

  async byLocale(since: Date) {
    return db()
      .select({ key: pageViews.locale, count: sql<number>`count(*)::int` })
      .from(pageViews)
      .where(gte(pageViews.createdAt, since))
      .groupBy(pageViews.locale)
  },

  async topReferrers(since: Date, limit = 6) {
    return db()
      .select({ key: pageViews.referrerHost, count: sql<number>`count(*)::int` })
      .from(pageViews)
      .where(and(gte(pageViews.createdAt, since), isNotNull(pageViews.referrerHost)))
      .groupBy(pageViews.referrerHost)
      .orderBy(desc(sql`count(*)`))
      .limit(limit)
  },
}
