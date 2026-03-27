import React from 'react';
import { cn } from '@/lib/utils';

export interface HrProps extends React.HTMLAttributes<HTMLHRElement> {}

const Hr = React.forwardRef<HTMLHRElement, HrProps>(
  ({ className, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn('my-4 md:my-8', className)}
        {...props}
      />
    );
  }
);
Hr.displayName = 'Hr';

export default Hr;

