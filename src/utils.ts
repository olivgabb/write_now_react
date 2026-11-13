import type { DadosPerfil, DadosRegistro } from './types'

export function novoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function hostDe(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function dataCurta(iso: string): string {
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return ''
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function primeiroNome(nome: string): string {
  const primeiro = nome.trim().split(/\s+/)[0] ?? ''
  return primeiro ? primeiro.charAt(0).toUpperCase() + primeiro.slice(1).toLowerCase() : ''
}

export function saudacao(agora: Date = new Date()): string {
  const hora = agora.getHours()
  if (hora < 5) return 'Boa noite'
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function tempoRelativo(iso: string, agora: Date = new Date()): string {
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return ''
  const segundos = Math.max(0, Math.round((agora.getTime() - data.getTime()) / 1000))
  const minutos = Math.floor(segundos / 60)
  const horas = Math.floor(minutos / 60)

  if (segundos < 60) return 'agora há pouco'
  if (minutos < 60) return `há ${minutos} min`
  if (horas < 24) return horas === 1 ? 'há 1 hora' : `há ${horas} horas`

  const inicioDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const dias = Math.round((inicioDia(agora) - inicioDia(data)) / 86_400_000)
  if (dias === 1) return `ontem às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  if (dias < 7) return `há ${dias} dias`
  return `em ${dataCurta(iso)}`
}

export function formatoDe(url: string): 'PDF' | 'Página web' {
  try {
    return new URL(url).pathname.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Página web'
  } catch {
    return 'Página web'
  }
}

export type ResultadoUrl = { ok: true; url: string } | { ok: false; erro: string }

export function validarUrlEdital(valor: string): ResultadoUrl {
  const texto = valor.trim()
  if (!texto) {
    return { ok: false, erro: 'Cole o link do edital para continuar.' }
  }
  let url: URL
  try {
    url = new URL(texto)
  } catch {
    return { ok: false, erro: 'Isso não parece um link. Cole o endereço completo, começando com https://' }
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, erro: 'O link precisa começar com http:// ou https://' }
  }
  return { ok: true, url: url.toString() }
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  const primeira = partes[0].charAt(0)
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : ''
  return (primeira + ultima).toUpperCase()
}

export const BIOGRAFIA_MAX = 500
export const SENHA_MIN = 8

export type ErrosDeCampo<T> = Partial<Record<keyof T, string>>

function erroNome(nome: string): string | undefined {
  const texto = nome.trim()
  if (!texto) return 'Informe seu nome completo.'
  if (texto.split(/\s+/).length < 2) return 'Informe nome e sobrenome.'
  return undefined
}

function erroEmail(email: string): string | undefined {
  const texto = email.trim()
  if (!texto) return 'Informe seu e-mail.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)) return 'Esse e-mail não parece válido. Exemplo: nome@dominio.com'
  return undefined
}

function erroSenha(senha: string): string | undefined {
  if (!senha) return 'Crie uma senha.'
  if (senha.length < SENHA_MIN) return `A senha precisa ter pelo menos ${SENHA_MIN} caracteres.`
  return undefined
}

function erroFormacao(formacao: string): string | undefined {
  return formacao.trim() ? undefined : 'Informe sua formação acadêmica.'
}

function erroBiografia(biografia: string): string | undefined {
  return biografia.length > BIOGRAFIA_MAX ? `A biografia pode ter até ${BIOGRAFIA_MAX} caracteres.` : undefined
}

function semVazios<T extends object>(erros: ErrosDeCampo<T>): ErrosDeCampo<T> {
  return Object.fromEntries(Object.entries(erros).filter(([, valor]) => valor)) as ErrosDeCampo<T>
}

export function validarRegistro(dados: DadosRegistro): ErrosDeCampo<DadosRegistro> {
  return semVazios<DadosRegistro>({
    nome: erroNome(dados.nome),
    email: erroEmail(dados.email),
    senha: erroSenha(dados.senha),
    formacao: erroFormacao(dados.formacao),
    biografia: erroBiografia(dados.biografia),
  })
}

export function validarPerfil(dados: DadosPerfil): ErrosDeCampo<DadosPerfil> {
  return semVazios<DadosPerfil>({
    nome: erroNome(dados.nome),
    formacao: erroFormacao(dados.formacao),
    biografia: erroBiografia(dados.biografia),
  })
}

export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof Error && erro.message) return erro.message
  return 'Algo deu errado. Tente novamente.'
}
