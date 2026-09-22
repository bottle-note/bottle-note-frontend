import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
}

export default function InfoRow({ icon: Icon, label, value }: Props) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={16} className="shrink-0 text-fg-neutral-muted" aria-hidden />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-12 text-fg-neutral-muted">{label}</p>
        <p className="break-words text-13.5 font-semibold text-fg-neutral">
          {value}
        </p>
      </div>
    </div>
  );
}
