import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const PixelButton: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyles = "px-6 py-2 font-bold text-sm uppercase transition-all duration-75 border-2 border-black active:translate-y-1 active:translate-x-1 active:shadow-none";
  
  const variants = {
    primary: "bg-black text-white shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] hover:shadow-[6px_6px_0px_0px_rgba(100,100,100,1)] hover:-translate-y-0.5 hover:-translate-x-0.5",
    secondary: "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5",
    danger: "bg-red-500 text-white border-red-900 shadow-[4px_4px_0px_0px_rgba(100,0,0,1)]"
  };

  return (
    <button className={twMerge(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};

export const PixelCard: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className, title }) => {
  return (
    <div className={twMerge("bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] p-4 text-black", className)}>
      {title && (
        <div className="border-b-2 border-black pb-2 mb-4 font-bold text-lg uppercase tracking-wider flex justify-between items-center text-black">
            <span>// {title}</span>
            <div className="flex gap-1">
                <div className="w-2 h-2 bg-black"></div>
                <div className="w-2 h-2 bg-black"></div>
                <div className="w-2 h-2 bg-black"></div>
            </div>
        </div>
      )}
      {children}
    </div>
  );
};