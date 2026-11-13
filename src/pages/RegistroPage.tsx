import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Campo from '../components/Campo'
import Carimbo from '../components/Carimbo'
import { APP_NAME } from '../config'
import type { DadosRegistro } from '../types'
import { BIOGRAFIA_MAX, SENHA_MIN, mensagemDeErro, validarRegistro, type ErrosDeCampo } from '../utils'

const VAZIO: DadosRegistro = { nome: '', email: '', senha: '', formacao: '', biografia: '' }

// Ordem em que os campos aparecem, usada para levar o foco ao primeiro com erro.
const ORDEM: (keyof DadosRegistro)[] = ['nome', 'email', 'senha', 'formacao', 'biografia']

export default function RegistroPage() {
  const { usuario, registrar } = useAuth()
  const navegar = useNavigate()

  const [dados, setDados] = useState<DadosRegistro>(VAZIO)
  const [erros, setErros] = useState<ErrosDeCampo<DadosRegistro>>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to="/" replace />

  function mudar(campo: keyof DadosRegistro, valor: string) {
    setDados((atual) => ({ ...atual, [campo]: valor }))
    if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: undefined }))
  }

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    if (enviando) return

    const encontrados = validarRegistro(dados)
    const primeiroComErro = ORDEM.find((campo) => encontrados[campo])
    setErros(encontrados)
    setErroGeral(null)
    if (primeiroComErro) {
      document.getElementById(primeiroComErro)?.focus()
      return
    }

    setEnviando(true)
    try {
      await registrar(dados)
      navegar('/', { replace: true })
    } catch (e) {
      setErroGeral(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <div className="login registro">
      <section className="login-lado">
        <p className="marca marca-clara">{APP_NAME}</p>
        <div>
          <h1>Abra seu processo em poucos minutos.</h1>
          <p>
            Conte quem você é e qual sua formação. Com isso, as propostas que o agente escreve já partem do
            seu perfil, e não de um modelo genérico.
          </p>
        </div>
      </section>

      <section className="login-principal">
        <Carimbo className="login-carimbo" borda="CADASTRO RECEBIDO" centro="NOVO" />

        <form className="login-form registro-form" onSubmit={aoEnviar} noValidate>
          <h2>Criar conta</h2>

          <Campo id="nome" rotulo="Nome completo" erro={erros.nome}>
            {(aria) => (
              <input
                id="nome"
                type="text"
                autoComplete="name"
                value={dados.nome}
                onChange={(e) => mudar('nome', e.target.value)}
                {...aria}
              />
            )}
          </Campo>

          <Campo id="email" rotulo="E-mail" erro={erros.email}>
            {(aria) => (
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={dados.email}
                onChange={(e) => mudar('email', e.target.value)}
                {...aria}
              />
            )}
          </Campo>

          <Campo id="senha" rotulo="Senha" erro={erros.senha} dica={`Pelo menos ${SENHA_MIN} caracteres.`}>
            {(aria) => (
              <input
                id="senha"
                type="password"
                autoComplete="new-password"
                value={dados.senha}
                onChange={(e) => mudar('senha', e.target.value)}
                {...aria}
              />
            )}
          </Campo>

          <Campo
            id="formacao"
            rotulo="Formação acadêmica"
            erro={erros.formacao}
            dica="Curso e instituição, por exemplo: Direito, UFMG."
          >
            {(aria) => (
              <input
                id="formacao"
                type="text"
                autoComplete="off"
                value={dados.formacao}
                onChange={(e) => mudar('formacao', e.target.value)}
                {...aria}
              />
            )}
          </Campo>

          <Campo
            id="biografia"
            rotulo="Biografia"
            opcional
            erro={erros.biografia}
            dica={`Conte um pouco sobre sua trajetória e áreas de atuação. ${dados.biografia.length}/${BIOGRAFIA_MAX}`}
          >
            {(aria) => (
              <textarea
                id="biografia"
                rows={5}
                value={dados.biografia}
                onChange={(e) => mudar('biografia', e.target.value)}
                {...aria}
              />
            )}
          </Campo>

          {erroGeral && (
            <p className="erro" role="alert">
              {erroGeral}
            </p>
          )}

          <button type="submit" className="botao botao-primario botao-cheio" disabled={enviando}>
            {enviando ? 'Criando conta…' : 'Criar conta'}
          </button>

          <p className="nota">
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </form>
      </section>
    </div>
  )
}
