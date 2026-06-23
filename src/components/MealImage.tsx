import React, { useState } from 'react';

interface MealImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export function MealImage({ src, alt, className = "w-full h-full object-cover", containerClassName = "" }: MealImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src || src === 'placeholder') {
    return (
      <div 
        id="meal_image_fallback"
        className={`w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-50 border border-slate-205 border-slate-200 rounded-xl select-none leading-normal shadow-2xs ${containerClassName}`}
      >
        <span className="text-3xl filter drop-shadow-xs mb-1.5 select-none" id="fallback_meal_emoji">🍽️</span>
        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block" id="fallback_error_text">
          Meal Image Unavailable
        </span>
        <span className="text-[9px] text-slate-400 font-bold block mt-1 truncate max-w-full px-2" id="fallback_food_name">
          {alt || 'Unknown Dish'}
        </span>
      </div>
    );
  }

  return (
    <img
      id="meal_main_image"
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
    />
  );
}
