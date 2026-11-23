import { describe, expect, it } from 'vitest'
import { sniffType, UploadError, validateUpload } from '@/server/storage'

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
const pdf = new TextEncoder().encode('%PDF-1.7 fake')
const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>')

describe('upload validation', () => {
  it('sniffs real file signatures', () => {
    expect(sniffType(png)).toBe('image/png')
    expect(sniffType(pdf)).toBe('application/pdf')
    expect(sniffType(svg)).toBeNull()
  })

  it('accepts images and documents of the right kind only', () => {
    expect(validateUpload('image', png).ext).toBe('png')
    expect(validateUpload('document', pdf).ext).toBe('pdf')
    expect(() => validateUpload('image', pdf)).toThrowError(UploadError)
    expect(() => validateUpload('image', svg)).toThrowError('bad_type')
  })

  it('rejects empty and oversized files', () => {
    expect(() => validateUpload('image', new Uint8Array())).toThrowError('empty')
    const big = new Uint8Array(6 * 1024 * 1024)
    big.set(png)
    expect(() => validateUpload('image', big)).toThrowError('too_large')
  })
})
