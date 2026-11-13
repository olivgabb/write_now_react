import { API_URL, USE_MOCK } from '../config'
import type { DadosPerfil, DadosRegistro, Edital, Mensagem, RespostaLogin, Usuario } from '../types'
import { mock } from './mock'
import { EVENTO_NAO_AUTORIZADO, getToken } from './session'

export class ApiError extends Error {
  status: number
  constructor(status: number, mensagem: string) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
  }
}

// Rotas em que um 401 significa credencial errada, e não sessão expirada.
const ROTAS_PUBLICAS = ['/auth/login', '/auth/registro']

async function requisitar<T>(caminho: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  let resposta: Response
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.')
  }

  if (resposta.status === 401 && !ROTAS_PUBLICAS.includes(caminho)) {
    window.dispatchEvent(new Event(EVENTO_NAO_AUTORIZADO))
  }

  if (!resposta.ok) {
    let detalhe = ''
    try {
      const corpo = (await resposta.json()) as { message?: string; detail?: string }
      detalhe = corpo.message ?? corpo.detail ?? ''
    } catch {
      // corpo sem JSON
    }
    const padrao =
      resposta.status === 401
        ? 'E-mail ou senha incorretos.'
        : resposta.status === 409
          ? 'Este e-mail já está cadastrado. Tente entrar.'
          : `O servidor respondeu com erro ${resposta.status}.`
    throw new ApiError(resposta.status, detalhe || padrao)
  }

  return (await resposta.json()) as T
}

// Contrato esperado do backend (veja o README):
//   POST /auth/login                  { email, senha }  -> { token, usuario }
//   POST /auth/registro               DadosRegistro     -> { token, usuario }
//   PUT  /perfil                      DadosPerfil       -> Usuario
//   GET  /editais                                       -> Edital[]
//   POST /editais                     { url }           -> Edital
//   GET  /editais/:id                                   -> Edital
//   GET  /editais/:id/mensagens                         -> Mensagem[]
//   POST /editais/:id/propostas                         -> Mensagem  (agente lê o edital e propõe)
//   POST /editais/:id/mensagens       { texto }         -> Mensagem  (resposta do agente)
export const api = {
  login: (email: string, senha: string): Promise<RespostaLogin> =>
    USE_MOCK
      ? mock.login(email, senha)
      : requisitar('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),

  registrar: (dados: DadosRegistro): Promise<RespostaLogin> =>
    USE_MOCK
      ? mock.registrar(dados)
      : requisitar('/auth/registro', { method: 'POST', body: JSON.stringify(dados) }),

  atualizarPerfil: (dados: DadosPerfil): Promise<Usuario> =>
    USE_MOCK ? mock.atualizarPerfil(dados) : requisitar('/perfil', { method: 'PUT', body: JSON.stringify(dados) }),

  listarEditais: (): Promise<Edital[]> => (USE_MOCK ? mock.listarEditais() : requisitar('/editais')),

  criarEdital: (url: string): Promise<Edital> =>
    USE_MOCK ? mock.criarEdital(url) : requisitar('/editais', { method: 'POST', body: JSON.stringify({ url }) }),

  obterEdital: (id: string): Promise<Edital> =>
    USE_MOCK ? mock.obterEdital(id) : requisitar(`/editais/${encodeURIComponent(id)}`),

  listarMensagens: (id: string): Promise<Mensagem[]> =>
    USE_MOCK ? mock.listarMensagens(id) : requisitar(`/editais/${encodeURIComponent(id)}/mensagens`),

  gerarPropostas: (id: string): Promise<Mensagem> =>
    USE_MOCK
      ? mock.gerarPropostas(id)
      : requisitar(`/editais/${encodeURIComponent(id)}/propostas`, { method: 'POST' }),

  enviarMensagem: (id: string, texto: string): Promise<Mensagem> =>
    USE_MOCK
      ? mock.enviarMensagem(id, texto)
      : requisitar(`/editais/${encodeURIComponent(id)}/mensagens`, {
          method: 'POST',
          body: JSON.stringify({ texto }),
        }),
}
