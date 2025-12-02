import { z } from 'zod'

export const productsQuerySchema = z.object({
  id: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  tag: z.string().min(1).optional(),
  published: z.enum(['true', 'false']).optional(),
  shallow: z.enum(['true', 'false']).optional(),
  list: z.enum(['true', 'false']).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
  count: z.enum(['true', 'false']).optional(),
})

export type ProductsQuery = z.infer<typeof productsQuerySchema>
