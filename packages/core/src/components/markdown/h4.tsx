import React from 'react';

export interface H4Props extends React.HTMLAttributes<HTMLHeadingElement> {}

const H4 = React.forwardRef<HTMLHeadingElement, H4Props>(
  ({ className, ...props }, ref) => {
    return <h4 ref={ref} className={className} {...props} />;
  }
);
H4.displayName = 'H4';

export default H4;

