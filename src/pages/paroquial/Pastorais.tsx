import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../../services/api'
import type { PastoralMovimento } from '../../types'
import ParoquialLayout from '../../components/layout/ParoquialLayout'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Alert from '../../components/ui/Alert'

const schema = z.object({
  nome: z.string().min(2, 'Obrigatório'),
  tipo: z.enum(['pastoral', 'movimento']),
})

type FormData = z.infer<typeof schema>

export default function Pastorais() {
  const [items, setItems] = useState<PastoralMovimento[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PastoralMovimento | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { tipo: 'pastoral' } })

  const load = async () => {
    const data = await api.paroquial.pastorais.list()
    setItems(data as PastoralMovimento[])
  }

  useEffect(() => {
    void load()
  }, [])

  const onSubmit = async (data: FormData) => {
    try {
      if (editing) {
        await api.paroquial.pastorais.update(editing.id, data)
        setFeedback({ type: 'success', message: 'Cadastro atualizado.' })
      } else {
        await api.paroquial.pastorais.create(data)
        setFeedback({ type: 'success', message: 'Cadastro criado.' })
      }
      setOpen(false)
      setEditing(null)
      form.reset({ tipo: 'pastoral', nome: '' })
      await load()
    } catch (e: unknown) {
      setFeedback({ type: 'error', message: e instanceof Error ? e.message : 'Erro ao salvar' })
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm('Desativar cadastro?')) {
      return
    }
    await api.paroquial.pastorais.delete(id)
    await load()
  }

  const startEdit = (item: PastoralMovimento) => {
    setEditing(item)
    form.reset({ nome: item.nome, tipo: item.tipo })
    setOpen(true)
  }

  return (
    <ParoquialLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Pastorais e Movimentos</h1>
        <Button onClick={() => { setEditing(null); form.reset({ nome: '', tipo: 'pastoral' }); setOpen(true) }}>+ Novo</Button>
      </div>

      {feedback && <div style={{ marginBottom: 12 }}><Alert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} /></div>}

      <div style={{ background: 'var(--bg-card)', borderRadius: 12, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ textAlign: 'left', padding: 12 }}>Nome</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Tipo</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Status</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: 12 }}>{item.nome}</td>
                <td style={{ padding: 12 }}>{item.tipo}</td>
                <td style={{ padding: 12 }}>{item.status}</td>
                <td style={{ padding: 12, display: 'flex', gap: 8 }}>
                  <Button variant="secondary" onClick={() => startEdit(item)} style={{ padding: '4px 10px' }}>Editar</Button>
                  {item.status === 'ativo' && <Button variant="danger" onClick={() => { void onDelete(item.id) }} style={{ padding: '4px 10px' }}>Desativar</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar cadastro' : 'Novo cadastro'}>
        <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Nome" {...form.register('nome')} error={form.formState.errors.nome?.message} />
          <Select label="Tipo" {...form.register('tipo')} options={[{ value: 'pastoral', label: 'Pastoral' }, { value: 'movimento', label: 'Movimento' }]} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={form.formState.isSubmitting}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </ParoquialLayout>
  )
}
