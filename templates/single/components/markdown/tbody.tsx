import React from 'react';
import { cn } from '@/lib/utils';

export interface TbodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const Tbody = React.forwardRef<HTMLTableSectionElement, TbodyProps>(
  ({ className, ...props }, ref) => {
    return <tbody ref={ref} className={cn('', className)} {...props} />;
  }
);
Tbody.displayName = 'Tbody';

export default Tbody;

