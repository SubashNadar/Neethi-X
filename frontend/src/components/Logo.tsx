export function LogoMark({ size = 38 }: { size?: number }) {
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-xl bg-primary font-heading font-extrabold text-white"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.52) }}
    >
      N
    </div>
  )
}

export function BrandLockup() {
  return (
    <div className="flex items-center gap-3.5">
      <LogoMark />
      <div className="flex flex-col leading-none">
        <span className="font-heading text-[19px] font-bold leading-none text-ink">Neethi-X</span>
        <span className="mt-[3px] text-xs text-muted">AI legal help for every Indian</span>
      </div>
    </div>
  )
}
