import React from 'react';
import { cn } from '@/lib/utils';

export interface TdProps extends React.HTMLAttributes<HTMLTableCellElement> {}

const Td = React.forwardRef<HTMLTableCellElement, TdProps>(
  ({ className, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn('border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right', className)}
        {...props}
      />
    );
  }
);
Td.displayName = 'Td';

export default Td;

