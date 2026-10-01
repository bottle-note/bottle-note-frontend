import { Check, ChevronRight } from 'lucide-react';
import styles from '../bartender.module.css';

interface Props {
  title: string;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export default function ChoiceCard({
  title,
  description,
  selected,
  disabled,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      className={styles.choice}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
    >
      <span>
        <span className={styles.choiceTitle}>{title}</span>
        {description && (
          <span className={styles.choiceDescription}>{description}</span>
        )}
      </span>
      {selected ? (
        <Check size={18} aria-hidden="true" />
      ) : (
        <ChevronRight size={18} aria-hidden="true" />
      )}
    </button>
  );
}
