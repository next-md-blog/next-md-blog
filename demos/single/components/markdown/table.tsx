import React from 'react';
import { cn } from '@/lib/utils';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="my-6 w-full overflow-y-auto">
        <table
          ref={ref}
          className={cn('w-full border-collapse border-spacing-0', className)}
          {...props}
        />
      </div>
    );
  }
);
Table.displayName = 'Table';

export default Table;

