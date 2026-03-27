import React from 'react';
import { cn } from '@/lib/utils';

export interface StrongProps extends React.HTMLAttributes<HTMLElement> {}

const Strong = React.forwardRef<HTMLElement, StrongProps>(
  ({ className, ...props }, ref) => {
    return (
      <strong
        ref={ref}
        className={cn('font-semibold', className)}
        {...props}
      />
    );
  }
);
Strong.displayName = 'Strong';

export default Strong;

