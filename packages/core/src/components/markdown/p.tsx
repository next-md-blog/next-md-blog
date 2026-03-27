import React from 'react';

export interface PProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const P = React.forwardRef<HTMLParagraphElement, PProps>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={className} {...props} />;
  }
);
P.displayName = 'P';

export default P;

