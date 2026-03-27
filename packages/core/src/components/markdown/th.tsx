import React from 'react';

export interface ThProps extends React.HTMLAttributes<HTMLTableCellElement> {}

const Th = React.forwardRef<HTMLTableCellElement, ThProps>(
  ({ className, ...props }, ref) => {
    return <th ref={ref} className={className} {...props} />;
  }
);
Th.displayName = 'Th';

export default Th;

