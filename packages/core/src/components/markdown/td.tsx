import React from 'react';

export interface TdProps extends React.HTMLAttributes<HTMLTableCellElement> {}

const Td = React.forwardRef<HTMLTableCellElement, TdProps>(
  ({ className, ...props }, ref) => {
    return <td ref={ref} className={className} {...props} />;
  }
);
Td.displayName = 'Td';

export default Td;

