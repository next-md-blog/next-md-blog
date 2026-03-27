import React from 'react';

export interface H2Props extends React.HTMLAttributes<HTMLHeadingElement> {}

const H2 = React.forwardRef<HTMLHeadingElement, H2Props>(
  ({ className, ...props }, ref) => {
    return <h2 ref={ref} className={className} {...props} />;
  }
);
H2.displayName = 'H2';

export default H2;

