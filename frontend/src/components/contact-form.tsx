'use client'

import React, { useRef, useState } from 'react'
import { buildBackendApiUrl } from '@/lib/backend-api'
import { createTimeoutSignal } from '@/lib/fetch-with-timeout'

interface ValidationErrors {
  name?: string
  email?: string
  message?: string
  image?: string
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.gif,' + ALLOWED_IMAGE_TYPES.join(',')
const FIELD_ORDER: Array<keyof ValidationErrors> = ['name', 'email', 'message', 'image']

async function getResponseErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()

    if (body && typeof body === 'object' && 'message' in body) {
      const message = body.message

      if (Array.isArray(message)) {
        const messages = message.filter((item): item is string => typeof item === 'string')
        if (messages.length > 0) return messages.join(' ')
      }

      if (typeof message === 'string' && message.trim()) return message
    }
  } catch {
    // The server may return an empty or non-JSON error response.
  }

  return `The message didn't send (error ${response.status}). Try again, or call (208) 960-4970.`
}

function getSubmissionErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return 'Sending took too long. Check your connection and try again.'
    }

    if (error.message && error.message !== 'Failed to fetch') return error.message
  }

  return "The message didn't send. Check your connection and try again, or call (208) 960-4970."
}

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<{[key: string]: boolean}>({})
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateField = (name: string, value: string | File | null): string | undefined => {
    switch (name) {
      case 'name':
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
          return 'Enter your name'
        }
        break
      case 'email':
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
          return 'Enter your email address'
        }
        if (typeof value === 'string' && !validateEmail(value)) {
          return 'Enter an email address like name@example.com'
        }
        break
      case 'message':
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
          return 'Tell us what you need'
        }
        break
      case 'image':
        if (value && value instanceof File) {
          if (value.size > MAX_IMAGE_SIZE_BYTES) {
            return 'Image must be 5MB or smaller'
          }
          if (!ALLOWED_IMAGE_TYPES.includes(value.type)) {
            return 'Use a JPG, PNG, or GIF image'
          }
        }
        break
    }
    return undefined
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    
    // Real-time validation
    if (touched[name]) {
      const error = validateField(name as keyof ValidationErrors, value)
      setValidationErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleBlur = (fieldName: keyof ValidationErrors) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    const value = fieldName === 'image' ? image : form[fieldName as keyof typeof form]
    const error = validateField(fieldName, value)
    setValidationErrors(prev => ({ ...prev, [fieldName]: error }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      
      // Validate file immediately
      const error = validateField('image', file)
      setValidationErrors(prev => ({ ...prev, image: error }))
      setTouched(prev => ({ ...prev, image: true }))
    } else {
      setImage(null)
      setValidationErrors(prev => ({ ...prev, image: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (submittingRef.current || loading) return
    submittingRef.current = true

    const trimmedForm = {
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    }
    setForm(trimmedForm)
    setError(null)
    setSuccess(false)
    
    // Validate all fields
    const errors: ValidationErrors = {
      name: validateField('name', trimmedForm.name),
      email: validateField('email', trimmedForm.email),
      message: validateField('message', trimmedForm.message),
      image: validateField('image', image),
    }
    
    setValidationErrors(errors)
    setTouched({ name: true, email: true, message: true, image: true })
    
    // Check if there are any errors
    if (Object.values(errors).some(error => error !== undefined)) {
      setError('Some fields need attention. Check the messages next to them.')
      const firstInvalidField = FIELD_ORDER.find(field => errors[field] !== undefined)
      if (firstInvalidField) {
        formRef.current
          ?.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)
          ?.focus()
      }
      submittingRef.current = false
      return
    }
    
    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('name', trimmedForm.name)
      formData.append('email', trimmedForm.email)
      formData.append('message', trimmedForm.message)
      if (image) formData.append('image', image)
      const res = await fetch(buildBackendApiUrl('/contact'), {
        method: 'POST',
        body: formData,
        // File uploads need headroom for slow connections.
        signal: createTimeoutSignal(30_000),
      })
      if (!res.ok) throw new Error(await getResponseErrorMessage(res))
      setSuccess(true)
      setForm({ name: '', email: '', message: '' })
      setImage(null)
      setValidationErrors({})
      setTouched({})
      
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: unknown) {
      setError(getSubmissionErrorMessage(err))
    } finally {
      setLoading(false)
      submittingRef.current = false
    }
  }

  return (
    <div>
      {success && (
        <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100" role="status">
          Message sent. We&apos;ll reply within a day.
        </div>
      )}
      <form
        ref={formRef}
        className="space-y-6"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        noValidate
        aria-busy={loading}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-200 mb-2">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              className={`w-full rounded-lg border bg-black px-4 py-3 text-white placeholder:text-neutral-600 transition-colors focus:border-red-500 focus:outline-none focus-visible:outline-none ${
              validationErrors.name && touched.name ? 'border-red-500' : 'border-white/15 hover:border-white/25'
            }`}
              autoComplete="name"
              required
            aria-invalid={validationErrors.name && touched.name ? 'true' : 'false'}
            aria-describedby={validationErrors.name && touched.name ? 'name-error' : undefined}
            />
            {validationErrors.name && touched.name && (
            <p id="name-error" className="mt-2 text-sm text-red-400">
              {validationErrors.name}
            </p>
          )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-200 mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              className={`w-full rounded-lg border bg-black px-4 py-3 text-white placeholder:text-neutral-600 transition-colors focus:border-red-500 focus:outline-none focus-visible:outline-none ${
              validationErrors.email && touched.email ? 'border-red-500' : 'border-white/15 hover:border-white/25'
            }`}
              autoComplete="email"
              inputMode="email"
              required
            aria-invalid={validationErrors.email && touched.email ? 'true' : 'false'}
            aria-describedby={validationErrors.email && touched.email ? 'email-error' : undefined}
            />
            {validationErrors.email && touched.email && (
            <p id="email-error" className="mt-2 text-sm text-red-400">
              {validationErrors.email}
            </p>
          )}
          </div>
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-neutral-200 mb-2">What do you need?</label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={form.message}
            onChange={handleChange}
            onBlur={() => handleBlur('message')}
            className={`w-full rounded-lg border bg-black px-4 py-3 text-white placeholder:text-neutral-600 transition-colors focus:border-red-500 focus:outline-none focus-visible:outline-none ${
              validationErrors.message && touched.message ? 'border-red-500' : 'border-white/15 hover:border-white/25'
            }`}
            placeholder="Vehicle, what it needs, and roughly when"
            required
            aria-invalid={validationErrors.message && touched.message ? 'true' : 'false'}
            aria-describedby={validationErrors.message && touched.message ? 'message-error' : undefined}
          />
          {validationErrors.message && touched.message && (
            <p id="message-error" className="mt-2 text-sm text-red-400">
              {validationErrors.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-neutral-200 mb-2">
            Photo <span className="font-normal text-neutral-500">(optional)</span>
          </label>
          <input
            type="file"
            id="image"
            name="image"
            ref={fileInputRef}
            accept={IMAGE_ACCEPT}
            onChange={handleFileChange}
            className={`block w-full cursor-pointer rounded-lg border border-dashed bg-black px-3 py-3 text-sm text-neutral-400 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/15 ${
              validationErrors.image && touched.image ? 'border-red-500' : 'border-white/15'
            }`}
            aria-invalid={validationErrors.image && touched.image ? 'true' : 'false'}
            aria-describedby={validationErrors.image && touched.image ? 'image-error' : 'image-hint'}
          />
          {validationErrors.image && touched.image ? (
            <p id="image-error" className="mt-2 text-sm text-red-400">
              {validationErrors.image}
            </p>
          ) : (
            <p id="image-hint" className="mt-2 text-sm text-neutral-500">
              JPG, PNG, or GIF, up to 5 MB.
            </p>
          )}
        </div>
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-100" role="alert">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="btn-primary inline-flex min-h-12 w-full items-center justify-center px-6 sm:w-auto"
          disabled={loading}
        >
          {loading ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </div>
  )
}
