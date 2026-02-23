import { posts, allPosts } from './velite' // 使用 velite.ts 中已处理好的数据

export function getAllPosts() {
  return posts // 已经过滤和排序好了
}

export function getPostBySlug(slug: string) {
  return allPosts.find((post) => post.slugAsParams === slug)
}

// 格式化日期，使其符合欧美审美 (例如: Feb 16, 2026)
export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}