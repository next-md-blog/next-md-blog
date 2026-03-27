import React from 'react';
import { cn } from '@/lib/utils';

export interface TheadProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const Thead = React.forwardRef<HTMLTableSectionElement, TheadProps>(
  ({ className, ...props }, ref) => {
    return <thead ref={ref} className={cn('', className)} {...props} />;
  }
);
Thead.displayName = 'Thead';

export default Thead;

