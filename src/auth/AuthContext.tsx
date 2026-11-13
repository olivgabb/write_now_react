import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../services/api'
import { EVENTO_NAO_AUTORIZADO, getToken, getUsuarioSalvo, limparSessao, salvarSessao } from '../services/session'
import type { DadosPerfil, DadosRegistro, Usuario } from '../types'

interface AuthState {
  usuario: Usuario | null
  entrar: (email: string, senha: string) => Promise<void>
  registrar: (dados: DadosRegistro) => Promise<void>
  atualizarPerfil: (dados: DadosPerfil) => Promise<void>
  sair: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => getUsuarioSalvo())

  const entrar = useCallback(async (email: string, senha: string) => {
    const { token, usuario: logado } = await api.login(email, senha)
    salvarSessao(token, logado)
    setUsuario(logado)
  }, [])

  const registrar = useCallback(async (dados: DadosRegistro) => {
    const { token, usuario: criado } = await api.registrar(dados)
    salvarSessao(token, criado)
    setUsuario(criado)
  }, [])

  const atualizarPerfil = useCallback(async (dados: DadosPerfil) => {
    const atualizado = await api.atualizarPerfil(dados)
    salvarSessao(getToken() ?? '', atualizado)
    setUsuario(atualizado)
  }, [])

  const sair = useCallback(() => {
    limparSessao()
    setUsuario(null)
  }, [])

  // Se o backend responder 401 em qualquer chamada, a sessão expirou.
  useEffect(() => {
    window.addEventListener(EVENTO_NAO_AUTORIZADO, sair)
    return () => window.removeEventListener(EVENTO_NAO_AUTORIZADO, sair)
  }, [sair])

  const valor = useMemo(
    () => ({ usuario, entrar, registrar, atualizarPerfil, sair }),
    [usuario, entrar, registrar, atualizarPerfil, sair],
  )
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return contexto
}
