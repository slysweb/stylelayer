# Blog Setup Guide

This project uses [Velite](https://github.com/zws-im/velite) for content management and [@tailwindcss/typography](https://tailwindcss.com/docs/plugins/typography) for beautiful blog post styling.

## Installation

First, install the required dependencies:

```bash
npm install velite @tailwindcss/typography
```

## Configuration

### Velite Configuration (`velite.config.ts`)

Velite is configured to:
- Process MDX files from `/content/blog/**/*.mdx`
- Generate type-safe content with the following schema:
  - `title`: string (max 99 chars)
  - `description`: string (max 999 chars, optional)
  - `date`: ISO date string
  - `published`: boolean (default: false)
  - `image`: string (optional, cover image path)
  - `category`: string
  - `body`: MDX content

### Tailwind Typography

The `@tailwindcss/typography` plugin has been added to `tailwind.config.ts` to provide beautiful typography styles for blog content.

## Creating Blog Posts

1. Create a new `.mdx` file in `/content/blog/`
2. Add frontmatter with required fields:

```mdx
---
title: Your Blog Post Title
description: A brief description of your post
date: 2024-01-15T00:00:00.000Z
published: true
image: /images/your-image.png
category: Technology
---

# Your Blog Post Content

Write your content here using Markdown and MDX syntax.
```

3. Velite will automatically process the file during build/dev

## Using Blog Content

Import and use blog posts in your components:

```typescript
import { blog, BlogPost } from '@/lib/content'

// Get all published posts
const publishedPosts = blog.filter(post => post.published)

// Get a specific post
const post = blog.find(post => post.slugAsParams === 'your-post-slug')
```

## Styling Blog Content

Use Tailwind's typography classes to style your blog content:

```tsx
<article className="prose prose-lg max-w-none">
  {post.body}
</article>
```

Available prose classes:
- `prose` - Base typography styles
- `prose-sm` - Smaller text
- `prose-lg` - Larger text
- `prose-xl` - Extra large text
- `dark:prose-invert` - Dark mode styles

## Example

See `/content/blog/example-post.mdx` for a complete example blog post.
