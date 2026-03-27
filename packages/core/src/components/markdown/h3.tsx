import React from 'react';

export interface H3Props extends React.HTMLAttributes<HTMLHeadingElement> {}

const H3 = React.forwardRef<HTMLHeadingElement, H3Props>(
  ({ className, ...props }, ref) => {
    return <h3 ref={ref} className={className} {...props} />;
  }
);
H3.displayName = 'H3';

export default H3;

