import { describe, it, expect } from 'vitest'
import {
  birthdaySchema,
  messageSchema,
  giftSchema,
  validateFileUpload,
  sanitizeHtml,
  validateAndSanitize,
} from '@/lib/validations/schemas'

describe('Birthday Schema', () => {
  it('should validate correct birthday data', () => {
    const validData = {
      name: 'John Doe',
      month: 5,
      day: 15,
      year: 1990,
      message: 'Happy Birthday!',
    }

    const result = birthdaySchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject empty name', () => {
    const invalidData = {
      name: '',
      month: 5,
      day: 15,
    }

    const result = birthdaySchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject invalid month', () => {
    const invalidData = {
      name: 'John',
      month: 13,
      day: 15,
    }

    const result = birthdaySchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject invalid day', () => {
    const invalidData = {
      name: 'John',
      month: 5,
      day: 32,
    }

    const result = birthdaySchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should allow optional year and message', () => {
    const validData = {
      name: 'John',
      month: 5,
      day: 15,
    }

    const result = birthdaySchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})

describe('Message Schema', () => {
  it('should validate correct message data', () => {
    const validData = {
      sender: 'Alice',
      message: 'Happy Birthday to you!',
    }

    const result = messageSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject message over 1000 characters', () => {
    const invalidData = {
      sender: 'Alice',
      message: 'a'.repeat(1001),
    }

    const result = messageSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject empty sender', () => {
    const invalidData = {
      sender: '',
      message: 'Hello',
    }

    const result = messageSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})

describe('Gift Schema', () => {
  it('should validate correct gift data', () => {
    const validData = {
      sender: 'Bob',
      gift_emoji: '🎁',
      gift_name: 'Birthday Gift',
    }

    const result = giftSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject missing gift_emoji', () => {
    const invalidData = {
      sender: 'Bob',
      gift_emoji: '',
      gift_name: 'Gift',
    }

    const result = giftSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})

describe('File Upload Validation', () => {
  it('should accept valid image file', () => {
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })

    const result = validateFileUpload(file, {
      maxSize: 10 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png'],
    })

    expect(result.valid).toBe(true)
  })

  it('should reject file exceeding max size', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 20 * 1024 * 1024 }) // 20MB

    const result = validateFileUpload(file, {
      maxSize: 10 * 1024 * 1024,
    })

    expect(result.valid).toBe(false)
    expect(result.error).toContain('10MB')
  })

  it('should reject unsupported file type', () => {
    const file = new File([''], 'test.exe', { type: 'application/x-msdownload' })
    Object.defineProperty(file, 'size', { value: 1024 })

    const result = validateFileUpload(file, {
      allowedTypes: ['image/', 'video/'],
    })

    expect(result.valid).toBe(false)
    expect(result.error).toContain('không được hỗ trợ')
  })
})

describe('Sanitize HTML', () => {
  it('should escape HTML special characters', () => {
    const input = '<script>alert("xss")</script>'
    const result = sanitizeHtml(input)

    expect(result).not.toContain('<script>')
    expect(result).toContain('&lt;script&gt;')
  })

  it('should escape quotes', () => {
    const input = 'Hello "world" & \'friends\''
    const result = sanitizeHtml(input)

    expect(result).toContain('&quot;')
    expect(result).toContain('&#039;')
    expect(result).toContain('&amp;')
  })
})

describe('Validate and Sanitize', () => {
  it('should return success with valid data', () => {
    const result = validateAndSanitize(messageSchema, {
      sender: 'Test',
      message: 'Hello',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.sender).toBe('Test')
    }
  })

  it('should return errors with invalid data', () => {
    const result = validateAndSanitize(messageSchema, {
      sender: '',
      message: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0)
    }
  })
})
