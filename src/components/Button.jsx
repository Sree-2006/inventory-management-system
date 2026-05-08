import React from 'react';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm focus:ring-blue-500 active:scale-[0.98]",
    secondary: "bg-purple-100 text-purple-700 hover:bg-purple-200 focus:ring-purple-500 active:scale-[0.98]",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-blue-500 active:scale-[0.98]",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-red-500 active:scale-[0.98]"
  };
  
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
