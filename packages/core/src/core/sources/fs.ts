import fs from 'fs';
import path from 'path';
import { DirectoryError, FileReadError } from '../errors.js';
import type { ContentSource } from './types.js';

export interface FsSourceOptions {
  /**
   * Base directory for relative paths. Defaults to `process.cwd()`, resolved
   * at read time (so a collection defined at module load still follows the
   * working directory Next.js builds from).
   */
  root?: string;
}

function readFileSafe(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) return null;
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new FileReadError(
      filePath,
      error instanceof Error ? error : undefined,
      { operation: 'readFileSafe' },
    );
  }
}

function readDirectorySafe(dirPath: string): string[] {
  try {
    if (!fs.existsSync(dirPath)) return [];
    const stats = fs.statSync(dirPath);
    if (!stats.isDirectory()) return [];
    return fs.readdirSync(dirPath);
  } catch (error) {
    throw new DirectoryError(
      dirPath,
      error instanceof Error ? error : undefined,
      { operation: 'readDirectorySafe' },
    );
  }
}

/**
 * Local filesystem source — the default for every collection.
 *
 * Lists a single directory level (no recursion), exactly like versions
 * before 1.5. Relative paths resolve against `root` (default: `process.cwd()`).
 */
export function fsSource(options: FsSourceOptions = {}): ContentSource {
  const resolve = (p: string) =>
    path.isAbsolute(p) ? p : path.join(options.root ?? process.cwd(), p);
  return {
    name: 'fs',
    async list(dir) {
      return readDirectorySafe(resolve(dir));
    },
    async read(filePath) {
      return readFileSafe(resolve(filePath));
    },
  };
}
