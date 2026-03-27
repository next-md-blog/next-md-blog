import React from 'react';

export interface LiProps extends React.HTMLAttributes<HTMLLIElement> {}

const Li = React.forwardRef<HTMLLIElement, LiProps>(
  ({ className, ...props }, ref) => {
    return <li ref={ref} className={className} {...props} />;
  }
);
Li.displayName = 'Li';

export default Li;

