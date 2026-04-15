import { ImageResponse } from 'next/og';
import { SITE_NAME } from '../lib/site';

export const alt = `${SITE_NAME} — Markdown-first blogging for Next.js`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: 'linear-gradient(135deg, #0a0a0a 0%, #171717 45%, #262626 100%)',
          color: '#fafafa',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {SITE_NAME}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            fontWeight: 500,
            color: '#a3a3a3',
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          Markdown-first blogging for Next.js — filesystem posts, SEO helpers, RSS, sitemap, and
          optional CLI scaffolding.
        </div>
      </div>
    ),
    { ...size },
  );
}
