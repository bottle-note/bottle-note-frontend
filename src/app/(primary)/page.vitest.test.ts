import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/feature/home/HomeCarousel', () => ({
  default: () => null,
}));

describe('홈 페이지 렌더링 시점', () => {
  it('빌드 때 미리 만들지 않고 요청 시 렌더링한다 (CI 빌드에서는 내부 API에 접근할 수 없음)', async () => {
    const page = await import('./page');

    expect(page.dynamic).toBe('force-dynamic');
  });
});
