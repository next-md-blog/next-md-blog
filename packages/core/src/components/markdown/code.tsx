import React from 'react';

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {}

const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ className, ...props }, ref) => {
    return <code ref={ref} className={className} {...props} />;
  }
);
Code.displayName = 'Code';

export default Code;

