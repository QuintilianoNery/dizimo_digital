import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../../services/api'
import type { Paroquia } from '../../types'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

const REMEMBER_KEY = 'dizimo_remember'
type LoginType = 'paroquial' | 'ceb'

const remember: { type: LoginType; paroquiaIdentifier: string; cebIdentifier: string } = (() => {
  const raw = localStorage.getItem(REMEMBER_KEY)
  if (!raw) {
    return { type: 'paroquial' as LoginType, paroquiaIdentifier: '', cebIdentifier: '' }
  }

  try {
    const parsed = JSON.parse(raw) as { type?: LoginType; paroquiaIdentifier?: string; cebIdentifier?: string }
    return {
      type: parsed.type === 'ceb' ? 'ceb' : 'paroquial',
      paroquiaIdentifier: parsed.paroquiaIdentifier ?? '',
      cebIdentifier: parsed.cebIdentifier ?? '',
    }
  } catch {
    return { type: 'paroquial' as LoginType, paroquiaIdentifier: '', cebIdentifier: '' }
  }
})()

const paroquialSchema = z.object({
  identifier: z.string().min(1, 'Identificador obrigatório'),
  senha: z.string().min(1, 'Senha obrigatória'),
  lembrar: z.boolean().optional(),
})

const cebSchema = z.object({
  paroquiaIdentifier: z.string().min(1, 'Paróquia obrigatória'),
  cebIdentifier: z.string().min(1, 'CEB obrigatória'),
  senha: z.string().min(1, 'Senha obrigatória'),
  lembrar: z.boolean().optional(),
})

type ParoquialForm = z.infer<typeof paroquialSchema>
type CebForm = z.infer<typeof cebSchema>

export default function LoginPage() {
  const [type, setType] = useState<LoginType>(remember.type)
  const [error, setError] = useState('')
  const [paroquiaSearch, setParoquiaSearch] = useState(remember.paroquiaIdentifier)
  const [paroquias, setParoquias] = useState<Paroquia[]>([])
  const navigate = useNavigate()

  const paroquialForm = useForm<ParoquialForm>({
    resolver: zodResolver(paroquialSchema),
    defaultValues: {
      identifier: remember.paroquiaIdentifier,
      senha: '',
      lembrar: Boolean(remember.paroquiaIdentifier),
    },
  })

  const cebForm = useForm<CebForm>({
    resolver: zodResolver(cebSchema),
    defaultValues: {
      paroquiaIdentifier: remember.paroquiaIdentifier,
      cebIdentifier: remember.cebIdentifier,
      senha: '',
      lembrar: Boolean(remember.paroquiaIdentifier && remember.cebIdentifier),
    },
  })

  const canSearch = paroquiaSearch.length >= 2

  const buscarParoquias = async () => {
    if (!canSearch) {
      setParoquias([])
      return
    }
    try {
      const data = await api.paroquias.search(paroquiaSearch)
      setParoquias(data as Paroquia[])
    } catch {
      setParoquias([])
    }
  }

  const saveRememberParoquial = (identifier: string, lembrar?: boolean) => {
    if (lembrar) {
      localStorage.setItem(REMEMBER_KEY, JSON.stringify({ type: 'paroquial', paroquiaIdentifier: identifier }))
      return
    }
    localStorage.removeItem(REMEMBER_KEY)
  }

  const saveRememberCeb = (paroquiaIdentifier: string, cebIdentifier: string, lembrar?: boolean) => {
    if (lembrar) {
      localStorage.setItem(REMEMBER_KEY, JSON.stringify({ type: 'ceb', paroquiaIdentifier, cebIdentifier }))
      return
    }
    localStorage.removeItem(REMEMBER_KEY)
  }

  const onParoquialSubmit = async (data: ParoquialForm) => {
    setError('')
    try {
      await api.auth.paroquialLogin(data.identifier, data.senha)
      saveRememberParoquial(data.identifier, data.lembrar)
      navigate('/paroquial/dashboard')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Credenciais inválidas')
    }
  }

  const onCebSubmit = async (data: CebForm) => {
    setError('')
    try {
      await api.auth.cebLogin(data.paroquiaIdentifier, data.cebIdentifier, data.senha)
      saveRememberCeb(data.paroquiaIdentifier, data.cebIdentifier, data.lembrar)
      navigate('/ceb/dashboard')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Credenciais inválidas')
    }
  }

  const paroquiasList = useMemo(() => paroquias.slice(0, 8), [paroquias])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✝</div>
          <h1 style={{ margin: 0, color: 'var(--primary)', fontSize: 24 }}>Dízimo Digital</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>Área Paroquial e CEBs</p>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <Button variant={type === 'paroquial' ? 'primary' : 'secondary'} fullWidth onClick={() => { setType('paroquial'); setError('') }}>
              Paroquial
            </Button>
            <Button variant={type === 'ceb' ? 'primary' : 'secondary'} fullWidth onClick={() => { setType('ceb'); setError('') }}>
              CEB
            </Button>
          </div>

          {error && <div style={{ marginBottom: 16 }}><Alert type="error" message={error} onClose={() => setError('')} /></div>}

          {type === 'paroquial' ? (
            <form onSubmit={paroquialForm.handleSubmit(onParoquialSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Código ou e-mail da paróquia" {...paroquialForm.register('identifier')} error={paroquialForm.formState.errors.identifier?.message} />
              <Input label="Senha" type="password" {...paroquialForm.register('senha')} error={paroquialForm.formState.errors.senha?.message} />
              <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                <input type="checkbox" {...paroquialForm.register('lembrar')} style={{ marginRight: 6 }} />
                Lembrar paróquia (sem salvar senha)
              </label>
              <Button type="submit" loading={paroquialForm.formState.isSubmitting} fullWidth>Entrar como paróquia</Button>
            </form>
          ) : (
            <form onSubmit={cebForm.handleSubmit(onCebSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input
                label="Buscar paróquia"
                placeholder="Digite nome/código e clique Buscar"
                value={paroquiaSearch}
                onChange={e => setParoquiaSearch(e.target.value)}
              />
              <Button type="button" variant="secondary" onClick={buscarParoquias}>Buscar</Button>
              {paroquiasList.length > 0 && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 8, maxHeight: 180, overflowY: 'auto' }}>
                  {paroquiasList.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        cebForm.setValue('paroquiaIdentifier', p.codigoParoquia)
                        setParoquiaSearch(`${p.nome} (#${p.codigoParoquia})`)
                        setParoquias([])
                      }}
                      style={{ width: '100%', textAlign: 'left', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', padding: '10px 12px', cursor: 'pointer' }}
                    >
                      {p.nome} <span style={{ color: 'var(--text-muted)' }}>#{p.codigoParoquia}</span>
                    </button>
                  ))}
                </div>
              )}
              <Input label="Código da CEB" {...cebForm.register('cebIdentifier')} error={cebForm.formState.errors.cebIdentifier?.message} />
              <Input label="Senha" type="password" {...cebForm.register('senha')} error={cebForm.formState.errors.senha?.message} />
              <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                <input type="checkbox" {...cebForm.register('lembrar')} style={{ marginRight: 6 }} />
                Lembrar paróquia e CEB (sem salvar senha)
              </label>
              <Button type="submit" loading={cebForm.formState.isSubmitting} fullWidth>Entrar como CEB</Button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a href="/admin/login" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Acesso administrativo</a>
          </div>
        </div>
      </div>
    </div>
  )
}
