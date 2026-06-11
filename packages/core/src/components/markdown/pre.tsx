import React from 'react';
import { Mermaid } from './Mermaid.js';

export interface PreProps extends React.HTMLAttributes<HTMLPreElement> {}

/** Flatten react-markdown children down to a plain string. */
function toText(node: React.ReactNode): string {
  if (node == null || node === false) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(toText).join('');
  if (React.isValidElement(node)) {
    return toText((node.props as { children?: React.ReactNode }).children);
  }
  return '';
}

/**
 * Fenced-code wrapper. A ```mermaid block is rendered as a diagram via the
 * <Mermaid> component (no <pre> wrapper — a <figure> inside <pre> is invalid
 * HTML). Every other fenced block keeps its normal <pre> rendering.
 */
const Pre = React.forwardRef<HTMLPreElement, PreProps>(
  ({ className, children, ...props }, ref) => {
    const code = React.isValidElement(children) ? children : null;
    const codeClassName = code
      ? ((code.props as { className?: string }).className ?? '')
      : '';
    if (/\blanguage-mermaid\b/.test(codeClassName)) {
      const source = toText(
        (code!.props as { children?: React.ReactNode }).children
      );
      return <Mermaid chart={source} />;
    }
    return (
      <pre ref={ref} className={className} {...props}>
        {children}
      </pre>
    );
  }
);
Pre.displayName = 'Pre';

export default Pre;
