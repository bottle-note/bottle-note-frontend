import Button from '@/components/ui/Button/Button';
import { useNavLayout } from '@/components/ui/Layout/NavLayout';

interface GuestCurationLoginPromptProps {
  onLogin: () => void;
}

export function GuestCurationLoginPrompt({
  onLogin,
}: GuestCurationLoginPromptProps) {
  const { isNavbarSuppressed, isNavigationVisible } = useNavLayout();
  const isNavbarVisible = isNavigationVisible && !isNavbarSuppressed;

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed-content pointer-events-none bottom-0 z-[9] h-[60vh]"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, var(--color-bg-layer-default) 58%, var(--color-bg-layer-default) 100%)',
        }}
      />
      <section
        aria-labelledby="guest-curation-login-title"
        className="fixed-content pointer-events-none z-20 px-5 text-center transition-[bottom] duration-300"
        style={{
          bottom: isNavbarVisible
            ? 'calc(var(--navbar-total-space) + 16px)'
            : 'var(--navbar-margin-bottom)',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-6 -top-16 -z-10"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, var(--color-bg-layer-default) 48px, var(--color-bg-layer-default) 100%)',
          }}
        />
        <h2
          id="guest-curation-login-title"
          className="text-20 font-bold text-fg-neutral"
        >
          더 많은 이야기가 궁금하신가요?
        </h2>
        <p className="mt-2 text-13 font-medium text-fg-neutral-muted">
          로그인하고 보틀노트의 시음회와 큐레이션을 만나보세요.
        </p>
        <div className="pointer-events-auto mt-5">
          <Button btnName="로그인하고 더 보기" onClick={onLogin} />
        </div>
      </section>
    </>
  );
}
