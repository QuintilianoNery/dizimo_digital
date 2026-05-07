import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
})
type FormData = z.infer<typeof schema>

export default function AdminLogin() {
  const { refresh } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await api.auth.adminLogin(data.email, data.senha)
      await refresh()
      navigate('/admin')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao fazer login')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✝</div>
          <h1 style={{ margin: 0, color: 'var(--primary)', fontSize: 24 }}>Dízimo Digital</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>Área do Administrador</p>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 32, boxShadow: 'var(--shadow)' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 18 }}>Entrar</h2>
          {error && <div style={{ marginBottom: 16 }}><Alert type="error" message={error} onClose={() => setError('')} /></div>}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="E-mail" type="email" {...register('email')} error={errors.email?.message} />
            <Input label="Senha" type="password" {...register('senha')} error={errors.senha?.message} />
            <Button type="submit" loading={isSubmitting} fullWidth>Entrar</Button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a href="/admin/setup" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Primeiro acesso? Fazer setup</a>
          </div>
        </div>
      </div>
    </div>
  )
}
