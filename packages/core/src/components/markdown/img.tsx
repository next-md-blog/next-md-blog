import React from 'react';

export interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const Img = React.forwardRef<HTMLImageElement, ImgProps>(
  ({ className, alt, src, ...props }, ref) => {
    // Generate a fallback alt text from the image filename if alt is not provided
    const altText =
      alt ||
      (typeof src === 'string' && src
        ? `Image: ${src.split('/').pop()?.split('?')[0] || 'image'}`
        : 'Image');
    
    return (
      <img
        ref={ref}
        alt={altText}
        src={src}
        className={className}
        {...props}
      />
    );
  }
);
Img.displayName = 'Img';

export default Img;

