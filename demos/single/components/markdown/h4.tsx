import React from 'react';
import { cn } from '@/lib/utils';

export interface H4Props extends React.HTMLAttributes<HTMLHeadingElement> {}

const H4 = React.forwardRef<HTMLHeadingElement, H4Props>(
  ({ className, ...props }, ref) => {
    return (
      <h4
        ref={ref}
        className={cn('scroll-m-20 text-xl font-semibold tracking-tight', className)}
        {...props}
      />
    );
  }
);
H4.displayName = 'H4';

export default H4;

