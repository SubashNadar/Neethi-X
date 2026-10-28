export function LogoMark({ size = 38, tone = 'navy' }: { size?: number; tone?: 'navy' | 'brass' }) {
  return (
    <div
      className={`relative flex flex-shrink-0 items-center justify-center rounded-xl font-heading font-extrabold text-white shadow-sm ${
        tone === 'brass'
          ? 'bg-gradient-to-br from-brass-light to-brass-dark'
          : 'bg-gradient-to-br from-navy-600 to-navy-900'
      }`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.52) }}
    >
      N
      <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/15" />
    </div>
  )
}

export function BrandLockup({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-3.5">
      <LogoMark tone={inverted ? 'brass' : 'navy'} />
      <div className="flex flex-col leading-none">
        <span
          className={`font-heading text-[19px] font-bold leading-none ${inverted ? 'text-white' : 'text-ink'}`}
        >
          Neethi-X
        </span>
        <span className={`mt-[3px] text-xs ${inverted ? 'text-white/55' : 'text-muted'}`}>
          AI legal help for every Indian
        </span>
      </div>
    </div>
  )
}
