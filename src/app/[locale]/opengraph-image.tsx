import { ImageResponse } from 'next/og'
import { isLocale, pick } from '@/lib/types'
import { getSettings } from '@/server/services/content'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Portfolio'

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params
  const locale = value && isLocale(value) ? value : 'fr'
  const s = await getSettings()
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: 'radial-gradient(circle at 80% 0%, #0c4a6e 0%, #0a0a0b 55%)',
        color: 'white',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          color: '#38bdf8',
          fontSize: 28,
          letterSpacing: 4,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 56,
            height: 56,
            border: '2px solid #38bdf8',
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {s.initials}
        </div>
        PORTFOLIO
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>
          {pick(s.headline, locale)}
        </div>
        <div style={{ marginTop: 24, fontSize: 30, color: '#a1a1aa' }}>{s.fullName}</div>
      </div>
    </div>,
    size,
  )
}
