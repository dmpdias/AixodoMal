import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Logo = ({ className = "", textClassName = "", dark = false }: { className?: string, textClassName?: string, dark?: boolean }) => (
  <div className={cn("flex items-center font-serif font-bold leading-none", className)}>
    <span className="text-accent">AI</span>
    <span className={cn(dark ? "text-paper" : "text-ink", "ml-0.5", textClassName)}>xo do Mal</span>
  </div>
);
