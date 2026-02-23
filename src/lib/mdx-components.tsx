'use client'

import { useMemo } from 'react'
import * as React from 'react'

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
  
  if (!Component || typeof Component !== 'function') {
    return <div>Error loading content</div>
  }
  
  return <Component />
}
