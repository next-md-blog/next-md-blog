/**
 * Utility function to merge class names
 * Similar to clsx/tailwind-merge but simpler for library use
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

