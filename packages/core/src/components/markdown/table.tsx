import React from 'react';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="my-6 w-full overflow-y-auto">
        <table ref={ref} className={className} {...props} />
      </div>
    );
  }
);
Table.displayName = 'Table';

export default Table;

