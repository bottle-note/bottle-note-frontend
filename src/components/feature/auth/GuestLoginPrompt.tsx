import { useId } from 'react';

import Button from '@/components/ui/Button/Button';

interface GuestLoginPromptProps {
  title: string;
  description: string;
  buttonLabel: string;
  onLogin: () => void;
}

export function GuestLoginPrompt({
  title,
  description,
  buttonLabel,
  onLogin,
}: GuestLoginPromptProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <section
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="text-center"
    >
      <h2 id={titleId} className="text-20 font-bold text-fg-neutral">
        {title}
      </h2>
      <p
        id={descriptionId}
        className="mt-2 text-13 font-medium text-fg-neutral-muted"
      >
        {description}
      </p>
      <div className="pointer-events-auto mt-5">
        <Button btnName={buttonLabel} onClick={onLogin} />
      </div>
    </section>
  );
}
