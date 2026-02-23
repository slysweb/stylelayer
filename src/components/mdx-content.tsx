'use client'

import * as React from 'react'
import Image from 'next/image'

// 定义 MDX 中可以使用的自定义组件
const components = {
  Image, // 允许在 MDX 中使用 Next.js 的图片优化
  // 你甚至可以在这里添加一个试用 StyleLayer 的按钮组件
  CallToAction: ({ title, href }: { title: string; href: string }) => (
    <a href={href} className="not-prose inline-block bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-neutral-800 transition-colors">
      {title}
    </a>
  ),
}

interface MdxProps {
  code: any // Velite generates MDX as a React component
}

export function Mdx({ code }: MdxProps) {
  // Velite generates MDX content as a React component
  // The body is already a function component that can be rendered directly
  if (!code) {
    return null
  }

  // If code is a React component (function), render it with custom components
  if (typeof code === 'function') {
    const Component = code
    return (
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <Component components={components} />
      </div>
    )
  }

  // If code has a default export (common in MDX)
  if (code && typeof code === 'object') {
    const Component = code.default || code
    if (typeof Component === 'function') {
      return (
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <Component components={components} />
        </div>
      )
    }
  }

  // Fallback
  return <>{code}</>
}