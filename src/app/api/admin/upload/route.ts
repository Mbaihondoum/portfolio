import { getAdmin } from '@/server/auth'
import { isAllowedOrigin } from '@/server/security'
import { storeUpload, UploadError, type UploadKind } from '@/server/storage'
import { jsonError } from '@/server/http/responses'
import { logger } from '@/server/logger'

const FOLDERS = { image: 'projects', document: 'cv' } as const

/** Authenticated upload endpoint used by the admin (images and CV PDFs). */
export async function POST(request: Request) {
  if (!isAllowedOrigin(request.headers)) return jsonError(403, 'forbidden', 'Origin not allowed')
  const admin = await getAdmin()
  if (!admin) return jsonError(401, 'unauthorized', 'Sign in required')

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  const kind = form?.get('kind') as UploadKind | null
  if (!(file instanceof File) || (kind !== 'image' && kind !== 'document')) {
    return jsonError(400, 'bad_request', 'Expected a file and a kind')
  }
  try {
    const stored = await storeUpload(kind, FOLDERS[kind], file)
    logger.info('admin.upload', { key: stored.key, size: stored.size })
    return Response.json({ data: stored })
  } catch (err) {
    if (err instanceof UploadError) {
      return jsonError(err.code === 'too_large' ? 413 : 415, err.code, err.code)
    }
    logger.error('admin.upload_failed', { err })
    return jsonError(500, 'server', 'Upload failed')
  }
}
