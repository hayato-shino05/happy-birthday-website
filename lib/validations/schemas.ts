import { z } from 'zod'

// 誕生日のバリデーション
export const birthdaySchema = z.object({
  name: z
    .string()
    .min(1, '名前は必須です')
    .max(100, '名前は100文字以内で入力してください')
    .trim(),
  month: z
    .number()
    .int()
    .min(1, '月は1-12の範囲で入力してください')
    .max(12, '月は1-12の範囲で入力してください'),
  day: z
    .number()
    .int()
    .min(1, '日は1-31の範囲で入力してください')
    .max(31, '日は1-31の範囲で入力してください'),
  year: z
    .number()
    .int()
    .min(1900, '年が無効です')
    .max(new Date().getFullYear(), '未来の年は入力できません')
    .optional()
    .nullable(),
  message: z
    .string()
    .max(500, 'メッセージは500文字以内で入力してください')
    .optional()
    .nullable(),
})

export type BirthdayInput = z.infer<typeof birthdaySchema>

// メッセージのバリデーション
export const messageSchema = z.object({
  sender: z
    .string()
    .min(1, '送信者名は必須です')
    .max(50, '名前は50文字以内で入力してください')
    .trim(),
  message: z
    .string()
    .min(1, '内容は必須です')
    .max(1000, '内容は1000文字以内で入力してください')
    .trim(),
  birthday_person: z
    .string()
    .max(100)
    .optional()
    .nullable(),
})

export type MessageInput = z.infer<typeof messageSchema>

// ギフトのバリデーション
export const giftSchema = z.object({
  sender: z
    .string()
    .min(1, '送信者名は必須です')
    .max(50, '名前は50文字以内で入力してください')
    .trim(),
  gift_emoji: z
    .string()
    .min(1, 'ギフトを選択してください'),
  gift_name: z
    .string()
    .min(1, 'ギフト名は必須です')
    .max(50),
  birthday_person: z
    .string()
    .max(100)
    .optional()
    .nullable(),
})

export type GiftInput = z.infer<typeof giftSchema>

// 投稿のバリデーション
export const postSchema = z.object({
  author: z
    .string()
    .min(1, '投稿者名は必須です')
    .max(50, '名前は50文字以内で入力してください')
    .trim(),
  content: z
    .string()
    .min(1, '内容は必須です')
    .max(2000, '内容は2000文字以内で入力してください')
    .trim(),
  image_url: z
    .string()
    .url('画像URLが無効です')
    .optional()
    .nullable(),
})

export type PostInput = z.infer<typeof postSchema>

// 返信のバリデーション
export const replySchema = z.object({
  author: z
    .string()
    .min(1, '名前は必須です')
    .max(50)
    .trim(),
  content: z
    .string()
    .min(1, '内容は必須です')
    .max(500, '内容は500文字以内で入力してください')
    .trim(),
})

export type ReplyInput = z.infer<typeof replySchema>

// ファイルアップロードのバリデーション
export const fileUploadSchema = z.object({
  file: z.custom<File>((val) => val instanceof File, 'ファイルが無効です'),
  maxSize: z.number().default(10 * 1024 * 1024), // デフォルトは 10MB
  allowedTypes: z.array(z.string()).default(['image/*', 'video/*']),
})

export function validateFileUpload(
  file: File,
  options: { maxSize?: number; allowedTypes?: string[] } = {}
): { valid: boolean; error?: string } {
  const maxSize = options.maxSize || 10 * 1024 * 1024
  const allowedTypes = options.allowedTypes || ['image/', 'video/']

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `ファイルサイズは${Math.round(maxSize / 1024 / 1024)}MB以下にしてください`,
    }
  }

  const isAllowedType = allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.replace('/*', '/'))
    }
    return file.type === type
  })

  if (!isAllowedType) {
    return {
      valid: false,
      error: 'サポートされていないファイル形式です',
    }
  }

  return { valid: true }
}

// XSS防止のためのHTMLサニタイズ
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// 入力の検証とサニタイズ
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.issues.map((e) => e.message)
    return { success: false, errors }
  }

  return { success: true, data: result.data }
}
