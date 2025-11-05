'use client'

import React, { useState } from 'react'
import { Reveal } from '@/components/reveal'

interface ValidationErrors {
  name?: string
  email?: string
  message?: string
  image?: string
}

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<{[key: string]: boolean}>({})

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
        if (typeof value === 'string' && value.trim().length < 2) {
          return 'Name must be at least 2 characters'
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
        if (typeof value === 'string' && value.trim().length < 10) {
          return 'Message must be at least 10 characters'
        }
        break
      case 'image':
        if (value && value instanceof File) {
          const maxSize = 5 * 1024 * 1024 // 5MB
          if (value.size > maxSize) {
            return 'Image must be smaller than 5MB'
          }
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
          if (!allowedTypes.includes(value.type)) {
            return 'Only JPG, PNG, and GIF images are allowed'
          }
        }
        break
    }
    return undefined
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    
    // Real-time validation
    if (touched[name]) {
      const error = validateField(name, value)
      setValidationErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleBlur = (fieldName: string) => {
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
    
    // Validate all fields
    const errors: ValidationErrors = {
      name: validateField('name', form.name),
      email: validateField('email', form.email),
      message: validateField('message', form.message),
      image: validateField('image', image),
    }
    
    setValidationErrors(errors)
    setTouched({ name: true, email: true, message: true, image: true })
    
    // Check if there are any errors
    if (Object.values(errors).some(error => error !== undefined)) {
      setError('Please fix the errors above before submitting')
      return
    }
    
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('email', form.email)
      formData.append('message', form.message)
      if (image) formData.append('image', image)
      const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/contact', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Failed to send message')
      setSuccess(true)
      setForm({ name: '', email: '', message: '' })
      setImage(null)
      setValidationErrors({})
      setTouched({})
      
      // Reset file input
      const fileInput = document.getElementById('image') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
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
      <form className="space-y-6" onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
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
            accept="image/*"
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
              Maximum file size: 5MB. Accepted formats: JPG, PNG, GIF
            </p>
          )}
        </div>
        <Reveal delay={0.1}>
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-800"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </Reveal>
      </form>
    </div>
  )
}
