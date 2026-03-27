import React from 'react';
import { cn } from '@/lib/utils';

export interface AProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

const A = React.forwardRef<HTMLAnchorElement, AProps>(
  ({ className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn('font-medium text-primary underline underline-offset-4', className)}
        {...props}
      />
    );
  }
);
A.displayName = 'A';

export default A;

