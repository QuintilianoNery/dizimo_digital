import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../../services/api'
import type { Ceb } from '../../types'
import ParoquialLayout from '../../components/layout/ParoquialLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Alert from '../../components/ui/Alert'
import Select from '../../components/ui/Select'

const createSchema = z.object({
  codigoCeb: z.string().min(1, 'Obrigatório'),
  nome: z.string().min(2, 'Obrigatório'),
  emailLogin: z.string().email('E-mail inválido'),
  senha: z.string().min(8, 'Mínimo 8 caracteres'),
  telefone: z.string().optional(),
})
type CreateForm = z.infer<typeof createSchema>

const editSchema = createSchema.omit({ senha: true }).extend({
  status: z.enum(['ativo', 'inativo']),
})
type EditForm = z.infer<typeof editSchema>

export default function Cebs() {
  const [cebs, setCebs] = useState<Ceb[]>([])
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editCeb, setEditCeb] = useState<Ceb | null>(null)
  const [resetModal, setResetModal] = useState<{ open: boolean; id: string; nome: string }>({ open: false, id: '', nome: '' })
  const [newPassword, setNewPassword] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const navigate = useNavigate()

  const load = () => api.paroquial.cebs.list().then(d => setCebs(d as Ceb[]))
  useEffect(() => { load() }, [])

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) })
  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) })

  const filtered = cebs.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.codigoCeb.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (data: CreateForm) => {
    try {
      await api.paroquial.cebs.create(data)
      setFeedback({ type: 'success', message: 'CEB criada com sucesso!' })
      setCreateOpen(false)
      createForm.reset()
      load()
    } catch (e: unknown) {
      setFeedback({ type: 'error', message: e instanceof Error ? e.message : 'Erro' })
    }
  }

  const handleEdit = async (data: EditForm) => {
    if (!editCeb) return
    try {
      await api.paroquial.cebs.update(editCeb.id, data)
      setFeedback({ type: 'success', message: 'CEB atualizada!' })
      setEditCeb(null)
      load()
    } catch (e: unknown) {
      setFeedback({ type: 'error', message: e instanceof Error ? e.message : 'Erro' })
    }
  }

  const handleResetPassword = async () => {
    if (newPassword.length < 8) return
    try {
      await api.paroquial.cebs.resetPassword(resetModal.id, newPassword)
      setFeedback({ type: 'success', message: 'Senha redefinida!' })
      setResetModal({ open: false, id: '', nome: '' })
      setNewPassword('')
    } catch (e: unknown) {
      setFeedback({ type: 'error', message: e instanceof Error ? e.message : 'Erro' })
    }
  }

  const openEdit = (ceb: Ceb) => {
    setEditCeb(ceb)
    editForm.reset({ codigoCeb: ceb.codigoCeb, nome: ceb.nome, emailLogin: ceb.emailLogin, telefone: ceb.telefone ?? '', status: ceb.status })
  }

  return (
    <ParoquialLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>CEBs</h1>
        <Button onClick={() => setCreateOpen(true)}>+ Nova CEB</Button>
      </div>

      {feedback && <div style={{ marginBottom: 16 }}><Alert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} /></div>}

      <div style={{ marginBottom: 16 }}>
        <Input placeholder="Buscar CEB..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 12, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{ background: 'var(--bg)' }}>
            <tr>
              {['Nome', 'Código', 'E-mail login', 'Status', 'Ações'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{c.nome}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{c.codigoCeb}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{c.emailLogin}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: c.status === 'ativo' ? '#dcfce7' : '#fee2e2',
                    color: c.status === 'ativo' ? '#166534' : '#991b1b',
                  }}>{c.status}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => openEdit(c)}>Editar</Button>
                    <Button variant="secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => { setResetModal({ open: true, id: c.id, nome: c.nome }); setNewPassword('') }}>Senha</Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma CEB encontrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova CEB">
        <form onSubmit={createForm.handleSubmit(handleCreate)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Código" {...createForm.register('codigoCeb')} error={createForm.formState.errors.codigoCeb?.message} />
            <Input label="Nome" {...createForm.register('nome')} error={createForm.formState.errors.nome?.message} />
          </div>
          <Input label="E-mail de login" type="email" {...createForm.register('emailLogin')} error={createForm.formState.errors.emailLogin?.message} />
          <Input label="Senha" type="password" {...createForm.register('senha')} error={createForm.formState.errors.senha?.message} />
          <Input label="Telefone" {...createForm.register('telefone')} />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createForm.formState.isSubmitting}>Criar CEB</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editCeb} onClose={() => setEditCeb(null)} title={`Editar CEB — ${editCeb?.nome}`}>
        <form onSubmit={editForm.handleSubmit(handleEdit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Código" {...editForm.register('codigoCeb')} error={editForm.formState.errors.codigoCeb?.message} />
            <Input label="Nome" {...editForm.register('nome')} error={editForm.formState.errors.nome?.message} />
          </div>
          <Input label="E-mail de login" type="email" {...editForm.register('emailLogin')} error={editForm.formState.errors.emailLogin?.message} />
          <Input label="Telefone" {...editForm.register('telefone')} />
          <Select label="Status" {...editForm.register('status')} options={[{ value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }]} />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={() => setEditCeb(null)}>Cancelar</Button>
            <Button type="submit" loading={editForm.formState.isSubmitting}>Salvar</Button>
          </div>
        </form>
      </Modal>

      <Modal open={resetModal.open} onClose={() => setResetModal({ open: false, id: '', nome: '' })} title={`Redefinir senha — ${resetModal.nome}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Nova senha (mínimo 8 caracteres)" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setResetModal({ open: false, id: '', nome: '' })}>Cancelar</Button>
            <Button onClick={handleResetPassword} disabled={newPassword.length < 8}>Redefinir</Button>
          </div>
        </div>
      </Modal>

      <div style={{ marginTop: 16 }}>
        <Button variant="ghost" onClick={() => navigate('/paroquial/cebs/nova')} style={{ display: 'none' }}>hidden</Button>
      </div>
    </ParoquialLayout>
  )
}
