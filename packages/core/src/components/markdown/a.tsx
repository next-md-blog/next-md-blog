import React from 'react';

export interface AProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

const A = React.forwardRef<HTMLAnchorElement, AProps>(
  ({ className, ...props }, ref) => {
    return <a ref={ref} className={className} {...props} />;
  }
);
A.displayName = 'A';

export default A;

