interface AvatarProps {
  src?: string
  alt?: string
  fallback: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  className = '',
}: AvatarProps) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  }

  return (
    <div
      className={`relative inline-block rounded-full overflow-hidden bg-slate-100 ${sizes[size]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt || fallback}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-700 font-semibold">
          {fallback.substring(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  )
}
