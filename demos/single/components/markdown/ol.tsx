import React from 'react';
import { cn } from '@/lib/utils';

export interface OlProps extends React.HTMLAttributes<HTMLOListElement> {}

const Ol = React.forwardRef<HTMLOListElement, OlProps>(
  ({ className, ...props }, ref) => {
    return (
      <ol
        ref={ref}
        className={cn('my-6 ml-6 list-decimal [&>li]:mt-2', className)}
        {...props}
      />
    );
  }
);
Ol.displayName = 'Ol';

export default Ol;

