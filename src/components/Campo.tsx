import type { ReactNode } from 'react'

interface AtributosDoCampo {
  'aria-invalid'?: true
  'aria-describedby'?: string
}

interface CampoProps {
  id: string
  rotulo: string
  erro?: string
  dica?: string
  opcional?: boolean
  /** Recebe os atributos de acessibilidade para colocar no input, select ou textarea. */
  children: (atributos: AtributosDoCampo) => ReactNode
}

// Rótulo + controle + mensagem de erro (ou dica) ligados por aria-describedby.
export default function Campo({ id, rotulo, erro, dica, opcional, children }: CampoProps) {
  const idMensagem = `${id}-msg`
  const atributos: AtributosDoCampo = {
    'aria-invalid': erro ? true : undefined,
    'aria-describedby': erro || dica ? idMensagem : undefined,
  }

  return (
    <div className="campo">
      <label htmlFor={id}>
        {rotulo}
        {opcional && <span className="campo-opcional"> (opcional)</span>}
      </label>
      {children(atributos)}
      {erro ? (
        <p id={idMensagem} className="campo-erro">
          {erro}
        </p>
      ) : dica ? (
        <p id={idMensagem} className="campo-dica">
          {dica}
        </p>
      ) : null}
    </div>
  )
}
