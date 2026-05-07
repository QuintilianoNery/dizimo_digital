import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../../services/api'
import AdminLayout from '../../components/layout/AdminLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import Select from '../../components/ui/Select'

const schema = z.object({
  codigoParoquia: z.string().min(1, 'Obrigatório'),
  nome: z.string().min(2, 'Obrigatório'),
  emailLoginSecretaria: z.string().email('E-mail inválido'),
  senha: z.string().min(8, 'Mínimo 8 caracteres').optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  paroco: z.string().optional(),
  cnpj: z.string().optional(),
  fundacao: z.string().optional(),
  status: z.enum(['ativo', 'inativo']).default('ativo'),
})

type FormData = z.infer<typeof schema>

export default function ParoquiaForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'ativo' },
  })

  useEffect(() => {
    if (id) {
      api.admin.paroquias.get(id).then(data => reset(data as FormData))
    }
  }, [id, reset])

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const payload = { ...data, senha: data.senha || undefined }
      if (isEdit) {
        await api.admin.paroquias.update(id!, payload)
        setSuccess('Paróquia atualizada com sucesso!')
      } else {
        await api.admin.paroquias.create(payload)
        navigate('/admin/paroquias')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    }
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: 600 }}>
        <Button variant="ghost" onClick={() => navigate('/admin/paroquias')} style={{ marginBottom: 16, padding: 0 }}>
          ← Voltar
        </Button>
        <h1 style={{ margin: '0 0 24px', fontSize: 22 }}>{isEdit ? 'Editar Paróquia' : 'Nova Paróquia'}</h1>
        {error && <div style={{ marginBottom: 16 }}><Alert type="error" message={error} onClose={() => setError('')} /></div>}
        {success && <div style={{ marginBottom: 16 }}><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow)' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input label="Código da Paróquia *" {...register('codigoParoquia')} error={errors.codigoParoquia?.message} />
              <Input label="Nome *" {...register('nome')} error={errors.nome?.message} />
            </div>
            <Input label="E-mail de Login (Secretaria) *" type="email" {...register('emailLoginSecretaria')} error={errors.emailLoginSecretaria?.message} />
            {!isEdit && <Input label="Senha *" type="password" {...register('senha')} error={errors.senha?.message} />}
            <Input label="E-mail de contato" type="email" {...register('email')} error={errors.email?.message} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input label="Telefone" {...register('telefone')} />
              <Input label="CNPJ" {...register('cnpj')} />
            </div>
            <Input label="Pároco" {...register('paroco')} />
            <Input label="Endereço" {...register('endereco')} />
            <Input label="Data de fundação" type="date" {...register('fundacao')} />
            {isEdit && (
              <Select
                label="Status"
                {...register('status')}
                options={[{ value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }]}
              />
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="secondary" type="button" onClick={() => navigate('/admin/paroquias')}>Cancelar</Button>
              <Button type="submit" loading={isSubmitting}>{isEdit ? 'Salvar alterações' : 'Criar paróquia'}</Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
