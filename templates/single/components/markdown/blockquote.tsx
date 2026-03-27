import React from 'react';
import { cn } from '@/lib/utils';

export interface BlockquoteProps extends React.HTMLAttributes<HTMLQuoteElement> {}

const Blockquote = React.forwardRef<HTMLQuoteElement, BlockquoteProps>(
  ({ className, ...props }, ref) => {
    return (
      <blockquote
        ref={ref}
        className={cn('mt-6 border-l-2 pl-6 italic', className)}
        {...props}
      />
    );
  }
);
Blockquote.displayName = 'Blockquote';

export default Blockquote;

