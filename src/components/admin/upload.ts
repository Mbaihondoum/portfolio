'use client'

export type UploadResult = { ok: true; url: string } | { ok: false; error: string }

export async function uploadFile(file: File, kind: 'image' | 'document'): Promise<UploadResult> {
  const body = new FormData()
  body.set('file', file)
  body.set('kind', kind)
  try {
    const res = await fetch('/api/admin/upload', { method: 'POST', body })
    const json = await res.json()
    if (!res.ok) return { ok: false, error: json?.error?.code ?? 'server' }
    return { ok: true, url: json.data.url as string }
  } catch {
    return { ok: false, error: 'server' }
  }
}
