import { useState } from 'react'
import type { Proposta } from '../types'

interface PropostaCardProps {
  proposta: Proposta
  indice: number
}

function paraTexto(p: Proposta, letra: string): string {
  return [
    `Proposta ${letra}: ${p.titulo}`,
    '',
    p.resumo,
    '',
    `Prazo: ${p.prazo}`,
    `Investimento: ${p.investimento}`,
    '',
    'Como seria feito:',
    ...p.etapas.map((etapa, i) => `${i + 1}. ${etapa}`),
    '',
    'Riscos:',
    ...p.riscos.map((risco) => `- ${risco}`),
  ].join('\n')
}

export default function PropostaCard({ proposta, indice }: PropostaCardProps) {
  const letra = String.fromCharCode(65 + (indice % 26))
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(paraTexto(proposta, letra))
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <article className="proposta" aria-labelledby={`proposta-${proposta.id}`}>
      <header className="proposta-topo">
        <div>
          <p className="proposta-letra">Proposta {letra}</p>
          <h3 id={`proposta-${proposta.id}`}>{proposta.titulo}</h3>
        </div>
        <button type="button" className="botao botao-discreto" onClick={copiar}>
          {copiado ? 'Copiada' : 'Copiar proposta'}
        </button>
      </header>

      <p className="proposta-resumo">{proposta.resumo}</p>

      <dl className="proposta-dados">
        <div>
          <dt>Prazo</dt>
          <dd>{proposta.prazo}</dd>
        </div>
        <div>
          <dt>Investimento</dt>
          <dd>{proposta.investimento}</dd>
        </div>
      </dl>

      <div className="proposta-listas">
        <section>
          <h4>Como seria feito</h4>
          <ol>
            {proposta.etapas.map((etapa) => (
              <li key={etapa}>{etapa}</li>
            ))}
          </ol>
        </section>
        <section>
          <h4>Riscos</h4>
          <ul>
            {proposta.riscos.map((risco) => (
              <li key={risco}>{risco}</li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  )
}
