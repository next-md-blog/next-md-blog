'use client';

import React from 'react';

/**
 * Renders a ```mermaid fenced code block as an actual diagram.
 *
 * Mermaid is loaded lazily on the client (it needs the DOM), so it only ships
 * on pages that contain a diagram. The raw source stays in the markup as a
 * no-JS fallback and as crawlable text; JS-executing crawlers see the SVG.
 *
 * `mermaid` is an optional peer dependency — install it in the consuming app
 * to enable rendering. Without it, the source is shown as preformatted text.
 */
export function Mermaid({ chart }: { chart: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [ready, setReady] = React.useState(false);
  const source = chart.trim();

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // `mermaid` is an optional peer dep; the string-typed specifier keeps
        // tsc from trying to resolve it at build time (returns Promise<any>).
        const specifier = 'mermaid' as string;
        const mod = await import(specifier);
        const mermaid = mod.default;
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
        const id = `mmd-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, source);
        if (cancelled || !ref.current) return;
        ref.current.innerHTML = svg;
        setReady(true);
      } catch {
        /* mermaid not installed or render failed — keep the source fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source]);

  return (
    <figure className="mermaid-figure" data-mermaid>
      <div ref={ref} aria-hidden={ready}>
        {!ready ? <pre className="mermaid-source">{source}</pre> : null}
      </div>
    </figure>
  );
}

export default Mermaid;
