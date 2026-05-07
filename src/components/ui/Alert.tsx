interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  onClose?: () => void
}

const colors = {
  success: { bg: '#f0fdf4', border: '#86efac', color: '#166534', icon: '✓' },
  error: { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b', icon: '✕' },
  warning: { bg: '#fffbeb', border: '#fcd34d', color: '#92400e', icon: '⚠' },
  info: { bg: '#eff6ff', border: '#93c5fd', color: '#1e40af', icon: 'ℹ' },
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const c = colors[type]
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
      borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, color: c.color,
      fontSize: 14,
    }}>
      <span style={{ fontWeight: 700 }}>{c.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.color, fontSize: 16, lineHeight: 1 }}
        >
          ✕
        </button>
      )}
    </div>
  )
}
