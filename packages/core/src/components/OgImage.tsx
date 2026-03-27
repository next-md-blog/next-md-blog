import React from 'react';

/**
 * Props for the OgImage component
 */
export interface OgImageProps {
  /** Title text */
  title: string;
  /** Description/subtitle text */
  description?: string;
  /** Site name */
  siteName?: string;
  /** Background color */
  backgroundColor?: string;
  /** Text color */
  textColor?: string;
  /** Width of the image */
  width?: number;
  /** Height of the image */
  height?: number;
}

/**
 * Default OG Image component for generating Open Graph images
 * This component can be used with @vercel/og or similar libraries
 * 
 * @example
 * ```tsx
 * <OgImage 
 *   title="My Blog Post"
 *   description="A great blog post"
 *   siteName="My Blog"
 * />
 * ```
 */
export function OgImage({
  title,
  description,
  siteName = 'My Blog',
  backgroundColor = '#1a1a1a',
  textColor = '#ffffff',
  width = 1200,
  height = 630,
}: OgImageProps): React.JSX.Element {
  return (
    <div
      style={{
        width,
        height,
        backgroundColor,
        color: textColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '1000px',
        }}
      >
        {siteName && (
          <div
            style={{
              fontSize: '24px',
              opacity: 0.8,
              marginBottom: '20px',
              fontWeight: 500,
            }}
          >
            {siteName}
          </div>
        )}
        <h1
          style={{
            fontSize: '64px',
            fontWeight: 700,
            margin: 0,
            marginBottom: description ? '24px' : 0,
            lineHeight: 1.2,
            wordWrap: 'break-word',
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: '32px',
              opacity: 0.9,
              margin: 0,
              lineHeight: 1.4,
              wordWrap: 'break-word',
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

