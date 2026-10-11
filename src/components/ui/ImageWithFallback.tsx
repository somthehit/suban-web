"use client";

import React, { useState } from "react";
import { ImageOff } from "lucide-react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  containerClassName?: string;
}

export function ImageWithFallback({
  src,
  alt = "Image",
  className = "w-full h-full object-cover",
  fallbackText = "Image unavailable",
  containerClassName = "",
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!src || hasError) {
    return (
      <div
        className={`w-full h-full min-h-[80px] bg-[#04120a] border border-[#163e26]/60 flex flex-col items-center justify-center p-3 text-center text-[#a098b0] select-none ${containerClassName}`}
      >
        <div className="w-8 h-8 rounded-full bg-[#081e12] border border-[#163e26] flex items-center justify-center mb-1 text-[#a098b0]/70">
          <ImageOff className="w-4 h-4 text-[#ff2d78]/70" />
        </div>
        <span className="text-[10px] font-label uppercase tracking-wider text-[#a098b0]/80 line-clamp-1">
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${containerClassName}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-[#081e12] animate-pulse flex items-center justify-center z-10">
          <div className="w-4 h-4 border-2 border-[#00ffcc]/30 border-t-[#00ffcc] rounded-full animate-spin" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100 transition-opacity duration-300"}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...props}
      />
    </div>
  );
}

export default ImageWithFallback;
