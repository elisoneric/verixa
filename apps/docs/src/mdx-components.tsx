import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className="text-3xl font-bold tracking-tight mb-6">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-semibold tracking-tight mt-8 mb-3">{children}</h3>,
    p: ({ children }) => <p className="leading-7 [&:not(:first-child)]:mt-6 mb-6 text-gray-700 dark:text-gray-300">{children}</p>,
    code: ({ children, className }) => {
      // Very simple code block formatting for demonstration
      const isInline = !className;
      if (isInline) {
        return <code className="bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 font-mono text-sm">{children}</code>
      }
      return (
        <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg overflow-x-auto my-6 font-mono text-sm">
          <code className={className}>{children}</code>
        </pre>
      )
    },
    ...components,
  }
}
