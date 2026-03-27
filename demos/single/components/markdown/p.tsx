import React from 'react';
import { cn } from '@/lib/utils';

export interface PProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const P = React.forwardRef<HTMLParagraphElement, PProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}
        {...props}
      />
    );
  }
);
P.displayName = 'P';

export default P;

