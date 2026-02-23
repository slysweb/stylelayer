import * as content from '../../content'

export const blog = content.blog || []

export type BlogPost = (typeof blog)[number]
