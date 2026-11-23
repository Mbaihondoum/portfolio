import 'server-only'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/server/env'

export type UploadKind = 'image' | 'document'

export const UPLOAD_RULES = {
  image: {
    maxBytes: 5 * 1024 * 1024,
    types: { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/avif': 'avif' },
  },
  document: { maxBytes: 10 * 1024 * 1024, types: { 'application/pdf': 'pdf' } },
} as const

export type StoredFile = { url: string; key: string; contentType: string; size: number }

export class UploadError extends Error {
  constructor(public code: 'too_large' | 'bad_type' | 'empty') {
    super(code)
  }
}

/** Checks magic bytes so a renamed file can't pass as another type. */
export function sniffType(bytes: Uint8Array): string | null {
  const b = bytes
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png'
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45
  )
    return 'image/webp'
  if (
    b[4] === 0x66 &&
    b[5] === 0x74 &&
    b[6] === 0x79 &&
    b[7] === 0x70 &&
    b[8] === 0x61 &&
    b[9] === 0x76
  )
    return 'image/avif'
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return 'application/pdf'
  return null
}

export function validateUpload(kind: UploadKind, bytes: Uint8Array) {
  const rules = UPLOAD_RULES[kind]
  if (bytes.byteLength === 0) throw new UploadError('empty')
  if (bytes.byteLength > rules.maxBytes) throw new UploadError('too_large')
  const type = sniffType(bytes)
  if (!type || !(type in rules.types)) throw new UploadError('bad_type')
  return { contentType: type, ext: rules.types[type as keyof typeof rules.types] as string }
}

interface StorageDriver {
  put(key: string, bytes: Uint8Array, contentType: string): Promise<string>
}

export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'uploads')

class LocalDriver implements StorageDriver {
  async put(key: string, bytes: Uint8Array) {
    const target = path.join(LOCAL_UPLOAD_DIR, key)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, bytes)
    return `/api/files/${key}`
  }
}

class SupabaseDriver implements StorageDriver {
  private bucketReady = false
  constructor(
    private client: SupabaseClient,
    private bucket: string,
  ) {}
  private async ensureBucket() {
    if (this.bucketReady) return
    const { data } = await this.client.storage.getBucket(this.bucket)
    if (!data) {
      await this.client.storage.createBucket(this.bucket, { public: true })
    }
    this.bucketReady = true
  }
  async put(key: string, bytes: Uint8Array, contentType: string) {
    await this.ensureBucket()
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(key, bytes, { contentType, cacheControl: '31536000', upsert: false })
    if (error) throw error
    return this.client.storage.from(this.bucket).getPublicUrl(key).data.publicUrl
  }
}

let driver: StorageDriver | undefined
function storage(): StorageDriver {
  if (driver) return driver
  const e = env()
  if (e.STORAGE_DRIVER === 'supabase') {
    if (!e.SUPABASE_URL || !e.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('STORAGE_DRIVER=supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    }
    const client = createClient(e.SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
    driver = new SupabaseDriver(client, e.SUPABASE_BUCKET)
  } else {
    driver = new LocalDriver()
  }
  return driver
}

export async function storeUpload(
  kind: UploadKind,
  folder: 'projects' | 'cv' | 'misc',
  file: File,
): Promise<StoredFile> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const { contentType, ext } = validateUpload(kind, bytes)
  const key = `${folder}/${randomUUID()}.${ext}`
  const url = await storage().put(key, bytes, contentType)
  return { url, key, contentType, size: bytes.byteLength }
}

/** Reads a local upload (local driver only). Returns null for invalid paths. */
export async function readLocalUpload(segments: string[]) {
  const key = segments.join('/')
  if (!/^(projects|cv|misc)\/[0-9a-f-]{36}\.(png|jpg|webp|avif|pdf)$/.test(key)) return null
  try {
    const bytes = await readFile(path.join(LOCAL_UPLOAD_DIR, key))
    return { bytes, contentType: sniffType(bytes) ?? 'application/octet-stream' }
  } catch {
    return null
  }
}
