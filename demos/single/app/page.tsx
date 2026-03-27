import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { DocsLink } from '@/components/docs-link'
import {
  BookOpen,
  FileCode2,
  Globe2,
  LayoutTemplate,
  Moon,
  Search,
} from 'lucide-react'

const features = [
  {
    icon: FileCode2,
    title: 'Markdown + frontmatter',
    text: 'Author in .md with YAML metadata; content stays in git.',
  },
  {
    icon: LayoutTemplate,
    title: 'App Router routes',
    text: 'Dynamic /blog/[slug] and listing pages with static generation.',
  },
  {
    icon: Globe2,
    title: 'SEO-ready',
    text: 'Metadata helpers, JSON-LD, sitemap, and Open Graph images.',
  },
  {
    icon: Search,
    title: 'Type-safe API',
    text: 'Typed post loaders and config from @next-md-blog/core.',
  },
  {
    icon: BookOpen,
    title: 'Typography',
    text: 'Prose styling via Tailwind Typography for readable long-form.',
  },
  {
    icon: Moon,
    title: 'Light & dark',
    text: 'Theme toggle with system preference via next-themes.',
  },
] as const

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 sm:py-16 max-w-6xl">
        <header className="flex justify-end gap-2 mb-10">
          <DocsLink />
          <ThemeToggle />
        </header>

        <section className="text-center mb-16 sm:mb-20">
          <p className="text-sm font-medium text-primary tracking-wide uppercase mb-3">
            next-md-blog
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-5">
            Markdown blog on{' '}
            <span className="text-primary">Next.js</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-prose mx-auto mb-10 leading-relaxed">
            A single-locale demo: file-based posts, great typography, and sensible defaults you can ship or fork.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/blogs">View all posts</Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="rounded-full px-8 bg-card/80 backdrop-blur-sm">
              <Link href="/blog/welcome">Read a sample post</Link>
            </Button>
          </div>
        </section>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <Card
              key={title}
              className="border-border/80 bg-card/70 backdrop-blur-sm shadow-sm transition-shadow hover:shadow-md hover:border-primary/25"
            >
              <CardHeader className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <CardTitle className="text-lg font-semibold leading-snug">{title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">{text}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="mt-12 border-border/80 bg-card/70 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Quick start</CardTitle>
            <CardDescription>Wire the library into your own app in a few steps</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground text-sm sm:text-base">
              <li>
                Install:{' '}
                <code className="bg-muted px-2 py-0.5 rounded-md text-foreground font-mono text-sm">
                  npm install @next-md-blog/core
                </code>
              </li>
              <li>
                Scaffold:{' '}
                <code className="bg-muted px-2 py-0.5 rounded-md text-foreground font-mono text-sm">
                  npx next-md-blog-init
                </code>
              </li>
              <li>
                Add posts under{' '}
                <code className="bg-muted px-2 py-0.5 rounded-md text-foreground font-mono text-sm">posts/</code>
              </li>
              <li>
                Routes resolve at{' '}
                <code className="bg-muted px-2 py-0.5 rounded-md text-foreground font-mono text-sm">
                  /blog/[slug]
                </code>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
