import React from 'react';
import { cn } from '@/lib/utils';

export interface UlProps extends React.HTMLAttributes<HTMLUListElement> {}

const Ul = React.forwardRef<HTMLUListElement, UlProps>(
  ({ className, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn('my-6 ml-6 list-disc [&>li]:mt-2', className)}
        {...props}
      />
    );
  }
);
Ul.displayName = 'Ul';

export default Ul;

