import { describe, expect, it } from 'vitest'
import { detectDevice, isBot, projectSlugFromPath, referrerHost } from '@/server/services/analytics'

describe('analytics helpers', () => {
  it('classifies devices from the user agent', () => {
    expect(
      detectDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148'),
    ).toBe('mobile')
    expect(detectDevice('Mozilla/5.0 (Linux; Android 14; Pixel 7) Mobile Safari/537.36')).toBe(
      'mobile',
    )
    expect(detectDevice('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)')).toBe('tablet')
    expect(detectDevice('Mozilla/5.0 (Linux; Android 13; SM-X700) Safari/537.36')).toBe('tablet')
    expect(detectDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0')).toBe('desktop')
  })

  it('detects bots and empty user agents', () => {
    expect(isBot('Googlebot/2.1')).toBe(true)
    expect(isBot('Mozilla/5.0 HeadlessChrome/130')).toBe(true)
    expect(isBot('')).toBe(true)
    expect(isBot('Mozilla/5.0 (Macintosh) Safari/605.1.15')).toBe(false)
  })

  it('extracts the project slug from detail paths only', () => {
    expect(projectSlugFromPath('/fr/projects/my-app')).toBe('my-app')
    expect(projectSlugFromPath('/en/projects/my-app/')).toBe('my-app')
    expect(projectSlugFromPath('/fr')).toBeNull()
    expect(projectSlugFromPath('/fr/projects/a/b')).toBeNull()
  })

  it('keeps only external referrer hosts', () => {
    expect(referrerHost('https://www.linkedin.com/feed/', 'site.dev')).toBe('linkedin.com')
    expect(referrerHost('https://site.dev/fr', 'site.dev')).toBeNull()
    expect(referrerHost('not a url', 'site.dev')).toBeNull()
    expect(referrerHost(undefined, 'site.dev')).toBeNull()
  })
})
