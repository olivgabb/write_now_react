import { API_URL, USE_MOCK } from '../config'
import type { DadosPerfil, DadosRegistro, Edital, Mensagem, Proposta, RespostaLogin, Usuario } from '../types'
import { novoId } from '../utils'
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
  } catch (erro) {
    // Cancelamento pelo usuário não é erro de conexão: repassa para quem chamou tratar.
    if (erro instanceof DOMException && erro.name === 'AbortError') throw erro
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

  // Respostas sem corpo (ex.: 204 do DELETE) não têm JSON para ler.
  if (resposta.status === 204) return undefined as T

  return (await resposta.json()) as T
}

// Valida o formato devolvido pelo agente e completa campos opcionais.
// Aceita a lista de propostas direto ou dentro de { propostas: [...] }.
function normalizarPropostas(bruto: unknown): Proposta[] {
  const lista = Array.isArray(bruto) ? bruto : (bruto as { propostas?: unknown } | null)?.propostas
  if (!Array.isArray(lista) || lista.length === 0) {
    throw new ApiError(502, 'O agente não retornou propostas para este edital.')
  }
  return lista.map((item, i) => {
    const p = item as Partial<Proposta>
    if (!p.titulo || !Array.isArray(p.etapas) || !Array.isArray(p.riscos)) {
      throw new ApiError(502, 'A resposta do servidor veio em formato inesperado.')
    }
    return {
      id: p.id ?? `${novoId()}-${i}`,
      titulo: p.titulo,
      resumo: p.resumo ?? '',
      etapas: p.etapas,
      prazo: p.prazo ?? '',
      investimento: p.investimento ?? '',
      riscos: p.riscos,
    }
  })
}

// Contrato esperado do backend (veja o README):
//   POST /auth/login                  { email, senha }  -> { token, usuario }
//   POST /auth/registro               DadosRegistro     -> { token, usuario }
//   PUT  /perfil                      DadosPerfil       -> Usuario
//   GET  /editais                                       -> Edital[]
//   POST /editais                     { url }           -> Edital
//   POST /get-url                     { "pdf-url": url } -> Proposta[]  (agente lê o edital e propõe)
//   GET  /editais/:id                                   -> Edital
//   DELETE /editais/:id                                 -> 204 (remove o edital e as mensagens dele)
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

  // Envia o link do edital ao agente e devolve as propostas geradas.
  analisarUrl: (pdfUrl: string, signal?: AbortSignal): Promise<Proposta[]> =>
    USE_MOCK
      ? mock.analisarUrl(pdfUrl, signal)
      : requisitar<unknown>('/get-url', {
          method: 'POST',
          body: JSON.stringify({ 'pdf-url': pdfUrl }),
          signal,
        }).then(normalizarPropostas),

  criarEdital: (url: string): Promise<Edital> =>
    USE_MOCK ? mock.criarEdital(url) : requisitar('/editais', { method: 'POST', body: JSON.stringify({ url }) }),

  // Remove o edital do histórico do usuário.
  // PONTO DE INTEGRAÇÃO: DELETE /editais/:id. O backend pode responder 204 sem corpo.
  excluirEdital: (id: string): Promise<void> =>
    USE_MOCK
      ? mock.excluirEdital(id)
      : requisitar<void>(`/editais/${encodeURIComponent(id)}`, { method: 'DELETE' }),

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