import React from 'react';

export interface OlProps extends React.HTMLAttributes<HTMLOListElement> {}

const Ol = React.forwardRef<HTMLOListElement, OlProps>(
  ({ className, ...props }, ref) => {
    return <ol ref={ref} className={className} {...props} />;
  }
);
Ol.displayName = 'Ol';

export default Ol;

