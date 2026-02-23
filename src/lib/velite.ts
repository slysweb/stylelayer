import * as content from '../../.velite'

export const allPosts = content.blog || []

// Get all published posts sorted by date (newest first)
export const posts = allPosts
  .filter((post) => post.published)
  .sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA // newest first
  })

export type Post = (typeof allPosts)[number]

// Helper function to calculate reading time (words per minute)
export function getReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}
