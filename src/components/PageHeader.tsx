import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, className = "", children }: PageHeaderProps & { className?: string }) {
  const hasPx = /\bpx-\d+/.test(className);
  const paddingClass = hasPx ? '' : 'px-5';
  return (
    <div 
      className={`${paddingClass} pt-5 pb-2 text-left w-full select-none ${className}`}
      id={`page-header-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}--wrapper`}
    >
      <div className="flex items-center justify-between gap-4">
        <h1 
          className="page-title text-[#0F172A] tracking-tight font-sans leading-tight" 
          style={{ textTransform: 'none' }}
        >
          {title}
        </h1>
        {children && (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
      <p 
        className="body-text text-[#64748B] leading-[20px] max-w-sm mt-1.5 font-sans"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}
