import { useId } from 'react'

interface CarimboProps {
  /** Texto que percorre a borda do carimbo. É repetido para fechar o círculo. */
  borda: string
  /** Palavra grande no centro. */
  centro: string
  className?: string
}

// Carimbo de "recebido", como os de repartição pública. Decorativo: o texto
// equivalente já aparece na tela, então fica oculto para leitores de tela.
export default function Carimbo({ borda, centro, className = '' }: CarimboProps) {
  const id = `arco-${useId().replace(/:/g, '')}`
  const texto = `${borda}   ${borda}   `

  return (
    <svg className={`carimbo ${className}`} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <defs>
        <path id={id} d="M100,100 m-70,0 a70,70 0 1,1 140,0 a70,70 0 1,1 -140,0" />
      </defs>
      <circle cx="100" cy="100" r="94" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text fontSize="14" fontWeight="700" letterSpacing="1.5" fill="currentColor">
        <textPath href={`#${id}`} textLength="435" lengthAdjust="spacing">
          {texto}
        </textPath>
      </text>
      <text
        x="100"
        y="108"
        textAnchor="middle"
        fontSize="21"
        fontWeight="800"
        letterSpacing="1"
        fill="currentColor"
      >
        {centro}
      </text>
    </svg>
  )
}
