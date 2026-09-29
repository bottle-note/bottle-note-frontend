/** 서버의 스트림·티켓 계약이 공개되면 이 전송 경계만 구현한다. */
export interface NotificationStreamHandlers {
  onConnected: () => void;
  onNotification: () => void;
}

export function subscribeToNotificationEvents(
  _handlers: NotificationStreamHandlers,
): () => void {
  void _handlers;
  return () => {};
}
