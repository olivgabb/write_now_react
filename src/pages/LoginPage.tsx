import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Carimbo from '../components/Carimbo'
import { APP_NAME, USE_MOCK } from '../config'
import { mensagemDeErro } from '../utils'

export default function LoginPage() {
  const { usuario, entrar } = useAuth()
  const navegar = useNavigate()
  const local = useLocation()
  const destino = (local.state as { de?: string } | null)?.de ?? '/'

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to={destino} replace />

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    if (enviando) return
    if (!email.trim() || !senha) {
      setErro('Informe e-mail e senha para entrar.')
      return
    }
    setErro(null)
    setEnviando(true)
    try {
      await entrar(email, senha)
      navegar(destino, { replace: true })
    } catch (e) {
      setErro(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <div className="login">
      <section className="login-lado">
        <p className="marca marca-clara">{APP_NAME}</p>
        <div>
          <h1>Do edital à proposta, sem copiar e colar.</h1>
          <p>
            Envie o link do edital. O agente lê o documento, entende o problema do órgão e propõe como
            atender cada exigência.
          </p>
        </div>
      </section>

      <section className="login-principal">
        <Carimbo className="login-carimbo" borda="RECEBIDO PARA ANÁLISE" centro="EDITAL" />

        <form className="login-form" onSubmit={aoEnviar} noValidate>
          <h2>Entrar</h2>

          <div className="campo">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={erro ? true : undefined}
              aria-describedby={erro ? 'login-erro' : undefined}
            />
          </div>

          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              aria-invalid={erro ? true : undefined}
              aria-describedby={erro ? 'login-erro' : undefined}
            />
          </div>

          {erro && (
            <p id="login-erro" className="erro" role="alert">
              {erro}
            </p>
          )}

          <button type="submit" className="botao botao-primario botao-cheio" disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>

          {USE_MOCK && (
            <p className="nota">Modo demonstração: qualquer e-mail e senha funcionam.</p>
          )}
        </form>
      </section>
    </div>
  )
}
