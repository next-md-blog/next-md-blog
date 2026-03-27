import React from 'react';
import { cn } from '@/lib/utils';

export interface TrProps extends React.HTMLAttributes<HTMLTableRowElement> {}

const Tr = React.forwardRef<HTMLTableRowElement, TrProps>(
  ({ className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn('m-0 border-t p-0 even:bg-muted', className)}
        {...props}
      />
    );
  }
);
Tr.displayName = 'Tr';

export default Tr;

