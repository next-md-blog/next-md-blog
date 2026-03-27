import { ImageResponse } from 'next/og';
import { getBlogPost } from '@next-md-blog/core';
import blogConfig from '@/next-md-blog.config';
{{POSTS_DIR_OPTION}}
// Image metadata
export const alt = 'Blog Post';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string{{LOCALE_PARAM}} }>;
}) {
  const resolvedParams = await params;
{{LOCALE_EXTRACT}}
  const post = await getBlogPost(slug{{POSTS_DIR_PARAM}});

  const title = post?.frontmatter.title || 'Blog Post';
  const description = post?.frontmatter.description || '';
  const siteName = '{{SITE_NAME}}';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f1412',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            height: 6,
            width: '100%',
            background: 'linear-gradient(90deg, #2d9f5e 0%, #4ade80 45%, #86efac 100%)',
          }}
        />
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '72px 80px',
            background:
              'radial-gradient(ellipse 120% 80% at 50% -20%, rgba(45, 159, 94, 0.18), transparent 55%)',
          }}
        >
          <div style={{ maxWidth: 1040 }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.55)',
                marginBottom: 20,
                letterSpacing: '0.02em',
              }}
            >
              {siteName}
            </div>
            <h1
              style={{
                fontSize: title.length > 48 ? 52 : 64,
                fontWeight: 700,
                color: '#fafafa',
                margin: 0,
                marginBottom: description ? 20 : 0,
                lineHeight: 1.12,
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>
            {description ? (
              <p
                style={{
                  fontSize: description.length > 120 ? 26 : 30,
                  color: 'rgba(250,250,250,0.78)',
                  margin: 0,
                  lineHeight: 1.45,
                  fontWeight: 400,
                }}
              >
                {description.length > 180 ? `${description.slice(0, 177)}…` : description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
