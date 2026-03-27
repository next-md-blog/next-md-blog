import React from 'react';

export interface UlProps extends React.HTMLAttributes<HTMLUListElement> {}

const Ul = React.forwardRef<HTMLUListElement, UlProps>(
  ({ className, ...props }, ref) => {
    return <ul ref={ref} className={className} {...props} />;
  }
);
Ul.displayName = 'Ul';

export default Ul;

