'use client';

import { Fragment, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings2 } from 'lucide-react';
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import type { ApiResponse } from '@/api/_shared/types';
import { NotificationInboxApi } from '@/api/notification/notification.api';
import type {
  NotificationItem,
  NotificationListData,
} from '@/api/notification/types';
import { InquireApi } from '@/api/inquire/inquire.api';
import { ReviewApi } from '@/api/review/review.api';
import { UserApi } from '@/api/user/user.api';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import { ROUTES } from '@/constants/routes';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { getAuthSnapshot } from '@/lib/auth/session-store';
import { ApiError } from '@/utils/ApiError';
import {
  notificationListKey,
  notificationUnreadCountKey,
  useNotificationUnreadCount,
  useNotificationsQuery,
} from '@/queries/useNotificationsQuery';
import { NotificationIcon } from './NotificationIcon';
import {
  resolveNotificationAction,
  type NotificationDestination,
} from './resolveAction';

function dateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  const day = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  const currentDay = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(today);
  if (day === currentDay) return '오늘';
  const yesterday = new Date(today.getTime() - 86_400_000);
  if (
    day ===
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(yesterday)
  ) {
    return '어제';
  }
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function timeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

async function checkDestination(destination: NotificationDestination) {
  const id = String(destination.targetId);
  if (destination.type === 'review') {
    await ReviewApi.getReviewDetails(id);
  } else if (destination.type === 'user') {
    await UserApi.getUserInfo({ userId: id });
  } else {
    await InquireApi.getInquireDetails(id);
  }
}

function NotificationRow({
  item,
  onOpen,
  disabled,
}: {
  item: NotificationItem;
  onOpen: (item: NotificationItem) => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      disabled={disabled}
      className="flex w-full gap-10 border-b border-stroke-neutral-basement py-17 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring disabled:opacity-60"
    >
      <NotificationIcon eventAction={item.eventAction} group={item.group} />
      <span className="min-w-0 flex-1">
        <span
          className={`block text-15 leading-21 ${item.isRead ? 'font-medium' : 'font-bold'}`}
        >
          {item.title}
        </span>
        <span className="mt-4 line-clamp-2 block text-13 leading-20 text-fg-neutral-muted">
          {item.content}
        </span>
        <time
          dateTime={item.createAt}
          className="mt-8 block text-12 text-fg-neutral-subtle"
        >
          {timeLabel(item.createAt)}
        </time>
      </span>
      <span
        aria-label={item.isRead ? undefined : '읽지 않음'}
        className={`mt-9 h-6 w-6 shrink-0 rounded-full ${item.isRead ? 'invisible' : 'bg-bg-brand-solid'}`}
      />
    </button>
  );
}

