import React from 'react';

export interface TrProps extends React.HTMLAttributes<HTMLTableRowElement> {}

const Tr = React.forwardRef<HTMLTableRowElement, TrProps>(
  ({ className, ...props }, ref) => {
    return <tr ref={ref} className={className} {...props} />;
  }
);
Tr.displayName = 'Tr';

export default Tr;

