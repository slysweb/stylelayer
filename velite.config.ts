import { defineConfig, defineCollection, s } from 'velite'

const computedFields = <T extends { slug: string }>(data: T) => ({
  ...data,
  slugAsParams: data.slug.split('/').slice(1).join('/'),
})

const blog = defineCollection({
  name: 'Blog',
  pattern: 'content/blog/**/*.mdx',
  schema: s
    .object({
      slug: s.path(),
      title: s.string().max(99),
      description: s.string().max(999).optional(),
      date: s.isodate(),
      published: s.boolean().default(false),
      image: s.string().optional(), // Use string instead of s.image() since images are in public/
      category: s.string(),
      body: s.mdx(),
    })
    .transform(computedFields),
})

export default defineConfig({
  collections: { blog },
})
