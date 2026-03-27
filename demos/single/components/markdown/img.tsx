import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
}

const Img = React.forwardRef<HTMLImageElement, ImgProps>(
  ({ className, src, alt, width, height, ...props }, ref) => {
    if (!src) {
      return null;
    }
    
    // Check if it's an external URL
    const isExternal = src.startsWith('http://') || src.startsWith('https://');
    
    // Convert width and height to numbers if provided as strings
    const imageWidth = width 
      ? (typeof width === 'string' ? (parseInt(width, 10) || 800) : width)
      : 800;
    const imageHeight = height 
      ? (typeof height === 'string' ? (parseInt(height, 10) || 400) : height)
      : 400;
    
    if (isExternal) {
      return (
        <img
          ref={ref}
          src={src}
          alt={alt || ''}
          width={width}
          height={height}
          className={cn('rounded-lg border', className)}
          {...props}
        />
      );
    }
    
    return (
      <Image
        src={src}
        alt={alt || ''}
        width={imageWidth}
        height={imageHeight}
        className={cn('rounded-lg border', className)}
        {...props}
      />
    );
  }
);
Img.displayName = 'Img';

export default Img;

