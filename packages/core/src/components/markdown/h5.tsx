import React from 'react';

export interface H5Props extends React.HTMLAttributes<HTMLHeadingElement> {}

const H5 = React.forwardRef<HTMLHeadingElement, H5Props>(
  ({ className, ...props }, ref) => {
    return <h5 ref={ref} className={className} {...props} />;
  }
);
H5.displayName = 'H5';

export default H5;

