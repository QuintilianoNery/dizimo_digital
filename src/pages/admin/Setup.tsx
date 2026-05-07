import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ApiError, api } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

const schema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmSenha: z.string(),
}).refine(d => d.senha === d.confirmSenha, { message: 'As senhas não coincidem', path: ['confirmSenha'] })

type FormData = z.infer<typeof schema>

function getSetupErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 404) {
    return 'Endpoint de setup não encontrado (404). Isso normalmente acontece quando a API /api não está rodando no ambiente local. Use "vercel dev" para testar as rotas serverless e tente novamente.'
  }

  if (error instanceof Error) return error.message
  return 'Erro ao criar conta'
}

export default function AdminSetup() {
  const { refresh } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await api.auth.adminSetup({ nome: data.nome, email: data.email, senha: data.senha })
      await refresh()
      navigate('/admin')
    } catch (e: unknown) {
      setError(getSetupErrorMessage(e))
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✝</div>
          <h1 style={{ margin: 0, color: 'var(--primary)', fontSize: 24 }}>Dízimo Digital</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>Configuração inicial</p>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 32, boxShadow: 'var(--shadow)' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Criar conta de administrador</h2>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--text-muted)' }}>
            Nenhum administrador foi configurado ainda. Crie a conta principal.
          </p>
          {error && <div style={{ marginBottom: 16 }}><Alert type="error" message={error} onClose={() => setError('')} /></div>}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Nome completo" {...register('nome')} error={errors.nome?.message} />
            <Input label="E-mail" type="email" {...register('email')} error={errors.email?.message} />
            <Input label="Senha" type="password" {...register('senha')} error={errors.senha?.message} />
            <Input label="Confirmar senha" type="password" {...register('confirmSenha')} error={errors.confirmSenha?.message} />
            <Button type="submit" loading={isSubmitting} fullWidth>Criar conta</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
