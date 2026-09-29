'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { NotificationSettingsApi } from '@/api/notification/notification.api';
import type {
  NotificationSetting,
  NotificationSettingsData,
  NotificationSettingsUpdateRequest,
} from '@/api/notification/types';
import { ROUTES } from '@/constants/routes';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import AnimatedCollapse from '@/components/ui/Display/AnimatedCollapse';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import {
  notificationSettingsKey,
  useNotificationSettingsQuery,
} from '@/queries/useNotificationSettingsQuery';
import { SwitchTrack } from './SwitchTrack';
import { notificationSettingsCopy as copy } from './notificationSettingsCopy';

type AccountSettingsUpdate = NotificationSettingsUpdateRequest & {
  userId: number;
};

function NotificationSettingsSkeleton() {
  return (
    <div role="status" aria-label={copy.loading}>
      <div aria-hidden="true">
        <div className="flex min-h-76 items-center justify-between rounded-sm border border-stroke-neutral-basement bg-bg-neutral-weak px-16 py-8">
          <div className="flex items-center gap-8">
            <SkeletonBase width={112} height={18} />
            <SkeletonBase width={28} height={14} />
          </div>
          <SkeletonBase width={44} height={28} borderRadius="14px" />
        </div>
        <div className="mt-24 space-y-12">
          {[0, 1, 2, 3, 4].map((group) => (
            <div
              key={group}
              className="rounded-sm border border-stroke-neutral-basement bg-bg-neutral-weak px-16 py-8"
            >
              <div className="flex min-h-56 items-center justify-between">
                <SkeletonBase width={group % 2 === 0 ? 104 : 76} height={16} />
                <SkeletonBase width={44} height={28} borderRadius="14px" />
              </div>
              {group === 0 && (
                <div className="flex min-h-56 items-center justify-between border-t border-stroke-neutral-basement">
                  <SkeletonBase width={136} height={15} />
                  <SkeletonBase width={44} height={28} borderRadius="14px" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NotificationSettings() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuthSession();
  const userId = !isAuthLoading && isLoggedIn ? user?.userId ?? null : null;
  const { data, isPending, isError, refetch } =
    useNotificationSettingsQuery(userId);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState('');
  const groups = data?.groups ?? [];
  const items = groups.flatMap((group) => group.settings);
  const enabledCount = (list: NotificationSetting[]) =>
    list.filter((item) => item.enabled).length;
  const checked = (list: NotificationSetting[]): 'true' | 'false' | 'mixed' => {
    if (list.length === 0) return 'false';
    const count = enabledCount(list);
    return count === list.length ? 'true' : count === 0 ? 'false' : 'mixed';
  };
  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.replace(
        `${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.SETTINGS.NOTIFICATIONS)}`,
      );
    }
  }, [isAuthLoading, isLoggedIn, router]);

  const update = useMutation({
    mutationFn: ({ settings }: AccountSettingsUpdate) =>
      NotificationSettingsApi.updateSettings({ settings }),
    onMutate: async ({ settings, userId }: AccountSettingsUpdate) => {
      setMessage('');
      const queryKey = notificationSettingsKey(userId);
      await queryClient.cancelQueries({ queryKey });
      const previous =
        queryClient.getQueryData<NotificationSettingsData>(queryKey);
      const nextValues = new Map(
        settings.map(({ eventAction, enabled }) => [eventAction, enabled]),
      );

      queryClient.setQueryData<NotificationSettingsData>(
        queryKey,
        (current) =>
          current && {
            ...current,
            groups: current.groups.map((group) => ({
              ...group,
              settings: group.settings.map((item) => ({
                ...item,
                enabled: nextValues.get(item.eventAction) ?? item.enabled,
              })),
            })),
          },
      );
      return { previous, queryKey };
    },
    onSuccess: (updated, { userId }) => {
      queryClient.setQueryData(notificationSettingsKey(userId), updated);
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
      setMessage(copy.saveError);
    },
  });

  const updateSettings = (list: NotificationSetting[], nextValue: boolean) => {
    if (userId === null || update.isPending || list.length === 0) return;
    update.mutate({
      userId,
      settings: list.map((item) => ({
        eventAction: item.eventAction,
        enabled: nextValue,
      })),
    });
  };

  if (!isAuthLoading && !isLoggedIn) {
    return (
      <p className="px-20 py-40 text-14 text-fg-neutral-muted">
        {copy.checkingSession}
      </p>
    );
  }

  return (
    <section className="px-20 pb-40 pt-24">
      {isAuthLoading || isPending ? (
        <NotificationSettingsSkeleton />
      ) : isError ? (
        <div
          role="alert"
          className="rounded-xl border border-stroke-neutral-subtle bg-bg-neutral-weak px-20 py-24 text-14"
        >
          <p>{copy.loadError}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-16 font-bold text-fg-brand underline"
          >
            {copy.retry}
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="py-24 text-14 text-fg-neutral-muted">{copy.empty}</p>
      ) : (
        <>
          <div className="flex min-h-76 items-center gap-16 rounded-sm border border-stroke-neutral-basement bg-bg-neutral-weak px-16 py-8">
            <div className="flex min-w-0 flex-1 items-center gap-8">
              <strong className="text-16 font-bold">{copy.all}</strong>
              <span className="text-12 text-fg-neutral-muted">
                {copy.enabledCount(enabledCount(items), items.length)}
              </span>
            </div>
            <button
              type="button"
              role="checkbox"
              aria-checked={checked(items)}
              aria-label={copy.allToggleLabel}
              disabled={update.isPending}
              onClick={() => updateSettings(items, checked(items) !== 'true')}
              className="flex h-44 w-48 shrink-0 items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
            >
              <SwitchTrack state={checked(items)} />
            </button>
          </div>
          <div className="mt-24 space-y-12">
            {groups.map((group, index) => {
              const groupState = checked(group.settings);
              const groupName = group.displayName;
              const isOpen = expanded[group.group] ?? index === 0;
              return (
                <section
                  key={group.group}
                  className="rounded-sm border border-stroke-neutral-basement bg-bg-neutral-weak px-16 py-8"
                >
                  <div className="flex min-h-56 items-center gap-8 py-6">
                    <h2 className="min-w-0 flex-1">
                      <button
                        type="button"
                        aria-label={copy.groupToggleLabel(groupName, isOpen)}
                        aria-expanded={isOpen}
                        aria-controls={`notification-group-${group.group}`}
                        onClick={() =>
                          setExpanded((previous) => ({
                            ...previous,
                            [group.group]: !isOpen,
                          }))
                        }
                        className="flex min-h-44 w-full min-w-0 items-center gap-8 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
                      >
                        <ChevronDown
                          aria-hidden="true"
                          size={16}
                          className={`shrink-0 text-fg-neutral-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                        <span className="min-w-0 text-16 font-bold text-fg-neutral">
                          {groupName}
                        </span>
                        <span className="shrink-0 text-12 font-normal text-fg-neutral-muted">
                          {copy.enabledCount(
                            enabledCount(group.settings),
                            group.settings.length,
                          )}
                        </span>
                      </button>
                    </h2>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={groupState}
                      aria-label={copy.groupSwitchLabel(groupName)}
                      disabled={update.isPending || group.settings.length === 0}
                      onClick={() =>
                        updateSettings(group.settings, groupState !== 'true')
                      }
                      className="flex h-44 w-48 shrink-0 items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
                    >
                      <SwitchTrack state={groupState} />
                    </button>
                  </div>
                  <div id={`notification-group-${group.group}`}>
                    <AnimatedCollapse isOpen={isOpen}>
                      <div className="pb-8">
                        {group.settings.map((item) => {
                          const isOn = item.enabled;
                          const itemName = item.displayName;
                          const itemDescription =
                            copy.itemDescriptions[item.eventAction];
                          return (
                            <button
                              key={item.eventAction}
                              type="button"
                              role="switch"
                              aria-checked={isOn}
                              aria-label={itemName}
                              disabled={update.isPending}
                              onClick={() => updateSettings([item], !isOn)}
                              className="flex min-h-60 w-full items-center gap-14 border-t border-stroke-neutral-basement py-12 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
                            >
                              <span className="min-w-0 flex-1">
                                <span className="block text-15 font-medium leading-21">
                                  {itemName}
                                </span>
                                {itemDescription && (
                                  <span className="mt-4 block text-13 leading-20 text-fg-neutral-muted">
                                    {itemDescription}
                                  </span>
                                )}
                              </span>
                              <SwitchTrack state={isOn ? 'true' : 'false'} />
                            </button>
                          );
                        })}
                      </div>
                    </AnimatedCollapse>
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}
      {message && (
        <div className="fixed-content bottom-[calc(var(--safe-area-bottom)+20px)] z-30 px-20">
          <p
            role="alert"
            className="rounded-lg bg-bg-neutral-solid px-16 py-12 text-13 text-fg-neutral-inverted"
          >
            {message}
          </p>
        </div>
      )}
    </section>
  );
}
