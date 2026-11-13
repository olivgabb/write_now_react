import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import EditalViewer from '../components/EditalViewer'
import PropostaCard from '../components/PropostaCard'
import StatusTag from '../components/StatusTag'
import { api } from '../services/api'
import type { Edital, Mensagem } from '../types'
import { dataCurta, hostDe, mensagemDeErro, novoId } from '../utils'
import type { Proposta } from '../types'
import { useLocation } from 'react-router-dom'


type Estado = 'carregando' | 'lendo' | 'pronto' | 'erro'

const TEXTO_ABERTURA = 'Analisei o edital. Estas são as propostas sugeridas:'

const SUGESTOES = ['Reduza o custo', 'Detalhe os riscos', 'Priorize o menor prazo']

// A partir desta largura o painel do edital fica ao lado do chat; abaixo, ele cobre a tela.
const LARGURA_PAINEL_LADO = '(min-width: 1200px)'

interface EstadoDeNavegacao {
  propostas?: Proposta[]
}


export default function ChatPage() {
  const { id = '' } = useParams()
  const [edital, setEdital] = useState<Edital | null>(null)
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [estado, setEstado] = useState<Estado>('carregando')
  const [erroCarga, setErroCarga] = useState<string | null>(null)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)
  const [aguardando, setAguardando] = useState(false)
  const [texto, setTexto] = useState('')
  const [painelAberto, setPainelAberto] = useState(() => window.matchMedia(LARGURA_PAINEL_LADO).matches)

  const fimRef = useRef<HTMLDivElement>(null)
  const campoRef = useRef<HTMLTextAreaElement>(null)
  const carregandoId = useRef<string | null>(null)
  const localizacao = useLocation()
  const propostasIniciais = (localizacao.state as EstadoDeNavegacao | null)?.propostas



  const carregar = useCallback(async () => {
    setEstado('carregando')
    setErroCarga(null)
    try {
      const [dados, historico] = await Promise.all([api.obterEdital(id), api.listarMensagens(id)])

      if (historico.length === 0 && propostasIniciais?.length) {
        setEdital({ ...dados, status: 'propostas', totalPropostas: propostasIniciais.length })
        setMensagens([
          {
            id: novoId(),
            autor: 'agente',
            texto: TEXTO_ABERTURA,
            propostas: propostasIniciais,
            criadoEm: new Date().toISOString(),
          },
        ])
        setEstado('pronto')
        return
      }
      setEdital(historico.length === 0 ? { ...dados, status: 'analisando' } : dados)
      setMensagens(historico)
      if (historico.length === 0) {
        setEstado('lendo')
        const primeira = await api.gerarPropostas(id)
        setMensagens([primeira])
        setEdital((atual) =>
          atual
            ? { ...atual, status: 'propostas', totalPropostas: primeira.propostas?.length ?? atual.totalPropostas }
            : atual,
        )
      }
      setEstado('pronto')
    } catch (e) {
      setEdital((atual) => (atual ? { ...atual, status: 'erro' } : atual))
      setErroCarga(mensagemDeErro(e))
      setEstado('erro')
      carregandoId.current = null
    }
  }, [id])

  useEffect(() => {
    // Evita disparar a leitura do edital duas vezes (React StrictMode em desenvolvimento).
    if (carregandoId.current === id) return
    carregandoId.current = id
    void carregar()
  }, [id, carregar])

  useEffect(() => {
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    fimRef.current?.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'end' })
  }, [mensagens.length, aguardando, estado])

  async function enviar(conteudo?: string) {
    const mensagem = (conteudo ?? texto).trim()
    if (!mensagem || aguardando || estado !== 'pronto') return

    const minha: Mensagem = {
      id: novoId(),
      autor: 'usuario',
      texto: mensagem,
      criadoEm: new Date().toISOString(),
    }
    setMensagens((atual) => [...atual, minha])
    setTexto('')
    if (campoRef.current) campoRef.current.style.height = ''
    setErroEnvio(null)
    setAguardando(true)
    try {
      const resposta = await api.enviarMensagem(id, mensagem)
      setMensagens((atual) => [...atual, resposta])
      setEdital((atual) => (atual ? { ...atual, status: 'ajustando' } : atual))
    } catch (e) {
      setErroEnvio(mensagemDeErro(e))
    } finally {
      setAguardando(false)
    }
  }

  function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    void enviar()
  }

  function aoTeclar(evento: KeyboardEvent<HTMLTextAreaElement>) {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault()
      void enviar()
    }
  }

  function ajustarAltura(campo: HTMLTextAreaElement) {
    campo.style.height = 'auto'
    campo.style.height = `${Math.min(campo.scrollHeight, 160)}px`
  }

  const podeConversar = estado === 'pronto'

  return (
    <div className={`chat${painelAberto ? ' com-painel' : ''}`}>
      <aside className="chat-lado">
        <Link to="/" className="chat-voltar">
          Analisar outro edital
        </Link>
        {edital ? (
          <>
            <StatusTag status={edital.status} />
            <h1>{edital.titulo}</h1>
            <p className="chat-meta">
              <a href={edital.url} target="_blank" rel="noopener noreferrer">
                {hostDe(edital.url)}
              </a>
              <span> – enviado em {dataCurta(edital.criadoEm)}</span>
            </p>
            <button
              type="button"
              className="botao botao-discreto chat-alternar"
              aria-expanded={painelAberto}
              onClick={() => setPainelAberto((aberto) => !aberto)}
            >
              {painelAberto ? 'Ocultar edital' : 'Ver edital'}
            </button>
          </>
        ) : (
          <h1 className="chat-carregando-titulo">Carregando edital…</h1>
        )}
      </aside>

      <section className="chat-principal" aria-label="Conversa sobre o edital">
        <div className="chat-fio">
          {estado === 'erro' && (
            <div className="erro-bloco" role="alert">
              <p>{erroCarga}</p>
              <button
                type="button"
                className="botao botao-primario"
                onClick={() => {
                  carregandoId.current = id
                  void carregar()
                }}
              >
                Tentar de novo
              </button>
            </div>
          )}

          {mensagens.map((mensagem) =>
            mensagem.autor === 'usuario' ? (
              <div key={mensagem.id} className="msg msg-usuario">
                <p>{mensagem.texto}</p>
              </div>
            ) : (
              <div key={mensagem.id} className="msg msg-agente">
                <p>{mensagem.texto}</p>
                {mensagem.propostas && (
                  <div className="propostas">
                    {mensagem.propostas.map((proposta, i) => (
                      <PropostaCard key={proposta.id} proposta={proposta} indice={i} />
                    ))}
                  </div>
                )}
              </div>
            ),
          )}

          {(estado === 'lendo' || aguardando) && (
            <div className="msg msg-agente" role="status" aria-live="polite">
              <p className="digitando">
                {estado === 'lendo' ? 'Lendo o edital e levantando as exigências' : 'Escrevendo a resposta'}
                <span className="pontos" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </p>
            </div>
          )}

          <div ref={fimRef} />
        </div>

        <form className="compositor" onSubmit={aoEnviar}>
          {podeConversar && mensagens.length > 0 && !aguardando && (
            <div className="sugestoes">
              {SUGESTOES.map((sugestao) => (
                <button key={sugestao} type="button" className="chip" onClick={() => void enviar(sugestao)}>
                  {sugestao}
                </button>
              ))}
            </div>
          )}

          {erroEnvio && (
            <p className="erro" role="alert">
              {erroEnvio}
            </p>
          )}

          <div className="compositor-linha">
            <label htmlFor="mensagem" className="sr-only">
              Mensagem para o agente
            </label>
            <textarea
              id="mensagem"
              ref={campoRef}
              rows={1}
              value={texto}
              placeholder={podeConversar ? 'Peça um ajuste ou tire uma dúvida sobre o edital' : 'Aguarde a análise do edital'}
              disabled={!podeConversar}
              onChange={(e) => {
                setTexto(e.target.value)
                ajustarAltura(e.target)
              }}
              onKeyDown={aoTeclar}
            />
            <button
              type="submit"
              className="botao botao-primario"
              disabled={!podeConversar || aguardando || !texto.trim()}
            >
              Enviar
            </button>
          </div>
        </form>
      </section>

      {painelAberto && edital && <EditalViewer edital={edital} onFechar={() => setPainelAberto(false)} />}
    </div>
  )
}