export type CloudinaryAssetPayload = {
  publicId: string
  secureUrl: string
  width: number
  height: number
  format: string
  bytes: number
  originalFilename?: string
}

export type UploadSignatureResponse = {
  cloudName: string
  apiKey: string
  signature: string
  params: Record<string, string | number | boolean>
}

type CloudinaryUploadResponse = {
  public_id?: string
  secure_url?: string
  width?: number
  height?: number
  format?: string
  bytes?: number
  original_filename?: string
  error?: { message?: string }
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])
export const ACCEPTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']
export const IMAGE_ACCEPT = [
  ...Array.from(ACCEPTED_IMAGE_TYPES),
  ...ACCEPTED_IMAGE_EXTENSIONS.map((extension) => `.${extension}`),
].join(',')

export function assertImageFile(file: File | null, label: string): File {
  if (!file || file.size === 0) {
    throw new Error(`${label} is required.`)
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${label} must be 10 MB or smaller.`)
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  const hasAcceptedType = file.type ? ACCEPTED_IMAGE_TYPES.has(file.type) : false
  const hasAcceptedExtension = ACCEPTED_IMAGE_EXTENSIONS.includes(extension)

  if (!hasAcceptedType && !hasAcceptedExtension) {
    throw new Error(`${label} must be a HEIC, JPEG, PNG, or WebP image.`)
  }

  return file
}

function createAbortError(message: string) {
  const error = new Error(message)
  error.name = 'AbortError'
  return error
}

function createTimeoutError(message: string) {
  const error = new Error(message)
  error.name = 'TimeoutError'
  return error
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

function parseUploadPayload(
  payload: CloudinaryUploadResponse,
  file: File,
): CloudinaryAssetPayload {
  if (!payload.public_id || !payload.secure_url) {
    throw new Error('Cloudinary did not return required image metadata.')
  }

  let secureUrl: URL
  try {
    secureUrl = new URL(payload.secure_url)
  } catch {
    throw new Error('Cloudinary returned an invalid image URL.')
  }

  if (
    secureUrl.protocol !== 'https:' ||
    !isPositiveInteger(payload.width) ||
    !isPositiveInteger(payload.height) ||
    !payload.format ||
    !isPositiveInteger(payload.bytes)
  ) {
    throw new Error('Cloudinary returned incomplete image metadata.')
  }

  return {
    publicId: payload.public_id,
    secureUrl: secureUrl.toString(),
    width: payload.width,
    height: payload.height,
    format: payload.format,
    bytes: payload.bytes,
    originalFilename: payload.original_filename ?? file.name,
  }
}

export function uploadFileToCloudinary(
  file: File,
  signaturePayload: UploadSignatureResponse,
  onProgress: (progress: number) => void,
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<CloudinaryAssetPayload> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.set('file', file)
    formData.set('api_key', signaturePayload.apiKey)
    formData.set('signature', signaturePayload.signature)

    Object.entries(signaturePayload.params).forEach(([key, value]) => {
      formData.set(key, String(value))
    })

    const request = new XMLHttpRequest()
    const timeoutMs = options.timeoutMs ?? 30_000
    let settled = false
    let timedOut = false
    let timeoutId: number | undefined

    const cleanup = () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
      options.signal?.removeEventListener('abort', handleAbort)
      request.upload.onprogress = null
      request.onload = null
      request.onerror = null
      request.ontimeout = null
      request.onabort = null
    }

    const finish = (error?: Error, payload?: CloudinaryAssetPayload) => {
      if (settled) return
      settled = true
      cleanup()
      if (error) reject(error)
      else if (payload) resolve(payload)
      else reject(new Error('Cloudinary upload failed.'))
    }

    const handleAbort = () => {
      request.abort()
      finish(createAbortError('Upload cancelled.'))
    }

    request.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${signaturePayload.cloudName}/image/upload`,
    )

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    request.onload = () => {
      let payload: CloudinaryUploadResponse

      try {
        payload = JSON.parse(request.responseText || '{}') as CloudinaryUploadResponse
      } catch {
        finish(new Error('Cloudinary returned an unreadable response.'))
        return
      }

      if (request.status < 200 || request.status >= 300) {
        finish(new Error(payload.error?.message || 'Cloudinary upload failed.'))
        return
      }

      try {
        finish(undefined, parseUploadPayload(payload, file))
      } catch (error) {
        finish(error instanceof Error ? error : new Error('Cloudinary returned invalid image metadata.'))
      }
    }

    request.onerror = () => finish(new Error('Cloudinary upload failed.'))
    request.ontimeout = () => finish(createTimeoutError('Cloudinary upload timed out.'))
    request.onabort = () => {
      if (!settled) finish(timedOut ? createTimeoutError('Cloudinary upload timed out.') : createAbortError('Upload cancelled.'))
    }

    if (options.signal?.aborted) {
      handleAbort()
      return
    }

    options.signal?.addEventListener('abort', handleAbort, { once: true })
    timeoutId = window.setTimeout(() => {
      timedOut = true
      request.abort()
      finish(createTimeoutError('Cloudinary upload timed out.'))
    }, timeoutMs)

    request.send(formData)
  })
}
