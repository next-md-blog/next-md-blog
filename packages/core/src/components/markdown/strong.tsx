import React from 'react';

export interface StrongProps extends React.HTMLAttributes<HTMLElement> {}

const Strong = React.forwardRef<HTMLElement, StrongProps>(
  ({ className, ...props }, ref) => {
    return <strong ref={ref} className={className} {...props} />;
  }
);
Strong.displayName = 'Strong';

export default Strong;

