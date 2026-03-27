import React from 'react';

export interface H1Props extends React.HTMLAttributes<HTMLHeadingElement> {}

const H1 = React.forwardRef<HTMLHeadingElement, H1Props>(
  ({ className, ...props }, ref) => {
    return <h1 ref={ref} className={className} {...props} />;
  }
);
H1.displayName = 'H1';

export default H1;

