import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
