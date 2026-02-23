import * as content from '../../.velite'

export const blog = content.blog || []

export type BlogPost = (typeof blog)[number]
