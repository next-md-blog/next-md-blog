import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-6">
        <FileQuestion className="h-7 w-7" aria-hidden />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">Page not found</h1>
      <p className="text-muted-foreground text-center max-w-sm mb-8 leading-relaxed">
        The URL may be wrong or the page was removed. Head back to the home page to keep reading.
      </p>
      <Button asChild size="lg" className="rounded-full px-8">
        <Link href="/en">Back home</Link>
      </Button>
    </div>
  )
}
