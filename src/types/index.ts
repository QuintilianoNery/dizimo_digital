export interface Administrador {
  id: string
  nome: string
  email: string
  createdAt: string
}

export interface Paroquia {
  id: string
  codigoParoquia: string
  nome: string
  emailLoginSecretaria: string
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
  nome: string
  cargo: string
  email?: string | null
  telefone?: string | null
  emailLogin?: string | null
  status: 'ativo' | 'inativo'
}

export interface Dizimista {
  id: string
  cebId: string
  nome: string
  cpf?: string | null
  dataNascimento?: string | null
  telefone?: string | null
  email?: string | null
  endereco?: string | null
  pastoralMovimentoId?: string | null
  pastoralMovimento?: { nome: string } | null
  status: 'ativo' | 'inativo'
  createdAt: string
}

export interface Doacao {
  id: string
  cebId: string
  dizimistaId: string
  dizimista?: { nome: string }
  tipo: 'dizimo' | 'oferta' | 'campanha'
  valor: number
  data: string
  observacao?: string | null
  createdAt: string
}

export interface AlertaAlteracaoPercentual {
  id: string
  paroquiaId: string
  cebId: string
  configuracaoParoquiaId: string
  configuracaoParoquia?: ConfiguracaoParoquia
  percentualAnterior: number
  percentualNovo: number
  mensagem: string
  lido: boolean
  criadoEm: string
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
