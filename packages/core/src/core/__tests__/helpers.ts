import path from 'path';
import { vi } from 'vitest';
import type { MockFileSystem } from './fixtures.js';

/**
 * Test helpers for common testing operations
 */

/**
 * Creates a mock file system for fs module
 * @param mockFs - Mock file system structure
 * @returns Mocked fs module functions
 */
export function createMockFileSystem(mockFs: MockFileSystem) {
  return {
    existsSync: (filePath: string): boolean => {
      const normalizedPath = path.normalize(filePath);
      return (
        mockFs.directories.some(dir => normalizedPath.includes(dir)) ||
        Object.keys(mockFs.files).some(file => normalizedPath.includes(file))
      );
    },
    readFileSync: (filePath: string): string => {
      const normalizedPath = path.normalize(filePath);
      const file = Object.entries(mockFs.files).find(([key]) =>
        normalizedPath.includes(key)
      );
      if (file) {
        return file[1];
      }
      throw new Error(`File not found: ${filePath}`);
    },
    readdirSync: (dirPath: string): string[] => {
      const normalizedPath = path.normalize(dirPath);
      if (mockFs.directories.includes(normalizedPath)) {
        // Return files in this directory
        return Object.keys(mockFs.files)
          .filter(file => file.startsWith(normalizedPath))
          .map(file => path.basename(file));
      }
      return [];
    },
    statSync: (filePath: string) => {
      const normalizedPath = path.normalize(filePath);
      const isFile = Object.keys(mockFs.files).some(file =>
        normalizedPath.includes(file)
      );
      const isDirectory = mockFs.directories.some(dir =>
        normalizedPath.includes(dir)
      );
      return {
        isFile: () => isFile,
        isDirectory: () => isDirectory,
      };
    },
  };
}

/**
 * Creates mock implementations for fs module functions
 * @param mockFs - Mock file system structure
 * @returns Object with mocked fs functions
 */
export function createFsMocks(mockFs: MockFileSystem) {
  const mockFsModule = createMockFileSystem(mockFs);
  
  return {
    existsSync: vi.fn(mockFsModule.existsSync),
    readFileSync: vi.fn(mockFsModule.readFileSync),
    readdirSync: vi.fn(mockFsModule.readdirSync),
    statSync: vi.fn(mockFsModule.statSync),
  };
}

/**
 * Creates a mock matter function that returns parsed frontmatter
 * @param frontmatter - Frontmatter data
 * @param content - Markdown content
 */
export function createMockMatter(frontmatter: Record<string, unknown>, content: string) {
  return {
    data: frontmatter,
    content,
  };
}

/**
 * Helper to create a file path for testing
 */
export function createTestFilePath(slug: string, extension: string = '.md'): string {
  return path.join(process.cwd(), 'posts', `${slug}${extension}`);
}

/**
 * Helper to create a directory path for testing
 */
export function createTestDirPath(dirName: string = 'posts'): string {
  return path.join(process.cwd(), dirName);
}

