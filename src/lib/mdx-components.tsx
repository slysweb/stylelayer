'use client'

import { useMemo, useEffect } from 'react'
import * as React from 'react'

// Helper function to generate ID from text
function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Custom heading components with IDs
const Heading2 = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  const id = useMemo(() => {
    const text = typeof children === 'string' ? children : React.Children.toArray(children).join('')
    return generateId(text)
  }, [children])

  return (
    <h2 id={id} {...props}>
      {children}
    </h2>
  )
}

const Heading3 = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  const id = useMemo(() => {
    const text = typeof children === 'string' ? children : React.Children.toArray(children).join('')
    return generateId(text)
  }, [children])

  return (
    <h3 id={id} {...props}>
      {children}
    </h3>
  )
}

export function MDXContent({ code }: { code: any }) {
  // Velite generates MDX content as a string containing compiled code
  // The code expects arguments[0] to be React runtime (Fragment, jsx, jsxs)
  const Component = useMemo(() => {
    if (!code) return null
    
    // If it's already a function, use it directly
    if (typeof code === 'function') {
      return code
    }
    
    // If it's a string (compiled MDX code), evaluate it
    if (typeof code === 'string') {
      try {
        // The compiled code expects arguments[0] to be React runtime
        // Create a function that wraps the code and provides React runtime
        const createMDXModule = new Function(
          `
          const ReactRuntime = arguments[0];
          ${code}
          return arguments[0];
          `
        )
        
        // Provide React runtime as arguments[0]
        const ReactRuntime = {
          Fragment: React.Fragment,
          jsx: React.createElement,
          jsxs: React.createElement,
        }
        
        const moduleExports = createMDXModule(ReactRuntime)
        
        // The module exports an object with a default function
        return moduleExports?.default || moduleExports
      } catch (error) {
        console.error('Error evaluating MDX code:', error)
        return null
      }
    }
    
    // If it's an object with default export
    if (code && typeof code === 'object') {
      return code.default || code
    }
    
    return null
  }, [code])
  
  // Add IDs to headings after render
  useEffect(() => {
    const headings = document.querySelectorAll('article h2, article h3')
    headings.forEach((heading) => {
      if (!heading.id) {
        const text = heading.textContent || ''
        heading.id = generateId(text)
      }
    })
  }, [Component])
  
  if (!Component || typeof Component !== 'function') {
    return <div>Error loading content</div>
  }
  
  // Custom components for headings
  const components = {
    h2: Heading2,
    h3: Heading3,
  }
  
  return <Component components={components} />
}
