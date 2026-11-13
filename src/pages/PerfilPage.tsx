import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Campo from '../components/Campo'
import type { DadosPerfil } from '../types'
import { BIOGRAFIA_MAX, iniciais, mensagemDeErro, validarPerfil, type ErrosDeCampo } from '../utils'

const ORDEM: (keyof DadosPerfil)[] = ['nome', 'formacao', 'biografia']

export default function PerfilPage() {
  const { usuario, atualizarPerfil } = useAuth()

  const [editando, setEditando] = useState(false)
  const [dados, setDados] = useState<DadosPerfil>({ nome: '', formacao: '', biografia: '' })
  const [erros, setErros] = useState<ErrosDeCampo<DadosPerfil>>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  if (!usuario) return null

  function comecarEdicao() {
    setDados({
      nome: usuario!.nome,
      formacao: usuario!.formacao ?? '',
      biografia: usuario!.biografia ?? '',
    })
    setErros({})
    setErroGeral(null)
    setSalvo(false)
    setEditando(true)
  }

  function mudar(campo: keyof DadosPerfil, valor: string) {
    setDados((atual) => ({ ...atual, [campo]: valor }))
    if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: undefined }))
  }

  async function aoSalvar(evento: FormEvent) {
    evento.preventDefault()
    if (salvando) return

    const encontrados = validarPerfil(dados)
    const primeiroComErro = ORDEM.find((campo) => encontrados[campo])
    setErros(encontrados)
    setErroGeral(null)
    if (primeiroComErro) {
      document.getElementById(`perfil-${primeiroComErro}`)?.focus()
      return
    }

    setSalvando(true)
    try {
      await atualizarPerfil(dados)
      setEditando(false)
      setSalvo(true)
    } catch (e) {
      setErroGeral(mensagemDeErro(e))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="perfil-pagina">
      <Link to="/" className="chat-voltar">
        ← Voltar aos editais
      </Link>

      <header className="perfil-cabecalho">
        <div className="perfil-avatar" aria-hidden="true">
          {iniciais(usuario.nome)}
        </div>
        <div className="perfil-identidade">
          <h1>{usuario.nome}</h1>
          <p className="lead">{usuario.email}</p>
        </div>
        {!editando && (
          <button type="button" className="botao botao-discreto" onClick={comecarEdicao}>
            Editar perfil
          </button>
        )}
      </header>

      {salvo && !editando && (
        <p className="perfil-aviso" role="status">
          Perfil atualizado.
        </p>
      )}

      {editando ? (
        <form className="perfil-form" onSubmit={aoSalvar} noValidate>
          <Campo id="perfil-nome" rotulo="Nome completo" erro={erros.nome}>
            {(aria) => (
              <input
                id="perfil-nome"
                type="text"
                autoComplete="name"
                value={dados.nome}
                onChange={(e) => mudar('nome', e.target.value)}
                {...aria}
              />
            )}
          </Campo>

          <Campo id="perfil-formacao" rotulo="Formação acadêmica" erro={erros.formacao}>
            {(aria) => (
              <input
                id="perfil-formacao"
                type="text"
                autoComplete="off"
                value={dados.formacao}
                onChange={(e) => mudar('formacao', e.target.value)}
                {...aria}
              />
            )}
          </Campo>

          <Campo
            id="perfil-biografia"
            rotulo="Biografia"
            opcional
            erro={erros.biografia}
            dica={`${dados.biografia.length}/${BIOGRAFIA_MAX}`}
          >
            {(aria) => (
              <textarea
                id="perfil-biografia"
                rows={6}
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

          <div className="perfil-acoes">
            <button type="submit" className="botao botao-primario" disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar alterações'}
            </button>
            <button type="button" className="botao botao-discreto" onClick={() => setEditando(false)} disabled={salvando}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="perfil-secoes">
          <section aria-labelledby="perfil-formacao-titulo">
            <h2 id="perfil-formacao-titulo">Formação acadêmica</h2>
            {usuario.formacao ? (
              <p>{usuario.formacao}</p>
            ) : (
              <p className="dica">Você ainda não informou sua formação.</p>
            )}
          </section>

          <section aria-labelledby="perfil-bio-titulo">
            <h2 id="perfil-bio-titulo">Biografia</h2>
            {usuario.biografia ? (
              <p className="perfil-bio">{usuario.biografia}</p>
            ) : (
              <p className="dica">Nenhuma biografia ainda. Use “Editar perfil” para escrever uma.</p>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
