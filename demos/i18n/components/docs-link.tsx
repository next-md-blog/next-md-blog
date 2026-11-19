'use client'

import { track } from '@vercel/analytics'
import { Button } from '@/components/ui/button'

const DOCS_URL = 'https://www.next-md-blog.com'

export function DocsLink() {
  return (
    <Button variant="ghost" asChild className="text-muted-foreground">
      <a
        href={DOCS_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          // docs_click: a demo visitor goes on to the docs (analytics must never break the page)
          try {
            track('docs_click', { demo: 'i18n' })
          } catch {
            /* ignore */
          }
        }}
      >
        Documentation
      </a>
    </Button>
  )
}
