import type { Usuario } from '../types'

const CHAVE_TOKEN = 'minuta.token'
const CHAVE_USUARIO = 'minuta.usuario'

export const EVENTO_NAO_AUTORIZADO = 'minuta:nao-autorizado'

export function getToken(): string | null {
  try {
    return localStorage.getItem(CHAVE_TOKEN)
  } catch {
    return null
  }
}

export function getUsuarioSalvo(): Usuario | null {
  try {
    const bruto = localStorage.getItem(CHAVE_USUARIO)
    return bruto ? (JSON.parse(bruto) as Usuario) : null
  } catch {
    return null
  }
}

export function salvarSessao(token: string, usuario: Usuario): void {
  try {
    localStorage.setItem(CHAVE_TOKEN, token)
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario))
  } catch {
    // Sem armazenamento disponível: a sessão vale só até recarregar a página.
  }
}

export function limparSessao(): void {
  try {
    localStorage.removeItem(CHAVE_TOKEN)
    localStorage.removeItem(CHAVE_USUARIO)
  } catch {
    // ignorado
  }
}
