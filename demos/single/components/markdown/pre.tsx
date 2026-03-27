import React from 'react';
import { cn } from '@/lib/utils';

export interface PreProps extends React.HTMLAttributes<HTMLPreElement> {}

const Pre = React.forwardRef<HTMLPreElement, PreProps>(
  ({ className, ...props }, ref) => {
    return (
      <pre
        ref={ref}
        className={cn(
          'overflow-x-auto rounded-lg border bg-muted p-4 [&>code]:bg-transparent [&>code]:p-0',
          className
        )}
        {...props}
      />
    );
  }
);
Pre.displayName = 'Pre';

export default Pre;

