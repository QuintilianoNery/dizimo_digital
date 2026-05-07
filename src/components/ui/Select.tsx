import { type SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, ...props }, ref) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>}
      <select
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
          ...props.style,
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span style={{ fontSize: 12, color: 'var(--error)' }}>{error}</span>}
    </div>
  )
)
Select.displayName = 'Select'
export default Select
