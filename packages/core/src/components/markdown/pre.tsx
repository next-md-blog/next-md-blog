import React from 'react';

export interface PreProps extends React.HTMLAttributes<HTMLPreElement> {}

const Pre = React.forwardRef<HTMLPreElement, PreProps>(
  ({ className, ...props }, ref) => {
    return <pre ref={ref} className={className} {...props} />;
  }
);
Pre.displayName = 'Pre';

export default Pre;

