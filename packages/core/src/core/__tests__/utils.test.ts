import { describe, it, expect } from 'vitest';
import { normalizeAuthors } from '../utils';
import type { Author } from '../types';

describe('normalizeAuthors', () => {
  const mockConfigAuthors: Author[] = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      bio: 'Software developer',
      twitter: '@johndoe',
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      bio: 'Tech writer',
      github: 'janesmith',
    },
    {
      name: 'Alex Johnson',
      email: 'alex@example.com',
      avatar: '/avatars/alex.jpg',
    },
  ];

  describe('backward compatibility (no config authors)', () => {
    it('should return string array when no config authors provided', () => {
      const result = normalizeAuthors('John Doe', undefined, undefined);
      expect(result).toEqual(['John Doe']);
      expect(typeof result[0]).toBe('string');
    });

    it('should handle author as string', () => {
      const result = normalizeAuthors('John Doe');
      expect(result).toEqual(['John Doe']);
    });

    it('should handle author as array', () => {
      const result = normalizeAuthors(['John Doe', 'Jane Smith']);
      expect(result).toEqual(['John Doe', 'Jane Smith']);
    });

    it('should handle authors field', () => {
      const result = normalizeAuthors(undefined, ['John Doe', 'Jane Smith']);
      expect(result).toEqual(['John Doe', 'Jane Smith']);
    });

    it('should merge author and authors fields (authors first)', () => {
      const result = normalizeAuthors('John Doe', ['Jane Smith']);
      // Authors field comes first, then author field
      expect(result).toEqual(['Jane Smith', 'John Doe']);
    });

    it('should remove duplicates', () => {
      const result = normalizeAuthors('John Doe', ['John Doe', 'Jane Smith']);
      expect(result).toEqual(['John Doe', 'Jane Smith']);
    });

    it('should handle empty arrays', () => {
      const result = normalizeAuthors(undefined, []);
      expect(result).toEqual([]);
    });

    it('should filter out empty strings', () => {
      const result = normalizeAuthors('John Doe', ['', 'Jane Smith', '   ']);
      // Authors field first (Jane Smith), then author field (John Doe)
      expect(result).toEqual(['Jane Smith', 'John Doe']);
    });
  });

  describe('author resolution with config authors', () => {
    it('should resolve author name to Author object when found', () => {
      const result = normalizeAuthors('John Doe', undefined, mockConfigAuthors);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockConfigAuthors[0]);
      expect(typeof result[0]).toBe('object');
    });

    it('should resolve multiple authors to Author objects', () => {
      const result = normalizeAuthors(
        undefined,
        ['John Doe', 'Jane Smith'],
        mockConfigAuthors
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockConfigAuthors[0]);
      expect(result[1]).toEqual(mockConfigAuthors[1]);
    });

    it('should return string when author not found in config', () => {
      const result = normalizeAuthors('Unknown Author', undefined, mockConfigAuthors);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('Unknown Author');
      expect(typeof result[0]).toBe('string');
    });

    it('should handle author as array of objects with name property', () => {
      const result = normalizeAuthors(
        [{ name: 'John Doe' }, { name: 'Jane Smith' }],
        undefined,
        mockConfigAuthors
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockConfigAuthors[0]);
      expect(result[1]).toEqual(mockConfigAuthors[1]);
    });

    it('should handle authors field as array of objects with name property', () => {
      const result = normalizeAuthors(
        undefined,
        [{ name: 'John Doe' }, { name: 'Jane Smith' }],
        mockConfigAuthors
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockConfigAuthors[0]);
      expect(result[1]).toEqual(mockConfigAuthors[1]);
    });

    it('should handle single author object with name property', () => {
      const result = normalizeAuthors(
        { name: 'John Doe' },
        undefined,
        mockConfigAuthors
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockConfigAuthors[0]);
    });

    it('should handle mixed array of strings and objects with name property', () => {
      const result = normalizeAuthors(
        ['John Doe', { name: 'Jane Smith' }],
        undefined,
        mockConfigAuthors
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockConfigAuthors[0]);
      expect(result[1]).toEqual(mockConfigAuthors[1]);
    });

    it('should resolve objects with name property from config', () => {
      const result = normalizeAuthors(
        [{ name: 'John Doe' }, { name: 'Unknown Author' }],
        undefined,
        mockConfigAuthors
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockConfigAuthors[0]);
      expect(result[1]).toBe('Unknown Author');
      expect(typeof result[1]).toBe('string');
    });

    it('should handle mix of found and not found authors', () => {
      const result = normalizeAuthors(
        undefined,
        ['John Doe', 'Unknown Author', 'Jane Smith'],
        mockConfigAuthors
      );
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(mockConfigAuthors[0]);
      expect(result[1]).toBe('Unknown Author');
      expect(result[2]).toEqual(mockConfigAuthors[1]);
    });

    it('should match case-insensitively', () => {
      const result1 = normalizeAuthors('john doe', undefined, mockConfigAuthors);
      const result2 = normalizeAuthors('JOHN DOE', undefined, mockConfigAuthors);
      const result3 = normalizeAuthors('John Doe', undefined, mockConfigAuthors);

      expect(result1[0]).toEqual(mockConfigAuthors[0]);
      expect(result2[0]).toEqual(mockConfigAuthors[0]);
      expect(result3[0]).toEqual(mockConfigAuthors[0]);
    });

    it('should handle author as array with config authors', () => {
      const result = normalizeAuthors(
        ['John Doe', 'Jane Smith'],
        undefined,
        mockConfigAuthors
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockConfigAuthors[0]);
      expect(result[1]).toEqual(mockConfigAuthors[1]);
    });

    it('should preserve order when resolving authors', () => {
      const result = normalizeAuthors(
        undefined,
        ['Jane Smith', 'John Doe', 'Alex Johnson'],
        mockConfigAuthors
      );
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(mockConfigAuthors[1]); // Jane Smith
      expect(result[1]).toEqual(mockConfigAuthors[0]); // John Doe
      expect(result[2]).toEqual(mockConfigAuthors[2]); // Alex Johnson
    });

    it('should handle empty config authors array', () => {
      const result = normalizeAuthors('John Doe', undefined, []);
      expect(result).toEqual(['John Doe']);
      expect(typeof result[0]).toBe('string');
    });

    it('should handle undefined config authors', () => {
      const result = normalizeAuthors('John Doe', undefined, undefined);
      expect(result).toEqual(['John Doe']);
      expect(typeof result[0]).toBe('string');
    });
  });

  describe('edge cases', () => {
    it('should handle author as single object with name property (Quarto format)', () => {
      const result = normalizeAuthors({ name: 'John Doe' }, undefined, mockConfigAuthors);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockConfigAuthors[0]);
    });

    it('should handle author as single object with name and other properties', () => {
      const result = normalizeAuthors(
        { name: 'John Doe', affiliation: 'Carnegie Mellon University' },
        undefined,
        mockConfigAuthors
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockConfigAuthors[0]);
    });

    it('should enrich author object format with config (Quarto format)', () => {
      const result = normalizeAuthors(
        { name: 'John Doe', affiliation: 'Carnegie Mellon University', email: 'test@example.com' },
        undefined,
        mockConfigAuthors
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockConfigAuthors[0]); // Should be enriched from config
      expect(typeof result[0]).toBe('object');
    });

    it('should enrich array of author objects with config', () => {
      const result = normalizeAuthors(
        [
          { name: 'John Doe', affiliation: 'Carnegie Mellon University' },
          { name: 'Jane Smith', affiliation: 'University of Chicago' },
        ],
        undefined,
        mockConfigAuthors
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockConfigAuthors[0]);
      expect(result[1]).toEqual(mockConfigAuthors[1]);
      expect(typeof result[0]).toBe('object');
      expect(typeof result[1]).toBe('object');
    });

    it('should enrich mixed array (strings and objects) with config', () => {
      const result = normalizeAuthors(
        [
          'John Doe',
          { name: 'Jane Smith', affiliation: 'University of Chicago' },
        ],
        undefined,
        mockConfigAuthors
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockConfigAuthors[0]);
      expect(result[1]).toEqual(mockConfigAuthors[1]);
      expect(typeof result[0]).toBe('object');
      expect(typeof result[1]).toBe('object');
    });

    it('should handle author as single object without config', () => {
      const result = normalizeAuthors({ name: 'John Doe' }, undefined, undefined);
      expect(result).toEqual(['John Doe']);
      expect(typeof result[0]).toBe('string');
    });

    it('should handle whitespace in author names', () => {
      const result = normalizeAuthors('  John Doe  ', undefined, mockConfigAuthors);
      expect(result[0]).toEqual(mockConfigAuthors[0]);
    });

    it('should handle author with all fields populated', () => {
      const fullAuthor: Author = {
        name: 'Full Author',
        id: 'full-author',
        email: 'full@example.com',
        bio: 'Full bio',
        avatar: '/avatar.jpg',
        url: 'https://example.com',
        twitter: '@fullauthor',
        github: 'fullauthor',
        linkedin: 'https://linkedin.com/in/fullauthor',
      };
      const configAuthors: Author[] = [fullAuthor];
      const result = normalizeAuthors('Full Author', undefined, configAuthors);
      expect(result[0]).toEqual(fullAuthor);
    });

    it('should handle author with minimal fields', () => {
      const minimalAuthor: Author = {
        name: 'Minimal Author',
      };
      const configAuthors: Author[] = [minimalAuthor];
      const result = normalizeAuthors('Minimal Author', undefined, configAuthors);
      expect(result[0]).toEqual(minimalAuthor);
    });

    it('should not match partial names', () => {
      const result = normalizeAuthors('John', undefined, mockConfigAuthors);
      expect(result[0]).toBe('John'); // Should not match "John Doe"
      expect(typeof result[0]).toBe('string');
    });

    it('should handle special characters in names', () => {
      const specialAuthor: Author = {
        name: "O'Brien-Smith",
        email: 'obrien@example.com',
      };
      const configAuthors: Author[] = [specialAuthor];
      const result = normalizeAuthors("O'Brien-Smith", undefined, configAuthors);
      expect(result[0]).toEqual(specialAuthor);
    });
  });

  describe('integration scenarios', () => {
    it('should work with real-world frontmatter patterns', () => {
      // Simulating: author: "John Doe"
      const result1 = normalizeAuthors('John Doe', undefined, mockConfigAuthors);
      expect(result1[0]).toEqual(mockConfigAuthors[0]);

      // Simulating: authors: ["John Doe", "Jane Smith"]
      const result2 = normalizeAuthors(
        undefined,
        ['John Doe', 'Jane Smith'],
        mockConfigAuthors
      );
      expect(result2).toHaveLength(2);
      expect(result2[0]).toEqual(mockConfigAuthors[0]);
      expect(result2[1]).toEqual(mockConfigAuthors[1]);

      // Simulating: author: ["John Doe", "Jane Smith"]
      const result3 = normalizeAuthors(
        ['John Doe', 'Jane Smith'],
        undefined,
        mockConfigAuthors
      );
      expect(result3).toHaveLength(2);
    });

    it('should handle migration scenario (old posts without config)', () => {
      // Old posts with just author names, no config
      const result = normalizeAuthors('John Doe', undefined, undefined);
      expect(result).toEqual(['John Doe']);
      expect(typeof result[0]).toBe('string');
    });

    it('should handle new posts with config', () => {
      // New posts with author names that match config
      const result = normalizeAuthors('John Doe', undefined, mockConfigAuthors);
      expect(result[0]).toEqual(mockConfigAuthors[0]);
      expect(typeof result[0]).toBe('object');
    });

    it('should enrich all formats: string, object, array of strings, array of objects', () => {
      // Test string format
      const result1 = normalizeAuthors('John Doe', undefined, mockConfigAuthors);
      expect(result1[0]).toEqual(mockConfigAuthors[0]);
      expect(typeof result1[0]).toBe('object');

      // Test object format
      const result2 = normalizeAuthors({ name: 'John Doe' }, undefined, mockConfigAuthors);
      expect(result2[0]).toEqual(mockConfigAuthors[0]);
      expect(typeof result2[0]).toBe('object');

      // Test array of strings
      const result3 = normalizeAuthors(['John Doe', 'Jane Smith'], undefined, mockConfigAuthors);
      expect(result3[0]).toEqual(mockConfigAuthors[0]);
      expect(result3[1]).toEqual(mockConfigAuthors[1]);
      expect(typeof result3[0]).toBe('object');
      expect(typeof result3[1]).toBe('object');

      // Test array of objects
      const result4 = normalizeAuthors(
        [{ name: 'John Doe' }, { name: 'Jane Smith' }],
        undefined,
        mockConfigAuthors
      );
      expect(result4[0]).toEqual(mockConfigAuthors[0]);
      expect(result4[1]).toEqual(mockConfigAuthors[1]);
      expect(typeof result4[0]).toBe('object');
      expect(typeof result4[1]).toBe('object');
    });
  });
});

