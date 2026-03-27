import React from 'react';

export interface BlockquoteProps extends React.HTMLAttributes<HTMLQuoteElement> {}

const Blockquote = React.forwardRef<HTMLQuoteElement, BlockquoteProps>(
  ({ className, ...props }, ref) => {
    return <blockquote ref={ref} className={className} {...props} />;
  }
);
Blockquote.displayName = 'Blockquote';

export default Blockquote;

