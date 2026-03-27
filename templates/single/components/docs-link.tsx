import { Button } from '@/components/ui/button'

const DOCS_URL = 'https://www.next-md-blog.com'

export function DocsLink() {
  return (
    <Button variant="ghost" asChild className="text-muted-foreground">
      <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
        Documentation
      </a>
    </Button>
  )
}
