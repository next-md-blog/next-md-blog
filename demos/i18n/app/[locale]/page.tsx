import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { DocsLink } from '@/components/docs-link'
import {
  BookOpen,
  FileCode2,
  Globe2,
  Languages,
  LayoutTemplate,
  Moon,
  Search,
} from 'lucide-react'

const features = [
  {
    icon: Languages,
    title: 'Locale-aware posts',
    text: 'Organize content under posts/[locale]/ with matching URL segments.',
  },
  {
    icon: FileCode2,
    title: 'Markdown + frontmatter',
    text: 'Author in .md with YAML metadata; content stays in git.',
  },
  {
    icon: LayoutTemplate,
    title: 'App Router routes',
    text: 'Dynamic /[locale]/blog/[slug] and localized listing pages.',
  },
  {
    icon: Globe2,
    title: 'SEO-ready',
    text: 'Metadata helpers, JSON-LD, sitemap, and Open Graph images.',
  },
  {
    icon: Search,
    title: 'Type-safe API',
    text: 'Typed post loaders with locale passed through @next-md-blog/core.',
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

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 sm:py-16 max-w-6xl">
        <header className="flex flex-wrap justify-end gap-2 mb-10">
          <DocsLink />
          <ThemeToggle />
          <LocaleSwitcher currentLocale={locale} />
        </header>

        <section className="text-center mb-16 sm:mb-20">
          <p className="text-sm font-medium text-primary tracking-wide uppercase mb-3">
            next-md-blog
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-5">
            Multi-language{' '}
            <span className="text-primary">markdown blog</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-prose mx-auto mb-10 leading-relaxed">
            An i18n demo: per-locale posts, locale switcher, and the same polished reading experience.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href={`/${locale}/blogs`}>All posts ({locale})</Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="rounded-full px-8 bg-card/80 backdrop-blur-sm">
              <Link href={`/${locale}/blog/welcome`}>Sample post</Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="rounded-full px-8 bg-card/80 backdrop-blur-sm">
              <Link href={locale === 'en' ? '/fr/blogs' : '/en/blogs'}>
                {locale === 'en' ? 'Voir le blog (FR)' : 'View blog (EN)'}
              </Link>
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
            <CardDescription>Enable i18n when you scaffold</CardDescription>
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
                  npx next-md-blog-init --i18n-enabled
                </code>
              </li>
              <li>
                Add posts under{' '}
                <code className="bg-muted px-2 py-0.5 rounded-md text-foreground font-mono text-sm">
                  posts/[locale]/
                </code>
              </li>
              <li>
                Routes resolve at{' '}
                <code className="bg-muted px-2 py-0.5 rounded-md text-foreground font-mono text-sm">
                  /[locale]/blog/[slug]
                </code>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
