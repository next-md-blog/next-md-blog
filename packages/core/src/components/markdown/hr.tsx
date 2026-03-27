import React from 'react';

export interface HrProps extends React.HTMLAttributes<HTMLHRElement> {}

const Hr = React.forwardRef<HTMLHRElement, HrProps>(
  ({ className, ...props }, ref) => {
    return <hr ref={ref} className={className} {...props} />;
  }
);
Hr.displayName = 'Hr';

export default Hr;

