export type ProviderScript = 'instagram' | 'tiktok'

type ProviderScriptConfig = {
  src: string
  attribute: string
}

const PROVIDERS: Record<ProviderScript, ProviderScriptConfig> = {
  instagram: {
    src: 'https://www.instagram.com/embed.js',
    attribute: 'data-quikspit-instagram-embed',
  },
  tiktok: {
    src: 'https://www.tiktok.com/embed.js',
    attribute: 'data-quikspit-tiktok-embed',
  },
}

const DEFAULT_TIMEOUT_MS = 10_000
const scriptPromises = new Map<ProviderScript, Promise<void>>()

export function loadProviderScript(
  provider: ProviderScript,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<void> {
  const cachedPromise = scriptPromises.get(provider)
  if (cachedPromise) return cachedPromise

  const promise = new Promise<void>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error(`The ${provider} embed is only available in a browser.`))
      return
    }

    const config = PROVIDERS[provider]
    const selector = `script[${config.attribute}]`
    const existingScript = document.querySelector<HTMLScriptElement>(selector)
    const script = existingScript ?? document.createElement('script')
    let settled = false

    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
      if (error) {
        script.parentNode?.removeChild(script)
        scriptPromises.delete(provider)
        reject(error)
      } else {
        script.dataset.quikspitLoaded = 'true'
        resolve()
      }
    }

    const handleLoad = () => finish()
    const handleError = () => finish(new Error(`The ${provider} embed could not load.`))
    const timeout = window.setTimeout(() => {
      finish(new Error(`The ${provider} embed timed out.`))
    }, timeoutMs)

    if (script.dataset.quikspitLoaded === 'true') {
      finish()
      return
    }

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })

    if (!existingScript) {
      script.async = true
      script.src = config.src
      script.dataset.quikspitProvider = provider
      script.setAttribute(config.attribute, 'true')
      document.head.appendChild(script)
    }
  })

  scriptPromises.set(provider, promise)
  return promise
}

export function clearProviderScriptCache() {
  scriptPromises.clear()
}
