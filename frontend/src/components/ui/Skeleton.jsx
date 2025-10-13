import React from 'react';

export default function Skeleton({ width = '100%', height = 16, className = '' }) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={`bg-slate-200 animate-pulse rounded ${className}`}
      style={{ width, height }}
    />
  );
}
