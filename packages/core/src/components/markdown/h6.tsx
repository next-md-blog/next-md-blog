import React from 'react';

export interface H6Props extends React.HTMLAttributes<HTMLHeadingElement> {}

const H6 = React.forwardRef<HTMLHeadingElement, H6Props>(
  ({ className, ...props }, ref) => {
    return <h6 ref={ref} className={className} {...props} />;
  }
);
H6.displayName = 'H6';

export default H6;

