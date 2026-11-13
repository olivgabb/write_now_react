import { useEffect, useState } from 'react'
import { hostDe } from '../utils'

interface AnaliseEmAndamentoProps {
  url: string
  onCancelar: () => void
}

// Tela de espera enquanto o backend lê o edital. O tempo decorrido é real;
// não há etapas simuladas, porque o servidor não informa progresso.
export default function Loading({ url, onCancelar }: AnaliseEmAndamentoProps) {
  const [segundos, setSegundos] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setSegundos((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  const minutos = Math.floor(segundos / 60)
  const restoSegundos = String(segundos % 60).padStart(2, '0')

  return (
    <div className="analise" role="status" aria-live="polite">
      <div className="analise-cartao">
        <span className="analise-giro" aria-hidden="true" />
        <h1>Analisando o edital</h1>
        <p className="analise-fonte">{hostDe(url)}</p>
        <p className="analise-texto">
          O agente está lendo o documento, identificando as exigências e montando as propostas. Isso pode levar um
          tempo.
        </p>
        <p className="analise-tempo">Tempo decorrido: {`${minutos}:${restoSegundos}`}</p>
        <button type="button" className="botao botao-discreto" onClick={onCancelar}>
          Cancelar análise
        </button>
      </div>
    </div>
  )
}