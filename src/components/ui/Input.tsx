import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, ...props }, ref) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    {label && <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>}
    <input
      ref={ref}
      {...props}
      style={{
        padding: '10px 12px',
        borderRadius: 8,
        border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`,
        fontSize: 14,
        outline: 'none',
        background: 'var(--bg-input)',
        color: 'var(--text)',
        transition: 'border-color 0.15s',
        ...props.style,
      }}
    />
    {error && <span style={{ fontSize: 12, color: 'var(--error)' }}>{error}</span>}
  </div>
))
Input.displayName = 'Input'
export default Input
