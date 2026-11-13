import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import EditalCard from '../components/EditalCard'
import { api } from '../services/api'
import type { Edital } from '../types'
import { mensagemDeErro, primeiroNome, saudacao, validarUrlEdital } from '../utils'

export default function EditalPage() {
  const navegar = useNavigate()
  const { usuario } = useAuth()
  const [url, setUrl] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [historico, setHistorico] = useState<Edital[] | null>(null)

  const nome = primeiroNome(usuario?.nome ?? '')

  useEffect(() => {
    let ativo = true
    api
      .listarEditais()
      .then((lista) => ativo && setHistorico(lista))
      .catch(() => ativo && setHistorico([]))
    return () => {
      ativo = false
    }
  }, [])

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    if (enviando) return
    const resultado = validarUrlEdital(url)
    if (!resultado.ok) {
      setErro(resultado.erro)
      return
    }
    setErro(null)
    setEnviando(true)
    try {
      const edital = await api.criarEdital(resultado.url)
      navegar(`/edital/${edital.id}`)
    } catch (e) {
      setErro(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <div className="edital-pagina">
      <header className="boas-vindas">
        <h1>{nome ? `${saudacao()}, ${nome}.` : `${saudacao()}.`}</h1>
        <p className="lead">
          Qual edital vamos resolver hoje? Cole o link de um edital em PDF ou em página web e o agente volta
          com propostas.
        </p>
      </header>

      <form className="url-form" onSubmit={aoEnviar} noValidate>
        <label htmlFor="url-edital">Link do edital</label>
        <div className="url-linha">
          <input
            id="url-edital"
            type="url"
            inputMode="url"
            placeholder="https://orgao.gov.br/editais/pregao-12-2026.pdf"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-invalid={erro ? true : undefined}
            aria-describedby={erro ? 'url-erro' : 'url-dica'}
          />
          <button type="submit" className="botao botao-primario" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Analisar edital'}
          </button>
        </div>
        {erro ? (
          <p id="url-erro" className="erro" role="alert">
            {erro}
          </p>
        ) : (
          <p id="url-dica" className="dica">
            O link precisa abrir sem login. Se o edital exigir cadastro, baixe o PDF e hospede em um endereço
            público.
          </p>
        )}
      </form>

      <section className="historico" aria-labelledby="historico-titulo">
        <h2 id="historico-titulo">Seus editais</h2>
        {historico === null ? (
          <p className="dica">Carregando…</p>
        ) : historico.length === 0 ? (
          <p className="dica">Nenhum edital ainda. Cole um link acima para começar.</p>
        ) : (
          <ul className="historico-grade">
            {historico.map((edital) => (
              <li key={edital.id}>
                <EditalCard edital={edital} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
