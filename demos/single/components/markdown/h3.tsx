import React from 'react';
import { cn } from '@/lib/utils';

export interface H3Props extends React.HTMLAttributes<HTMLHeadingElement> {}

const H3 = React.forwardRef<HTMLHeadingElement, H3Props>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)}
        {...props}
      />
    );
  }
);
H3.displayName = 'H3';

export default H3;

