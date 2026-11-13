import type { DadosPerfil, DadosRegistro, Edital, Mensagem, Proposta, RespostaLogin, Usuario } from '../types'
import { hostDe, novoId } from '../utils'
import { getUsuarioSalvo } from './session'

// Backend de demonstração: guarda tudo no localStorage e devolve propostas de exemplo.
// Serve para desenvolver o front-end sem o agente. Ative com VITE_USE_MOCK=true.

const CHAVE_EDITAIS = 'minuta.mock.editais'
const CHAVE_MENSAGENS = 'minuta.mock.mensagens'
const CHAVE_USUARIOS = 'minuta.mock.usuarios'

const dormir = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function ler<T>(chave: string, padrao: T): T {
  try {
    const bruto = localStorage.getItem(chave)
    return bruto ? (JSON.parse(bruto) as T) : padrao
  } catch {
    return padrao
  }
}

function gravar(chave: string, valor: unknown): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    // ignorado
  }
}

// Contas criadas no registro, indexadas pelo e-mail. A senha não é guardada: o modo demonstração
// aceita qualquer senha no login, e só o perfil precisa sobreviver entre sessões.
function lerUsuarios(): Record<string, Usuario> {
  return ler<Record<string, Usuario>>(CHAVE_USUARIOS, {})
}

const chaveDoEmail = (email: string) => email.trim().toLowerCase()

function tituloDaUrl(url: string): string {
  try {
    const u = new URL(url)
    const ultimo = decodeURIComponent(u.pathname.split('/').filter(Boolean).pop() ?? '')
    const limpo = ultimo.replace(/\.(pdf|html?|php|aspx?)$/i, '').replace(/[-_]+/g, ' ').trim()
    return limpo ? limpo.charAt(0).toUpperCase() + limpo.slice(1) : `Edital de ${hostDe(url)}`
  } catch {
    return 'Edital sem título'
  }
}

function propostasDeExemplo(): Proposta[] {
  return [
    {
      id: novoId(),
      titulo: 'Implantação em fases com equipe dedicada',
      resumo:
        'Entrega o escopo em três marcos, começando pelo que o edital marca como crítico. Reduz o risco de rejeição técnica e permite ajustes a cada etapa.',
      etapas: [
        'Levantar requisitos obrigatórios e documentos de habilitação',
        'Entregar a primeira fase com os itens críticos',
        'Validar com o órgão e liberar as fases seguintes',
      ],
      prazo: '120 dias',
      investimento: 'R$ 480 mil (estimativa)',
      riscos: ['Exigência de atestados técnicos que a empresa ainda não tem', 'Mudança de escopo durante a fase 2'],
    },
    {
      id: novoId(),
      titulo: 'Consórcio com parceiro técnico especializado',
      resumo:
        'Divide a execução com um parceiro que já cumpre os requisitos de experiência exigidos, o que fortalece a habilitação sem contratar equipe nova.',
      etapas: [
        'Mapear parceiros com atestados compatíveis',
        'Formalizar o termo de compromisso do consórcio',
        'Dividir responsabilidades conforme o edital permite',
      ],
      prazo: '90 dias',
      investimento: 'R$ 350 mil (estimativa)',
      riscos: ['Limite de empresas por consórcio definido no edital', 'Responsabilidade solidária entre as partes'],
    },
    {
      id: novoId(),
      titulo: 'Solução enxuta focada no menor preço',
      resumo:
        'Atende apenas ao mínimo exigido, com custo menor e prazo curto. Funciona se o critério de julgamento for menor preço e não houver pontuação técnica.',
      etapas: [
        'Confirmar o critério de julgamento no edital',
        'Montar a proposta com o escopo mínimo',
        'Preparar a defesa de preço para a sessão pública',
      ],
      prazo: '60 dias',
      investimento: 'R$ 220 mil (estimativa)',
      riscos: ['Desclassificação se o escopo mínimo for lido de forma diferente pelo órgão'],
    },
  ]
}

