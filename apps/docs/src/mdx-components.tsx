import type { MDXComponents } from 'mdx/types'
import { CodeBlock } from '@verixa/ui'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className="text-3xl font-bold tracking-tight mb-6 text-slate-900 font-heading">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-4 text-slate-900 font-heading">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-semibold tracking-tight mt-8 mb-3 text-slate-900 font-heading">{children}</h3>,
    p: ({ children }) => <p className="leading-7 [&:not(:first-child)]:mt-6 mb-6 text-slate-700">{children}</p>,
    code: ({ children, className }) => {
      const isInline = !className
      if (isInline) {
        return (
          <code className="bg-slate-100 text-slate-800 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-xs">
            {children}
          </code>
        )
      }
      const match = /language-(\w+)/.exec(className || '')
      const lang = match ? match[1] : 'bash'
      return (
        <CodeBlock
          code={String(children).replace(/\n$/, '')}
          language={lang}
          title={lang.toUpperCase() + ' EXAMPLE'}
        />
      )
    },
    ...components,
  }
}
