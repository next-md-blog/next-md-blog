import React from 'react';

export interface TbodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const Tbody = React.forwardRef<HTMLTableSectionElement, TbodyProps>(
  ({ className, ...props }, ref) => {
    return <tbody ref={ref} className={className} {...props} />;
  }
);
Tbody.displayName = 'Tbody';

export default Tbody;

