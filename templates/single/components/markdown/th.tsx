import React from 'react';
import { cn } from '@/lib/utils';

export interface ThProps extends React.HTMLAttributes<HTMLTableCellElement> {}

const Th = React.forwardRef<HTMLTableCellElement, ThProps>(
  ({ className, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          'border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right',
          className
        )}
        {...props}
      />
    );
  }
);
Th.displayName = 'Th';

export default Th;

