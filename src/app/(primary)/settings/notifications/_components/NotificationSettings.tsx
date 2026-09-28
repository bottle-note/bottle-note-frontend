'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { NotificationSettingsApi } from '@/api/notification/notification.api';
import type { NotificationSetting } from '@/api/notification/types';
import { ROUTES } from '@/constants/routes';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import {
  NOTIFICATION_SETTINGS_KEY,
  useNotificationSettingsQuery,
} from '@/queries/useNotificationSettingsQuery';
import { SwitchTrack } from './SwitchTrack';

export function NotificationSettings() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoggedIn, isLoading: isAuthLoading } = useAuthSession();
  const { data, isPending, isError, refetch } = useNotificationSettingsQuery(
    !isAuthLoading && isLoggedIn,
  );
  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState(false);
  const groups = data?.groups ?? [];
  const items = groups.flatMap((group) => group.settings);
  const enabled = (item: NotificationSetting) =>
    draft[item.eventAction] ?? item.enabled;
  const enabledCount = (list: NotificationSetting[]) =>
    list.filter(enabled).length;
  const checked = (list: NotificationSetting[]): 'true' | 'false' | 'mixed' => {
    const count = enabledCount(list);
    return count === list.length ? 'true' : count === 0 ? 'false' : 'mixed';
  };
  const changes = items
    .filter((item) => enabled(item) !== item.enabled)
    .map((item) => ({ eventAction: item.eventAction, enabled: enabled(item) }));

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.replace(
        `${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.SETTINGS.NOTIFICATIONS)}`,
      );
    }
  }, [isAuthLoading, isLoggedIn, router]);

  const updateDraft = (list: NotificationSetting[], nextValue: boolean) => {
    setMessage('');
    setSaveError(false);
    setDraft((previous) => {
      const next = { ...previous };
      list.forEach((item) => {
        if (nextValue === item.enabled) delete next[item.eventAction];
        else next[item.eventAction] = nextValue;
      });
      return next;
    });
  };

  const save = useMutation({
    mutationFn: NotificationSettingsApi.updateSettings,
    onSuccess: (updated) => {
      queryClient.setQueryData(NOTIFICATION_SETTINGS_KEY, updated);
      setDraft({});
      setSaveError(false);
      setMessage('변경사항을 저장했어요');
    },
    onError: () => {
      setSaveError(true);
      setMessage('변경사항을 저장하지 못했어요. 다시 시도해 주세요.');
    },
  });

  if (isAuthLoading || !isLoggedIn) {
    return (
      <p className="px-20 py-40 text-14 text-fg-neutral-muted">
        로그인 정보를 확인하고 있어요.
      </p>
    );
  }

  return (
    <section className="px-20 pb-[calc(110px+var(--safe-area-bottom))] pt-28">
      <div>
        <h1 className="text-20 font-bold">알림 수신 설정</h1>
        <p className="mt-8 text-13 leading-21 text-fg-neutral-muted">
          내 알림함에 담을 소식을 골라주세요.
        </p>
      </div>

      {isPending ? (
        <p role="status" className="py-32 text-14 text-fg-neutral-muted">
          알림 설정을 불러오고 있어요.
        </p>
      ) : isError ? (
        <div
          role="alert"
          className="mt-24 rounded-xl border border-stroke-neutral-subtle bg-bg-neutral-weak px-20 py-24 text-14"
        >
          <p>알림 설정을 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-16 font-bold text-fg-brand underline"
          >
            다시 시도
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="mt-24 py-24 text-14 text-fg-neutral-muted">
          설정할 수 있는 알림이 없어요.
        </p>
      ) : (
        <>
          <div className="mt-24 flex min-h-76 items-center gap-16 border-y border-stroke-neutral-subtle py-16">
            <div className="min-w-0 flex-1">
              <strong className="block text-15">전체 알림 받기</strong>
              <span className="mt-4 block text-12 text-fg-neutral-muted">
                {items.length}개 중 {enabledCount(items)}개 켜짐
              </span>
            </div>
            <button
              type="button"
              role="checkbox"
              aria-checked={checked(items)}
              aria-label="전체 알림 일괄 변경"
              disabled={save.isPending}
              onClick={() => updateDraft(items, checked(items) !== 'true')}
              className="flex h-44 w-48 shrink-0 items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
            >
              <SwitchTrack state={checked(items)} />
            </button>
          </div>
          <div className="mt-10">
            {groups.map((group) => {
              const groupState = checked(group.settings);
              const isOpen = expanded[group.group] ?? true;
              return (
                <section key={group.group} className="pt-28">
                  <div className="flex min-h-44 items-center gap-12">
                    <button
                      type="button"
                      aria-label={`${group.displayName} ${isOpen ? '접기' : '펼치기'}`}
                      aria-expanded={isOpen}
                      aria-controls={`notification-group-${group.group}`}
                      onClick={() =>
                        setExpanded((previous) => ({
                          ...previous,
                          [group.group]: !isOpen,
                        }))
                      }
                      className="flex min-h-44 min-w-0 flex-1 items-center gap-8 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
                    >
                      <span className="min-w-0 text-13 font-bold text-fg-brand">
                        {group.displayName}
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        size={16}
                        className={`shrink-0 text-fg-neutral-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={groupState}
                      aria-label={`${group.displayName} 전체 변경`}
                      disabled={save.isPending}
                      onClick={() =>
                        updateDraft(group.settings, groupState !== 'true')
                      }
                      className="flex h-44 w-48 shrink-0 items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
                    >
                      <SwitchTrack state={groupState} />
                    </button>
                  </div>
                  <div
                    id={`notification-group-${group.group}`}
                    hidden={!isOpen}
                    className="pt-8"
                  >
                    {group.settings.map((item, index) => {
                      const isOn = enabled(item);
                      return (
                        <button
                          key={item.eventAction}
                          type="button"
                          role="switch"
                          aria-checked={isOn}
                          aria-label={item.displayName}
                          disabled={save.isPending}
                          onClick={() => updateDraft([item], !isOn)}
                          className={`flex min-h-64 w-full items-center gap-14 py-12 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring ${index > 0 ? 'border-t border-stroke-neutral-subtle' : ''}`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-15 font-medium leading-21">
                              {item.displayName}
                            </span>
                            {item.description && (
                              <span className="mt-4 block text-13 leading-20 text-fg-neutral-muted">
                                {item.description}
                              </span>
                            )}
                          </span>
                          <SwitchTrack state={isOn ? 'true' : 'false'} />
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
          <p className="mt-32 border-t border-stroke-neutral-subtle pt-20 text-13 leading-20 text-fg-neutral-muted">
            설정을 끄면 새 알림은 알림함에 쌓이지 않아요. 기존 알림은
            유지됩니다.
          </p>
        </>
      )}
      {message && (
        <p
          role={saveError ? 'alert' : 'status'}
          className={`mt-16 px-6 text-13 ${saveError ? 'text-fg-brand' : 'text-fg-neutral-muted'}`}
        >
          {message}
        </p>
      )}
      {changes.length > 0 && (
        <div className="fixed-content bottom-0 z-20 flex gap-12 border-t border-stroke-neutral-subtle bg-bg-layer-default px-16 pb-safe pt-14">
          <button
            type="button"
            disabled={save.isPending}
            onClick={() => {
              setDraft({});
              setMessage('');
              setSaveError(false);
            }}
            className="px-10 text-13 text-fg-neutral-muted"
          >
            되돌리기
          </button>
          <button
            type="button"
            disabled={save.isPending}
            onClick={() => save.mutate({ settings: changes })}
            className="min-h-50 flex-1 rounded-xl bg-bg-brand-solid px-16 text-14 font-bold text-fg-brand-contrast disabled:opacity-50"
          >
            {save.isPending
              ? '저장 중...'
              : `${changes.length}개 변경사항 저장`}
          </button>
        </div>
      )}
    </section>
  );
}
