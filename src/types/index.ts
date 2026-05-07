export interface Paroquia {
  id: string
  codigoParoquia: string
  nome: string
  emailLoginSecretaria?: string
  email?: string | null
  telefone?: string | null
  endereco?: string | null
  fundacao?: string | null
  cnpj?: string | null
  paroco?: string | null
  logoUrl?: string | null
  status: 'ativo' | 'inativo'
  createdAt: string
}

export interface ConfiguracaoParoquia {
  id: string
  paroquiaId: string
  percentualRepasseDizimoCebs: number
  percentualRepasseOfertaCebs: number
  percentualRepaseCuriaDiocesana: number
  percentualRepasseDiocese: number
  vigenteDesde: string
  vigenteAte?: string | null
  ativa: boolean
  alteradoPorId?: string | null
  createdAt: string
}

export interface Ceb {
  id: string
  paroquiaId: string
  codigoCeb: string
  nome: string
  emailLogin: string
  telefone?: string | null
  status: 'ativo' | 'inativo'
  createdAt: string
}

export interface PastoralMovimento {
  id: string
  nome: string
  tipo: 'pastoral' | 'movimento'
  status: 'ativo' | 'inativo'
}

export interface ConselheiroComunitario {
  id: string
  cebId: string
  pastoralMovimentoId?: string | null
  nome: string
  telefone?: string | null
  email?: string | null
  cargo?: string | null
  status: 'ativo' | 'inativo'
}

export interface Dizimista {
  id: string
  cebId: string
  nome: string
  telefone?: string | null
  email?: string | null
  endereco?: string | null
  dataNascimento?: string | null
  status: 'ativo' | 'inativo'
  createdAt: string
}

export interface Doacao {
  id: string
  cebId: string
  dizimistaId?: string | null
  dizimista?: { nome: string }
  valor: number
  competenciaMes: number
  competenciaAno: number
  tipoDoacao: 'dizimo' | 'oferta' | 'doacao'
  formaPagamento: 'dinheiro' | 'pix' | 'transferencia'
  observacoes?: string | null
  dataLancamento: string
  createdAt: string
}

export interface AlertaAlteracaoPercentual {
  id: string
  paroquiaId: string
  cebId: string
  configuracaoParoquiaId: string
  percentualAnterior: number
  percentualNovo: number
  mensagem: string
  lidoEm?: string | null
  createdAt: string
}

export type UserRole = 'admin' | 'paroquial' | 'ceb'

export interface SessionUser {
  id: string
  role: UserRole
  paroquiaId?: string
  cebId?: string
  nome?: string
  email?: string
}
