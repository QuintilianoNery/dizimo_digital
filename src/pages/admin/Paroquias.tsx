import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import type { Paroquia } from '../../types'
import AdminLayout from '../../components/layout/AdminLayout'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'

export default function Paroquias() {
  const [paroquias, setParoquias] = useState<Paroquia[]>([])
  const [search, setSearch] = useState('')
  const [resetModal, setResetModal] = useState<{ open: boolean; id: string; nome: string }>({ open: false, id: '', nome: '' })
  const [newPassword, setNewPassword] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const navigate = useNavigate()

  const load = () => api.admin.paroquias.list().then(d => setParoquias(d as Paroquia[]))
  useEffect(() => { load() }, [])

  const filtered = paroquias.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.codigoParoquia.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Desativar esta paróquia?')) return
    try {
      await api.admin.paroquias.delete(id)
      setFeedback({ type: 'success', message: 'Paróquia desativada' })
      load()
    } catch (e: unknown) {
      setFeedback({ type: 'error', message: e instanceof Error ? e.message : 'Erro' })
    }
  }

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) return
    try {
      await api.admin.paroquias.resetPassword(resetModal.id, newPassword)
      setFeedback({ type: 'success', message: 'Senha redefinida com sucesso' })
      setResetModal({ open: false, id: '', nome: '' })
      setNewPassword('')
    } catch (e: unknown) {
      setFeedback({ type: 'error', message: e instanceof Error ? e.message : 'Erro' })
    }
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Paróquias</h1>
        <Button onClick={() => navigate('/admin/paroquias/nova')}>+ Nova Paróquia</Button>
      </div>

      {feedback && (
        <div style={{ marginBottom: 16 }}>
          <Alert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} />
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <Input placeholder="Buscar por nome ou código..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 12, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{ background: 'var(--bg)' }}>
            <tr>
              {['Nome', 'Código', 'E-mail secretaria', 'Status', 'Ações'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.nome}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{p.codigoParoquia}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{p.emailLoginSecretaria}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: p.status === 'ativo' ? '#dcfce7' : '#fee2e2',
                    color: p.status === 'ativo' ? '#166534' : '#991b1b',
                  }}>{p.status}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => navigate(`/admin/paroquias/${p.id}`)}>Editar</Button>
                    <Button variant="secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => { setResetModal({ open: true, id: p.id, nome: p.nome }); setNewPassword('') }}>Senha</Button>
                    {p.status === 'ativo' && <Button variant="danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(p.id)}>Desativar</Button>}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma paróquia encontrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={resetModal.open} onClose={() => setResetModal({ open: false, id: '', nome: '' })} title={`Redefinir senha — ${resetModal.nome}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Nova senha (mínimo 8 caracteres)" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setResetModal({ open: false, id: '', nome: '' })}>Cancelar</Button>
            <Button onClick={handleResetPassword} disabled={newPassword.length < 8}>Redefinir</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
