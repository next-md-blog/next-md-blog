import React from 'react';
import { cn } from '@/lib/utils';

export interface LiProps extends React.HTMLAttributes<HTMLLIElement> {}

const Li = React.forwardRef<HTMLLIElement, LiProps>(
  ({ className, ...props }, ref) => {
    return <li ref={ref} className={cn('', className)} {...props} />;
  }
);
Li.displayName = 'Li';

export default Li;

