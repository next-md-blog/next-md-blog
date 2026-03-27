import React from 'react';
import { cn } from '@/lib/utils';

export interface H2Props extends React.HTMLAttributes<HTMLHeadingElement> {}

const H2 = React.forwardRef<HTMLHeadingElement, H2Props>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn(
          'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
          className
        )}
        {...props}
      />
    );
  }
);
H2.displayName = 'H2';

export default H2;

