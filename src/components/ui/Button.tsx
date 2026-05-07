import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  loading?: boolean
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  loading,
  fullWidth,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    border: 'none',
    transition: 'opacity 0.15s, background 0.15s',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }

  const variants: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--primary)', color: '#fff' },
    secondary: { background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)' },
    danger: { background: 'var(--error)', color: '#fff' },
    ghost: { background: 'transparent', color: 'var(--primary)', textDecoration: 'underline' },
  }

  return (
    <button {...props} disabled={disabled || loading} style={{ ...base, ...variants[variant], ...style }}>
      {loading ? '⏳ Aguarde...' : children}
    </button>
  )
}
