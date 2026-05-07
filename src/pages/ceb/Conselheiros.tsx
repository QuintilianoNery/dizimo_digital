import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../../services/api'
import type { ConselheiroComunitario, PastoralMovimento } from '../../types'
import CebLayout from '../../components/layout/CebLayout'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const schema = z.object({
  nome: z.string().min(2),
  cargo: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal('')),
  telefone: z.string().optional().nullable(),
  pastoralMovimentoId: z.string().optional().nullable(),
})

type FormData = z.infer<typeof schema>

export default function Conselheiros() {
  const [itens, setItens] = useState<ConselheiroComunitario[]>([])
  const [pastorais, setPastorais] = useState<PastoralMovimento[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ConselheiroComunitario | null>(null)

  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  const load = async () => {
    const [list, pas] = await Promise.all([api.ceb.conselheiros.list(), api.paroquial.pastorais.list()])
    setItens(list as ConselheiroComunitario[])
    setPastorais((pas as PastoralMovimento[]).filter(p => p.status === 'ativo'))
  }

  useEffect(() => {
    void load()
  }, [])

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      email: data.email || null,
      pastoralMovimentoId: data.pastoralMovimentoId || null,
    }

    if (editing) {
      await api.ceb.conselheiros.update(editing.id, payload)
    } else {
      await api.ceb.conselheiros.create(payload)
    }

    setOpen(false)
    setEditing(null)
    form.reset({ nome: '', cargo: '', email: '', telefone: '', pastoralMovimentoId: '' })
    await load()
  }

  const startEdit = (item: ConselheiroComunitario) => {
    setEditing(item)
    form.reset({
      nome: item.nome,
      cargo: item.cargo ?? '',
      email: item.email ?? '',
      telefone: item.telefone ?? '',
      pastoralMovimentoId: item.pastoralMovimentoId ?? '',
    })
    setOpen(true)
  }

  const onDelete = async (id: string) => {
    if (!confirm('Desativar conselheiro?')) return
    await api.ceb.conselheiros.delete(id)
    await load()
  }

  return (
    <CebLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Conselheiros</h1>
        <Button onClick={() => { setEditing(null); setOpen(true) }}>+ Novo</Button>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f3f4f6' }}><th style={{ textAlign: 'left', padding: 12 }}>Nome</th><th style={{ textAlign: 'left', padding: 12 }}>Cargo</th><th style={{ textAlign: 'left', padding: 12 }}>Contato</th><th style={{ textAlign: 'left', padding: 12 }}>Ações</th></tr></thead>
          <tbody>
            {itens.map(i => (
              <tr key={i.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: 12 }}>{i.nome}</td>
                <td style={{ padding: 12 }}>{i.cargo ?? '-'}</td>
                <td style={{ padding: 12 }}>{i.telefone ?? i.email ?? '-'}</td>
                <td style={{ padding: 12, display: 'flex', gap: 8 }}>
                  <Button variant="secondary" style={{ padding: '4px 10px' }} onClick={() => startEdit(i)}>Editar</Button>
                  <Button variant="danger" style={{ padding: '4px 10px' }} onClick={() => { void onDelete(i.id) }}>Desativar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar conselheiro' : 'Novo conselheiro'}>
        <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Nome" {...form.register('nome')} />
          <Input label="Cargo" {...form.register('cargo')} />
          <Input label="Telefone" {...form.register('telefone')} />
          <Input label="E-mail" {...form.register('email')} />
          <Select
            label="Pastoral/Movimento"
            {...form.register('pastoralMovimentoId')}
            options={pastorais.map(p => ({ value: p.id, label: p.nome }))}
            placeholder="Opcional"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={form.formState.isSubmitting}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </CebLayout>
  )
}
