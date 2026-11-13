export interface Usuario {
  id: string
  nome: string
  email: string
}

/**
 * Estado do edital no fluxo:
 *  - analisando: o agente ainda está lendo o documento
 *  - propostas:  propostas geradas, aguardando o usuário
 *  - ajustando:  o usuário já pediu ajustes nas propostas
 *  - erro:       não foi possível ler o documento
 */
export type StatusEdital = 'analisando' | 'propostas' | 'ajustando' | 'erro'

export interface Edital {
  id: string
  url: string
  /**
   * Endereço de uma cópia do edital que o navegador consegue exibir no painel lateral
   * (por exemplo, o PDF servido pelo seu backend). Opcional: sem ele, o painel tenta `url`.
   */
  previewUrl?: string
  titulo: string
  status: StatusEdital
  totalPropostas?: number
  criadoEm: string // ISO 8601
  atualizadoEm: string // ISO 8601
}

export interface Proposta {
  id: string
  titulo: string
  resumo: string
  etapas: string[]
  prazo: string
  investimento: string
  riscos: string[]
}

export interface Mensagem {
  id: string
  autor: 'usuario' | 'agente'
  texto: string
  propostas?: Proposta[]
  criadoEm: string // ISO 8601
}

export interface RespostaLogin {
  token: string
  usuario: Usuario
}