import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../../services/api'
import type { Dizimista } from '../../types'
import CebLayout from '../../components/layout/CebLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const schema = z.object({
  nome: z.string().min(2),
  telefone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal('')),
  endereco: z.string().optional().nullable(),
  dataNascimento: z.string().optional().nullable(),
})

type FormData = z.infer<typeof schema>

export default function Dizimistas() {
  const [itens, setItens] = useState<Dizimista[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Dizimista | null>(null)
  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  const load = async () => {
    const data = await api.ceb.dizimistas.list()
    setItens(data as Dizimista[])
  }

  useEffect(() => {
    void load()
  }, [])

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      email: data.email || null,
      dataNascimento: data.dataNascimento || null,
    }

    if (editing) {
      await api.ceb.dizimistas.update(editing.id, payload)
    } else {
      await api.ceb.dizimistas.create(payload)
    }

    setOpen(false)
    setEditing(null)
    form.reset({ nome: '', telefone: '', email: '', endereco: '', dataNascimento: '' })
    await load()
  }

  const startEdit = (item: Dizimista) => {
    setEditing(item)
    form.reset({
      nome: item.nome,
      telefone: item.telefone ?? '',
      email: item.email ?? '',
      endereco: item.endereco ?? '',
      dataNascimento: item.dataNascimento ? item.dataNascimento.slice(0, 10) : '',
    })
    setOpen(true)
  }

  const onDelete = async (id: string) => {
    if (!confirm('Desativar dizimista?')) return
    await api.ceb.dizimistas.delete(id)
    await load()
  }

  return (
    <CebLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Dizimistas</h1>
        <Button onClick={() => { setEditing(null); setOpen(true) }}>+ Novo</Button>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f3f4f6' }}><th style={{ textAlign: 'left', padding: 12 }}>Nome</th><th style={{ textAlign: 'left', padding: 12 }}>Telefone</th><th style={{ textAlign: 'left', padding: 12 }}>E-mail</th><th style={{ textAlign: 'left', padding: 12 }}>Ações</th></tr></thead>
          <tbody>
            {itens.map(i => (
              <tr key={i.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: 12 }}>{i.nome}</td>
                <td style={{ padding: 12 }}>{i.telefone ?? '-'}</td>
                <td style={{ padding: 12 }}>{i.email ?? '-'}</td>
                <td style={{ padding: 12, display: 'flex', gap: 8 }}>
                  <Button variant="secondary" style={{ padding: '4px 10px' }} onClick={() => startEdit(i)}>Editar</Button>
                  <Button variant="danger" style={{ padding: '4px 10px' }} onClick={() => { void onDelete(i.id) }}>Desativar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar dizimista' : 'Novo dizimista'}>
        <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Nome" {...form.register('nome')} />
          <Input label="Telefone" {...form.register('telefone')} />
          <Input label="E-mail" {...form.register('email')} />
          <Input label="Endereço" {...form.register('endereco')} />
          <Input label="Data de nascimento" type="date" {...form.register('dataNascimento')} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={form.formState.isSubmitting}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </CebLayout>
  )
}