// Documento fictício exibido no painel do edital para os exemplos do modo demonstração.
function documentoDeExemplo(titulo: string): string {
  const escapar = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
body{font:16px/1.6 Georgia,serif;color:#1b2430;margin:0;padding:2rem 2.25rem;background:#fff}
.aviso{font:600 12px/1.4 system-ui,sans-serif;color:#8a5a12;background:#f8efdc;padding:.5rem .7rem;border-radius:4px;margin-bottom:1.5rem}
h1{font-size:1.5rem;line-height:1.2;margin:0 0 .25rem}h2{font-size:1.05rem;margin:1.6rem 0 .4rem}
.sub{color:#566274;margin:0 0 1rem}p,li{max-width:62ch}
</style></head><body>
<p class="aviso">Documento de exemplo do modo demonstração. Com o backend conectado, aqui aparece o edital real.</p>
<h1>${escapar(titulo)}</h1><p class="sub">Edital nº 01/2026 – Secretaria de Governo</p>
<h2>1. Objeto</h2><p>O presente edital tem por objeto a seleção de propostas para a modernização dos serviços digitais do órgão, com entrega em fases e prestação de contas a cada marco.</p>
<h2>2. Requisitos de habilitação</h2><ul><li>Regularidade fiscal, trabalhista e previdenciária.</li><li>Atestado de capacidade técnica em projeto de porte semelhante.</li><li>Equipe mínima com responsável técnico indicado.</li></ul>
<h2>3. Prazos</h2><p>Envio das propostas até 30 dias após a publicação. Execução em até 120 dias após a assinatura do contrato.</p>
<h2>4. Critério de julgamento</h2><p>Técnica e preço, com peso de 60% para a nota técnica e 40% para o preço.</p>
</body></html>`
}

// Lê os editais salvos. Registros de versões antigas (sem status) são normalizados.
function lerEditais(): Edital[] {
  return ler<Partial<Edital>[]>(CHAVE_EDITAIS, []).map((e) => ({
    ...(e as Edital),
    status: e.status ?? 'propostas',
    atualizadoEm: e.atualizadoEm ?? e.criadoEm ?? new Date().toISOString(),
  }))
}

function atualizarEdital(id: string, mudancas: Partial<Edital>): void {
  const editais = lerEditais().map((e) =>
    e.id === id ? { ...e, ...mudancas, atualizadoEm: new Date().toISOString() } : e,
  )
  gravar(CHAVE_EDITAIS, editais)
}

// Na primeira visita, cria três editais de exemplo para mostrar o histórico e os estados.
function semearSeNecessario(): void {
  try {
    if (localStorage.getItem(CHAVE_EDITAIS) !== null) return
  } catch {
    return
  }
  const agora = Date.now()
  const antes = (ms: number) => new Date(agora - ms).toISOString()
  const HORA = 3_600_000
  const DIA = 24 * HORA

  const editais: Edital[] = [
    {
      id: 'exemplo-seidigi',
      url: 'https://exemplo.gov.br/editais/chamamento-publico-01-2026-inovacao-digital.pdf',
      titulo: 'Chamamento público 01/2026 – Inovação digital',
      status: 'propostas',
      totalPropostas: 3,
      criadoEm: antes(3 * HORA),
      atualizadoEm: antes(2 * HORA),
    },
    {
      id: 'exemplo-pnab',
      url: 'https://exemplo.gov.br/editais/fomento-audiovisual-fotografia-pnab-2026',
      titulo: 'Fomento audiovisual e fotografia – PNAB 2026',
      status: 'ajustando',
      totalPropostas: 3,
      criadoEm: antes(2 * DIA),
      atualizadoEm: antes(1 * DIA),
    },
    {
      id: 'exemplo-finep',
      url: 'https://exemplo.gov.br/editais/subvencao-tecnologica-pd.pdf',
      titulo: 'Subvenção tecnológica P&D',
      status: 'erro',
      criadoEm: antes(4 * DIA),
      atualizadoEm: antes(3 * DIA),
    },
  ]

  const base = (autor: Mensagem['autor'], texto: string, quando: string, propostas?: Proposta[]): Mensagem => ({
    id: novoId(),
    autor,
    texto,
    propostas,
    criadoEm: quando,
  })

  const mensagens: Record<string, Mensagem[]> = {
    'exemplo-seidigi': [
      base(
        'agente',
        'Modo demonstração: estas propostas são exemplos fixos, sem leitura real do edital.',
        antes(2 * HORA),
        propostasDeExemplo(),
      ),
    ],
    'exemplo-pnab': [
      base(
        'agente',
        'Modo demonstração: estas propostas são exemplos fixos, sem leitura real do edital.',
        antes(2 * DIA),
        propostasDeExemplo(),
      ),
      base('usuario', 'Reduza o custo', antes(1 * DIA)),
      base(
        'agente',
        'Entendi: "Reduza o custo". No modo demonstração eu não reescrevo as propostas.',
        antes(1 * DIA),
      ),
    ],
  }

  gravar(CHAVE_EDITAIS, editais)
  gravar(CHAVE_MENSAGENS, mensagens)
}

export const mock = {
  async login(email: string, senha: string): Promise<RespostaLogin> {
    await dormir(500)
    if (!email.trim() || !senha) {
      throw new Error('Informe e-mail e senha.')
    }
    const cadastrado = lerUsuarios()[chaveDoEmail(email)]
    const nome = email.split('@')[0].replace(/[._-]+/g, ' ')
    return {
      token: `demo-${novoId()}`,
      usuario: cadastrado ?? { id: 'demo', nome, email: email.trim() },
    }
  },

  async registrar(dados: DadosRegistro): Promise<RespostaLogin> {
    await dormir(600)
    const usuarios = lerUsuarios()
    const chave = chaveDoEmail(dados.email)
    if (usuarios[chave]) {
      throw new Error('Este e-mail já está cadastrado. Tente entrar.')
    }
    const usuario: Usuario = {
      id: novoId(),
      nome: dados.nome.trim(),
      email: dados.email.trim(),
      formacao: dados.formacao.trim(),
      biografia: dados.biografia.trim(),
    }
    gravar(CHAVE_USUARIOS, { ...usuarios, [chave]: usuario })
    return { token: `demo-${novoId()}`, usuario }
  },

  async atualizarPerfil(dados: DadosPerfil): Promise<Usuario> {
    await dormir(400)
    const atual = getUsuarioSalvo()
    if (!atual) throw new Error('Sua sessão expirou. Entre novamente.')
    const usuario: Usuario = {
      ...atual,
      nome: dados.nome.trim(),
      formacao: dados.formacao.trim(),
      biografia: dados.biografia.trim(),
    }
    gravar(CHAVE_USUARIOS, { ...lerUsuarios(), [chaveDoEmail(usuario.email)]: usuario })
    return usuario
  },

  async listarEditais(): Promise<Edital[]> {
    await dormir(150)
    semearSeNecessario()
    return lerEditais().sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
  },

  async criarEdital(url: string): Promise<Edital> {
    await dormir(400)
    const agora = new Date().toISOString()
    const edital: Edital = {
      id: novoId(),
      url,
      titulo: tituloDaUrl(url),
      status: 'analisando',
      criadoEm: agora,
      atualizadoEm: agora,
    }
    gravar(CHAVE_EDITAIS, [...lerEditais(), edital])
    return edital
  },

  async obterEdital(id: string): Promise<Edital> {
    await dormir(150)
    const edital = lerEditais().find((e) => e.id === id)
    if (!edital) throw new Error('Não encontramos esse edital. Envie o link novamente.')
    if (edital.id.startsWith('exemplo-')) {
      // Os exemplos usam endereços fictícios, então o painel mostra um documento de demonstração.
      return {
        ...edital,
        previewUrl: `data:text/html;charset=utf-8,${encodeURIComponent(documentoDeExemplo(edital.titulo))}`,
      }
    }
    return edital
  },

  async listarMensagens(id: string): Promise<Mensagem[]> {
    await dormir(150)
    return ler<Record<string, Mensagem[]>>(CHAVE_MENSAGENS, {})[id] ?? []
  },

  async gerarPropostas(id: string): Promise<Mensagem> {
    await dormir(2800)
    const todas = ler<Record<string, Mensagem[]>>(CHAVE_MENSAGENS, {})
    if (todas[id]?.length) return todas[id][0]
    const mensagem: Mensagem = {
      id: novoId(),
      autor: 'agente',
      texto:
        'Modo demonstração: estas propostas são exemplos fixos, sem leitura real do edital. Com o backend conectado, elas virão da análise do documento.',
      propostas: propostasDeExemplo(),
      criadoEm: new Date().toISOString(),
    }
    todas[id] = [mensagem]
    gravar(CHAVE_MENSAGENS, todas)
    atualizarEdital(id, { status: 'propostas', totalPropostas: mensagem.propostas?.length })
    return mensagem
  },

    async analisarUrl(_pdfUrl: string, signal?: AbortSignal): Promise<Proposta[]> {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, 2500)
      signal?.addEventListener(
        'abort',
        () => {
          clearTimeout(timer)
          reject(new DOMException('Análise cancelada', 'AbortError'))
        },
        { once: true },
      )
    })
    return propostasDeExemplo()
  },

  async enviarMensagem(id: string, texto: string): Promise<Mensagem> {
    await dormir(1400)
    const todas = ler<Record<string, Mensagem[]>>(CHAVE_MENSAGENS, {})
    const historico = todas[id] ?? []
    const usuario: Mensagem = { id: novoId(), autor: 'usuario', texto, criadoEm: new Date().toISOString() }
    const resposta: Mensagem = {
      id: novoId(),
      autor: 'agente',
      texto: `Entendi: "${texto}". No modo demonstração eu não reescrevo as propostas, mas com o backend conectado eu ajustaria as três opções a esse pedido.`,
      criadoEm: new Date().toISOString(),
    }
    todas[id] = [...historico, usuario, resposta]
    gravar(CHAVE_MENSAGENS, todas)
    atualizarEdital(id, { status: 'ajustando' })
    return resposta
  },
}