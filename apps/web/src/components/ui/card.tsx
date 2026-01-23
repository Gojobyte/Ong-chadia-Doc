import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
  noPadding?: boolean
}

export function Card({
  children,
  className = '',
  hoverEffect = false,
  noPadding = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-xl border border-slate-100 shadow-soft-sm
        ${hoverEffect ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg' : ''}
        ${noPadding ? '' : 'p-6'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
