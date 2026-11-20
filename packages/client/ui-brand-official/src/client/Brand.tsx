import type { SidebarBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client'

/**
 * Render the Pisces mark with the presentation requested by its host surface.
 * @param props - Host-supplied mark presentation.
 * @returns the Pisces zodiac glyph.
 */
export function OfficialBrandMark({ size }: SidebarBrandMarkOwnerProps) {
  const edge = Number(size) > 0 ? Number(size) : 24
  return (
    <svg width={edge} height={edge} viewBox="0 0 40 40" role="img" aria-label="Pisces">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3">
        <path d="M 3 20 L 37 20" />
        <path d="M 13 5 A 7.4 7.4 0 0 0 13 24" />
        <path d="M 27 16 A 7.4 7.4 0 0 1 27 35" />
      </g>
    </svg>
  )
}

/**
 * Render the Pisces wordmark without its independently slotted mark.
 * @returns the Pisces name wordmark.
 */
export function OfficialBrandName() {
  return (
    <span
      style={{
        fontSize: 15,
        fontWeight: 500,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        lineHeight: 1,
      }}
    >
      Pisces
    </span>
  )
}
