import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../../services/api'
import type { Paroquia } from '../../types'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import Select from '../../components/ui/Select'

type LoginType = 'paroquial' | 'ceb'

const paroquialSchema = z.object({
  identifier: z.string().min(1, 'Identificador obrigatório'),
  senha: z.string().min(1, 'Senha obrigatória'),
})
const cebSchema = z.object({
  paroquiaIdentifier: z.string().min(1, 'Identificador da paróquia obrigatório'),
  cebIdentifier: z.string().min(1, 'Identificador da CEB obrigatório'),
  senha: z.string().min(1, 'Senha obrigatória'),
})

type ParoquialForm = z.infer<typeof paroquialSchema>
type CebForm = z.infer<typeof cebSchema>

export default function LoginPage() {
  const [type, setType] = useState<LoginType>('paroquial')
  const [error, setError] = useState('')
  const [paroquiaSearch, setParoquiaSearch] = useState('')
  const [paroquias, setParoquias] = useState<Paroquia[]>([])
  const navigate = useNavigate()

  // Restore remember-me
  useEffect(() => {
    const saved = localStorage.getItem('dizimo_remember')
    if (saved) {
      const data = JSON.parse(saved)
      setType(data.type)
    }
  }, [])

  const paroquialForm = useForm<ParoquialForm>({ resolver: zodResolver(paroquialSchema) })
  const cebForm = useForm<CebForm>({ resolver: zodResolver(cebSchema) })

  useEffect(() => {
    if (paroquiaSearch.length >= 2) {
      api.paroquias.search(paroquiaSearch).then(d => setParoquias(d as Paroquia[]))
    } else {
      setParoquias([])
    }
  }, [paroquiaSearch])

  const onParoquialSubmit = async (data: ParoquialForm) => {
    setError('')
    try {
      await api.auth.paroquialLogin(data.identifier, data.senha)
      localStorage.setItem('dizimo_remember', JSON.stringify({ type: 'paroquial' }))
      navigate('/paroquial')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Credenciais inválidas')
    }
  }

  const onCebSubmit = async (data: CebForm) => {
    setError('')
    try {
      await api.auth.cebLogin(data.paroquiaIdentifier, data.cebIdentifier, data.senha)
      localStorage.setItem('dizimo_remember', JSON.stringify({ type: 'ceb' }))
      navigate('/ceb')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Credenciais inválidas')
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
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>Sistema de gestão de dízimos</p>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 32, boxShadow: 'var(--shadow)' }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 8, padding: 4, marginBottom: 24 }}>
            {(['paroquial', 'ceb'] as LoginType[]).map(t => (
              <button
                key={t}
                onClick={() => { setType(t); setError('') }}
                style={{
                  flex: 1, padding: '8px 0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  background: type === t ? 'var(--bg-card)' : 'transparent',
                  color: type === t ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: type === t ? 'var(--shadow)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {t === 'paroquial' ? '⛪ Paróquia' : '🏘 CEB'}
              </button>
            ))}
          </div>

          {error && <div style={{ marginBottom: 16 }}><Alert type="error" message={error} onClose={() => setError('')} /></div>}

          {type === 'paroquial' ? (
            <form onSubmit={paroquialForm.handleSubmit(onParoquialSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                label="Código ou e-mail da paróquia"
                {...paroquialForm.register('identifier')}
                error={paroquialForm.formState.errors.identifier?.message}
              />
              <Input
                label="Senha"
                type="password"
                {...paroquialForm.register('senha')}
                error={paroquialForm.formState.errors.senha?.message}
              />
              <Button type="submit" loading={paroquialForm.formState.isSubmitting} fullWidth>Entrar como Paróquia</Button>
            </form>
          ) : (
            <form onSubmit={cebForm.handleSubmit(onCebSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <Input
                  label="Buscar paróquia"
                  placeholder="Digite o nome ou código da paróquia..."
                  value={paroquiaSearch}
                  onChange={e => setParoquiaSearch(e.target.value)}
                />
                {paroquias.length > 0 && (
                  <div style={{
                    border: '1px solid var(--border)', borderRadius: 8, marginTop: 4,
                    background: 'var(--bg-card)', maxHeight: 160, overflowY: 'auto',
                  }}>
                    {paroquias.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          cebForm.setValue('paroquiaIdentifier', p.codigoParoquia)
                          setParoquiaSearch(p.nome)
                          setParoquias([])
                        }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px',
                          border: 'none', background: 'none', cursor: 'pointer', fontSize: 13,
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        <strong>{p.nome}</strong>
                        <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>#{p.codigoParoquia}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Input
                label="Código da CEB"
                {...cebForm.register('cebIdentifier')}
                error={cebForm.formState.errors.cebIdentifier?.message}
              />
              <Input
                label="Senha"
                type="password"
                {...cebForm.register('senha')}
                error={cebForm.formState.errors.senha?.message}
              />
              <Button type="submit" loading={cebForm.formState.isSubmitting} fullWidth>Entrar como CEB</Button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <a href="/admin/login" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Acesso administrativo</a>
          </div>
        </div>
      </div>
    </div>
  )
}
