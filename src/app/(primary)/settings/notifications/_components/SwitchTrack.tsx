export function SwitchTrack({ state }: { state: 'true' | 'false' | 'mixed' }) {
  return (
    <span
      aria-hidden="true"
      className={`relative block h-[26px] w-44 shrink-0 rounded-full transition-colors ${state === 'true' ? 'bg-bg-brand-solid' : state === 'mixed' ? 'bg-bg-brand-weak ring-1 ring-stroke-brand-solid' : 'bg-bg-disabled'}`}
    >
      <span
        className={`absolute left-3 top-3 h-20 w-20 rounded-full shadow-sm transition-transform ${state === 'true' ? 'translate-x-[18px] bg-fg-neutral-inverted' : state === 'mixed' ? 'bg-fg-brand' : 'bg-fg-neutral-muted'}`}
      />
    </span>
  );
}
