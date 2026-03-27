'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const locales = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export function LocaleSwitcher({ currentLocale }: { currentLocale?: string }) {
  const pathname = usePathname();

  // Extract the current locale from pathname or use provided one
  const localeFromPath = pathname?.split('/')[1];
  const activeLocale = currentLocale || localeFromPath || 'en';

  // Get the path without locale prefix
  const getPathWithoutLocale = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    // Remove the first segment if it's a locale
    if (locales.some((loc) => loc.code === segments[0])) {
      return '/' + segments.slice(1).join('/');
    }
    return path;
  };

  const getLocalePath = (newLocale: string) => {
    const pathWithoutLocale = getPathWithoutLocale(pathname || '/');
    return `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem key={locale.code} asChild>
            <Link
              href={getLocalePath(locale.code)}
              className={`flex items-center w-full ${
                activeLocale === locale.code ? 'bg-accent' : ''
              }`}
            >
              <span className="mr-2">{locale.flag}</span>
              <span>{locale.name}</span>
              {activeLocale === locale.code && (
                <span className="ml-auto text-xs text-muted-foreground">✓</span>
              )}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

