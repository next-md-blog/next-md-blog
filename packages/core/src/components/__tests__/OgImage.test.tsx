import { describe, it, expect } from 'vitest';
import { OgImage } from '../OgImage';

describe('OgImage', () => {
  it('should be a function', () => {
    expect(typeof OgImage).toBe('function');
  });

  it('should accept title prop', () => {
    const props = {
      title: 'Test Title',
    };
    expect(() => OgImage(props)).not.toThrow();
  });

  it('should accept description prop', () => {
    const props = {
      title: 'Test Title',
      description: 'Test Description',
    };
    expect(() => OgImage(props)).not.toThrow();
  });

  it('should accept siteName prop', () => {
    const props = {
      title: 'Test Title',
      siteName: 'My Site',
    };
    expect(() => OgImage(props)).not.toThrow();
  });

  it('should accept backgroundColor prop', () => {
    const props = {
      title: 'Test Title',
      backgroundColor: '#ff0000',
    };
    expect(() => OgImage(props)).not.toThrow();
  });

  it('should accept textColor prop', () => {
    const props = {
      title: 'Test Title',
      textColor: '#ffffff',
    };
    expect(() => OgImage(props)).not.toThrow();
  });

  it('should accept width prop', () => {
    const props = {
      title: 'Test Title',
      width: 1600,
    };
    expect(() => OgImage(props)).not.toThrow();
  });

  it('should accept height prop', () => {
    const props = {
      title: 'Test Title',
      height: 900,
    };
    expect(() => OgImage(props)).not.toThrow();
  });

  it('should have default values', () => {
    const props = {
      title: 'Test Title',
    };
    expect(() => OgImage(props)).not.toThrow();
  });

  it('should accept all props together', () => {
    const props = {
      title: 'Test Title',
      description: 'Test Description',
      siteName: 'My Site',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      width: 1200,
      height: 630,
    };
    expect(() => OgImage(props)).not.toThrow();
  });
});