export function NotificationInbox() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuthSession();
  const userId = !isAuthLoading && isLoggedIn ? user?.userId ?? null : null;
  const list = useNotificationsQuery(userId);
  const unread = useNotificationUnreadCount(userId);
  const [message, setMessage] = useState('');
  const items = list.data?.flatMap((page) => page.data.items) ?? [];

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.replace(
        `${ROUTES.LOGIN}?returnTo=${encodeURIComponent(ROUTES.NOTIFICATIONS)}`,
      );
    }
  }, [isAuthLoading, isLoggedIn, router]);

  const markRead = useMutation({
    mutationFn: ({ id }: { id: number; userId: number }) =>
      NotificationInboxApi.markRead(id),
    onSuccess: (result, variables) => {
      const requestUserId = variables.userId;
      queryClient.setQueryData<InfiniteData<ApiResponse<NotificationListData>>>(
        notificationListKey(requestUserId),
        (current) =>
          current && {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                items: page.data.items.map((item) =>
                  item.id === result.notificationId
                    ? { ...item, isRead: result.isRead, readAt: result.readAt }
                    : item,
                ),
              },
            })),
          },
      );
      queryClient.setQueryData(notificationUnreadCountKey(requestUserId), {
        unreadCount: result.unreadCount,
      });
    },
  });

  const markAllRead = useMutation({
    mutationFn: (requestUserId: number) => {
      void requestUserId;
      return NotificationInboxApi.markAllRead();
    },
    onSuccess: (_result, requestUserId) => {
      queryClient.setQueryData<InfiniteData<ApiResponse<NotificationListData>>>(
        notificationListKey(requestUserId),
        (current) =>
          current && {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                items: page.data.items.map((item) => ({
                  ...item,
                  isRead: true,
                })),
              },
            })),
          },
      );
      queryClient.setQueryData(notificationUnreadCountKey(requestUserId), {
        unreadCount: 0,
      });
      void queryClient.invalidateQueries({
        queryKey: notificationUnreadCountKey(requestUserId),
      });
      void queryClient.invalidateQueries({
        queryKey: notificationListKey(requestUserId),
      });
    },
    onError: () =>
      setMessage('모두 읽음 처리에 실패했어요. 다시 시도해 주세요.'),
  });

  const openNotification = async (item: NotificationItem) => {
    if (userId === null || markRead.isPending || markAllRead.isPending) return;
    setMessage('');
    if (!item.isRead) {
      try {
        await markRead.mutateAsync({ id: item.id, userId });
      } catch {
        setMessage('읽음 처리에 실패했어요. 다시 시도해 주세요.');
        return;
      }
    }

    if (getAuthSnapshot().session?.user.userId !== userId) return;

    const destination = resolveNotificationAction(item.action);
    if (!destination) return;

    try {
      await checkDestination(destination);
      if (getAuthSnapshot().session?.user.userId !== userId) return;
      router.push(destination.href);
    } catch (error) {
      setMessage(
        error instanceof ApiError && [403, 404].includes(error.response.status)
          ? '이동할 내용을 찾을 수 없어 알림함에 머물렀어요.'
          : '지금은 내용을 열 수 없어요. 잠시 후 다시 시도해 주세요.',
      );
    }
  };

  let previousDate = '';

  return (
    <div className="content-container min-h-safe-screen bg-bg-layer-default text-fg-neutral">
      <header className="sticky top-0 z-10 bg-bg-layer-default">
        <SubHeader>
          <SubHeader.Left onClick={() => router.back()}>
            <Image
              src="/icon/arrow-left-subcoral.svg"
              alt="뒤로 가기"
              width={23}
              height={23}
            />
          </SubHeader.Left>
          <SubHeader.Center>알림</SubHeader.Center>
          <SubHeader.Right>
            <Link
              href={ROUTES.SETTINGS.NOTIFICATIONS}
              aria-label="알림 수신 설정"
              className="flex h-40 w-40 items-center justify-center text-fg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
            >
              <Settings2 size={23} strokeWidth={1.8} aria-hidden="true" />
            </Link>
          </SubHeader.Right>
        </SubHeader>
      </header>
      <section className="px-20 pb-40 pt-28">
        {isAuthLoading || (userId !== null && list.isLoading) ? (
          <div
            role="status"
            aria-label="알림을 불러오는 중"
            className="space-y-18"
          >
            <SkeletonBase width={160} height={20} />
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex gap-10 py-14">
                <SkeletonBase width={28} height={28} borderRadius="14px" />
                <div className="flex-1 space-y-8">
                  <SkeletonBase width="60%" height={16} />
                  <SkeletonBase width="90%" height={14} />
                </div>
              </div>
            ))}
          </div>
        ) : userId === null ? (
          <p className="py-24 text-14 text-fg-neutral-muted">
            로그인 상태를 확인하고 있어요.
          </p>
        ) : list.error ? (
          <div role="alert" className="py-40 text-center">
            <p className="text-15">알림을 불러오지 못했어요.</p>
            <button
              type="button"
              onClick={() => list.refetch()}
              className="mt-16 text-14 font-bold text-fg-brand underline"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <>
            <div className="mb-26 flex items-end justify-between gap-8">
              <h1 className="text-19 font-bold">
                새 알림{' '}
                <span className="text-fg-brand">
                  {unread.data?.unreadCount ?? 0}
                </span>
                개
              </h1>
              <button
                type="button"
                disabled={
                  markAllRead.isPending ||
                  markRead.isPending ||
                  (!unread.data?.unreadCount &&
                    !items.some((item) => !item.isRead))
                }
                onClick={() => {
                  setMessage('');
                  if (userId !== null) markAllRead.mutate(userId);
                }}
                className="text-13 font-bold text-fg-brand disabled:text-fg-disabled"
              >
                모두 읽음
              </button>
            </div>
            {items.length === 0 ? (
              <p className="py-80 text-center text-15 text-fg-neutral-muted">
                아직 받은 알림이 없어요.
              </p>
            ) : (
              <div>
                {items.map((item) => {
                  const date = dateLabel(item.createAt);
                  const showDate = date !== previousDate;
                  previousDate = date;
                  return (
                    <Fragment key={item.id}>
                      {showDate && (
                        <h2 className="mb-8 mt-26 text-13 font-bold text-fg-neutral-muted first:mt-0">
                          {date}
                        </h2>
                      )}
                      <NotificationRow
                        item={item}
                        onOpen={openNotification}
                        disabled={markRead.isPending || markAllRead.isPending}
                      />
                    </Fragment>
                  );
                })}
                {list.hasNextPage && (
                  <div ref={list.targetRef} className="h-20" />
                )}
                {list.isFetchingNextPage && (
                  <p className="py-20 text-center text-13 text-fg-neutral-muted">
                    알림을 더 불러오는 중이에요.
                  </p>
                )}
              </div>
            )}
          </>
        )}
        {message && (
          <p role="alert" className="mt-16 text-13 text-fg-brand">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}
