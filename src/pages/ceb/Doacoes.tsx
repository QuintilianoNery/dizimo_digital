import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../../services/api'
import type { Dizimista, Doacao } from '../../types'
import CebLayout from '../../components/layout/CebLayout'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const now = new Date()

const schema = z.object({
  dizimistaId: z.string().optional().nullable(),
  valor: z.coerce.number().positive(),
  competenciaMes: z.coerce.number().min(1).max(12),
  competenciaAno: z.coerce.number().min(2000),
  tipoDoacao: z.enum(['dizimo', 'oferta', 'doacao']),
  formaPagamento: z.enum(['dinheiro', 'pix', 'transferencia']),
  observacoes: z.string().optional().nullable(),
})

type FormData = z.infer<typeof schema>

export default function Doacoes() {
  const [itens, setItens] = useState<Doacao[]>([])
  const [dizimistas, setDizimistas] = useState<Dizimista[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Doacao | null>(null)
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      competenciaMes: now.getMonth() + 1,
      competenciaAno: now.getFullYear(),
      tipoDoacao: 'dizimo',
      formaPagamento: 'dinheiro',
    },
  })

  const load = async () => {
    const [list, dz] = await Promise.all([api.ceb.doacoes.list(), api.ceb.dizimistas.list()])
    setItens(list as Doacao[])
    setDizimistas((dz as Dizimista[]).filter(d => d.status === 'ativo'))
  }

  useEffect(() => {
    void load()
  }, [])

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      dizimistaId: data.dizimistaId || null,
      observacoes: data.observacoes || null,
    }

    if (editing) {
      await api.ceb.doacoes.update(editing.id, payload)
    } else {
      await api.ceb.doacoes.create(payload)
    }

    setOpen(false)
    setEditing(null)
    form.reset({
      dizimistaId: '',
      valor: undefined,
      competenciaMes: now.getMonth() + 1,
      competenciaAno: now.getFullYear(),
      tipoDoacao: 'dizimo',
      formaPagamento: 'dinheiro',
      observacoes: '',
    })
    await load()
  }

  const startEdit = (item: Doacao) => {
    setEditing(item)
    form.reset({
      dizimistaId: item.dizimistaId ?? '',
      valor: item.valor,
      competenciaMes: item.competenciaMes,
      competenciaAno: item.competenciaAno,
      tipoDoacao: item.tipoDoacao,
      formaPagamento: item.formaPagamento,
      observacoes: item.observacoes ?? '',
    })
    setOpen(true)
  }

  const onDelete = async (id: string) => {
    if (!confirm('Excluir doação?')) return
    await api.ceb.doacoes.delete(id)
    await load()
  }

  return (
    <CebLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Doações</h1>
        <Button onClick={() => { setEditing(null); setOpen(true) }}>+ Nova</Button>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ textAlign: 'left', padding: 12 }}>Dizimista</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Tipo</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Competência</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Valor</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {itens.map(i => (
              <tr key={i.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: 12 }}>{i.dizimista?.nome ?? 'Avulsa'}</td>
                <td style={{ padding: 12 }}>{i.tipoDoacao}</td>
                <td style={{ padding: 12 }}>{`${i.competenciaMes}/${i.competenciaAno}`}</td>
                <td style={{ padding: 12 }}>{i.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td style={{ padding: 12, display: 'flex', gap: 8 }}>
                  <Button variant="secondary" style={{ padding: '4px 10px' }} onClick={() => startEdit(i)}>Editar</Button>
                  <Button variant="danger" style={{ padding: '4px 10px' }} onClick={() => { void onDelete(i.id) }}>Excluir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar doação' : 'Nova doação'} maxWidth={560}>
        <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'grid', gap: 12 }}>
          <Select label="Dizimista (opcional)" {...form.register('dizimistaId')} placeholder="Doação avulsa" options={dizimistas.map(d => ({ value: d.id, label: d.nome }))} />
          <Input label="Valor" type="number" step="0.01" {...form.register('valor')} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Mês da competência" type="number" min={1} max={12} {...form.register('competenciaMes')} />
            <Input label="Ano da competência" type="number" {...form.register('competenciaAno')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Tipo" {...form.register('tipoDoacao')} options={[{ value: 'dizimo', label: 'Dízimo' }, { value: 'oferta', label: 'Oferta' }, { value: 'doacao', label: 'Doação' }]} />
            <Select label="Forma de pagamento" {...form.register('formaPagamento')} options={[{ value: 'dinheiro', label: 'Dinheiro' }, { value: 'pix', label: 'Pix' }, { value: 'transferencia', label: 'Transferência' }]} />
          </div>
          <Input label="Observações" {...form.register('observacoes')} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={form.formState.isSubmitting}>Salvar</Button>
          </div>
        </form>
      </Modal>

      <div style={{ marginTop: 14, color: 'var(--text-muted)', fontSize: 13 }}>
        Filtros avançados (mês/trimestre/semestre/ano) e exportação Excel/PDF: <strong>TODO</strong>
      </div>
    </CebLayout>
  )
}
