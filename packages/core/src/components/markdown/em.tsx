import React from 'react';

export interface EmProps extends React.HTMLAttributes<HTMLElement> {}

const Em = React.forwardRef<HTMLElement, EmProps>(
  ({ className, ...props }, ref) => {
    return <em ref={ref} className={className} {...props} />;
  }
);
Em.displayName = 'Em';

export default Em;

