import { useEffect, useState } from 'react'
import type { Edital } from '../types'
import { formatoDe, hostDe } from '../utils'

interface EditalViewerProps {
  edital: Edital
  onFechar: () => void
}

// Painel lateral que mostra o edital ao lado das propostas.
// Usa `edital.previewUrl` quando o backend fornece uma cópia que pode ser exibida
// (mesma origem, sem bloqueio de iframe); caso contrário, tenta a URL original.
export default function EditalViewer({ edital, onFechar }: EditalViewerProps) {
  const formato = formatoDe(edital.url)
  const origem = edital.previewUrl ?? edital.url
  const [carregado, setCarregado] = useState(false)

  useEffect(() => {
    setCarregado(false)
  }, [origem])

  // PDFs usam o leitor do navegador, que não funciona dentro de um iframe com sandbox.
  // Páginas web (e a cópia de demonstração) rodam isoladas, sem scripts.
  const usarSandbox = origem.startsWith('data:') || formato === 'Página web'
  const src = formato === 'PDF' && !origem.startsWith('data:') ? `${origem}#view=FitH` : origem

  return (
    <aside className="visualizador" aria-label="Edital">
      <header className="visualizador-topo">
        <div className="visualizador-titulo">
          <h2>{edital.titulo}</h2>
          <p>
            {formato} – {hostDe(edital.url)}
          </p>
        </div>
        <div className="visualizador-acoes">
          <a className="botao botao-discreto" href={edital.url} target="_blank" rel="noopener noreferrer">
            Abrir em nova aba
          </a>
          <button type="button" className="botao botao-discreto" onClick={onFechar}>
            Fechar
          </button>
        </div>
      </header>

      <div className="visualizador-corpo">
        {!carregado && <p className="visualizador-carregando">Carregando o edital…</p>}
        <iframe
          key={origem}
          title={`Edital: ${edital.titulo}`}
          src={src}
          onLoad={() => setCarregado(true)}
          referrerPolicy="no-referrer"
          sandbox={usarSandbox ? 'allow-same-origin allow-popups' : undefined}
        />
      </div>

      <p className="visualizador-rodape">
        O edital não apareceu? Alguns sites bloqueiam a exibição dentro de outras páginas. Use “Abrir em nova
        aba”.
      </p>
    </aside>
  )
}