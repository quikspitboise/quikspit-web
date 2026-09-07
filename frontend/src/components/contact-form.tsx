'use client'

import React, { useRef, useState } from 'react'
import { buildBackendApiUrl } from '@/lib/backend-api'
import { createTimeoutSignal } from '@/lib/fetch-with-timeout'
import { Reveal } from '@/components/reveal'

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

  return `We couldn't send your message (status ${response.status}). Please try again.`
}

function getSubmissionErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return 'The request took too long. Please check your connection and try again.'
    }

    if (error.message && error.message !== 'Failed to fetch') return error.message
  }

  return "We couldn't send your message. Please check your connection and try again."
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
          return 'Name is required'
        }
        break
      case 'email':
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
          return 'Email is required'
        }
        if (typeof value === 'string' && !validateEmail(value)) {
          return 'Please enter a valid email address'
        }
        break
      case 'message':
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
          return 'Message is required'
        }
        break
      case 'image':
        if (value && value instanceof File) {
          if (value.size > MAX_IMAGE_SIZE_BYTES) {
            return 'Image must be 5MB or smaller'
          }
          if (!ALLOWED_IMAGE_TYPES.includes(value.type)) {
            return 'Only JPG, JPEG, PNG, or GIF images are allowed'
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
      setError('Please fix the errors above before submitting')
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
    <div className="bg-brand-charcoal-light p-8 rounded-xl shadow-lg border border-neutral-700 h-full">
      <Reveal>
        <h2 className="text-2xl font-semibold text-white mb-6">
          Send us a Message
        </h2>
      </Reveal>
      <Reveal delay={0.05}>
        <p className="text-neutral-300 mb-6">
          Fill out the form below and we&apos;ll get back to you as soon as possible. 
          You can also attach an image if needed.
        </p>
      </Reveal>
      {success && (
        <div className="mb-4 p-4 rounded-lg bg-green-700 text-white" role="status" aria-live="polite">
          ✓ Message sent successfully! We&apos;ll get back to you soon.
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-700 text-white" role="alert" aria-live="assertive">
          {error}
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
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">
            Full Name <span className="text-red-600" aria-label="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent bg-neutral-800 text-white placeholder-neutral-400 ${
              validationErrors.name && touched.name ? 'border-red-500' : 'border-neutral-600'
            }`}
            placeholder="Your full name"
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={validationErrors.name && touched.name ? 'true' : 'false'}
            aria-describedby={validationErrors.name && touched.name ? 'name-error' : undefined}
          />
          {validationErrors.name && touched.name && (
            <p id="name-error" className="mt-1 text-sm text-red-500" role="alert">
              {validationErrors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
            Email Address <span className="text-red-600" aria-label="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent bg-neutral-800 text-white placeholder-neutral-400 ${
              validationErrors.email && touched.email ? 'border-red-500' : 'border-neutral-600'
            }`}
            placeholder="your.email@example.com"
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={validationErrors.email && touched.email ? 'true' : 'false'}
            aria-describedby={validationErrors.email && touched.email ? 'email-error' : undefined}
          />
          {validationErrors.email && touched.email && (
            <p id="email-error" className="mt-1 text-sm text-red-500" role="alert">
              {validationErrors.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-neutral-300 mb-2">
            Message <span className="text-red-600" aria-label="required">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={form.message}
            onChange={handleChange}
            onBlur={() => handleBlur('message')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent bg-neutral-800 text-white placeholder-neutral-400 ${
              validationErrors.message && touched.message ? 'border-red-500' : 'border-neutral-600'
            }`}
            placeholder="Tell us how we can help you..."
            autoComplete="off"
            required
            aria-required="true"
            aria-invalid={validationErrors.message && touched.message ? 'true' : 'false'}
            aria-describedby={validationErrors.message && touched.message ? 'message-error' : undefined}
          ></textarea>
          {validationErrors.message && touched.message && (
            <p id="message-error" className="mt-1 text-sm text-red-500" role="alert">
              {validationErrors.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-neutral-300 mb-2">
            Attach Image (Optional)
          </label>
          <input
            type="file"
            id="image"
            name="image"
            ref={fileInputRef}
            accept={IMAGE_ACCEPT}
            onChange={handleFileChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent bg-neutral-800 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 ${
              validationErrors.image && touched.image ? 'border-red-500' : 'border-neutral-600'
            }`}
            aria-invalid={validationErrors.image && touched.image ? 'true' : 'false'}
            aria-describedby={validationErrors.image && touched.image ? 'image-error' : 'image-hint'}
          />
          {validationErrors.image && touched.image ? (
            <p id="image-error" className="mt-1 text-sm text-red-500" role="alert">
              {validationErrors.image}
            </p>
          ) : (
            <p id="image-hint" className="mt-1 text-xs text-neutral-400">
              Maximum file size: 5MB. Accepted formats: JPG, JPEG, PNG, GIF
            </p>
          )}
        </div>
        <Reveal delay={0.1}>
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-800"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </Reveal>
      </form>
    </div>
  )
}
