import React from 'react'

interface ButtonProps {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'default' | 'sm'
  isLoading?: boolean
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
}

export function Button({
  variant = 'primary',
  size = 'default',
  isLoading = false,
  disabled = false,
  onClick,
  children,
  className = ''
}: ButtonProps) {
  // Base classes
  const baseClasses = 'flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:pointer-events-none'
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-pomp-blue text-white hover:bg-pomp-blue/90 focus:ring-2 focus:ring-pomp-blue/20',
    outline: 'border border-pomp-blue text-pomp-blue hover:bg-pomp-blue/5 focus:ring-2 focus:ring-pomp-blue/20',
    ghost: 'text-pomp-blue hover:bg-pomp-blue/5 focus:ring-2 focus:ring-pomp-blue/20'
  }
  
  // Size classes
  const sizeClasses = {
    default: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1 text-xs'
  }
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].join(' ')

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}