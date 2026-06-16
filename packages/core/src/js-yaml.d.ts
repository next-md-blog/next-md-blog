/**
 * Minimal ambient declaration for js-yaml 4.x.
 *
 * js-yaml does not ship its own types and we intentionally avoid pulling in
 * `@types/js-yaml` for the single `load` call used by the frontmatter parser.
 */
declare module 'js-yaml' {
  export interface LoadOptions {
    filename?: string;
    onWarning?: (warning: unknown) => void;
    schema?: unknown;
    json?: boolean;
  }
  export function load(input: string, options?: LoadOptions): unknown;
  export function dump(obj: unknown, options?: Record<string, unknown>): string;
}
