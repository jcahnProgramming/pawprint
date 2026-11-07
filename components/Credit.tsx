import type { CSSProperties } from 'react'

export const AUTHOR_NAME = 'Jamie Cahn'
export const AUTHOR_URL = 'https://jamiecahn.com'

type CreditProps = {
  style?: CSSProperties
  linkColor?: string
}

/** "Pawprint, made by Jamie Cahn", with the name linking to the author's site. */
export default function Credit({ style, linkColor = 'inherit' }: CreditProps) {
  return (
    <span style={style}>
      Pawprint, made by{' '}
      <a
        href={AUTHOR_URL}
        target="_blank"
        rel="noopener"
        style={{ color: linkColor, textDecoration: 'underline', textUnderlineOffset: '2px' }}
      >
        {AUTHOR_NAME}
      </a>
    </span>
  )
}
