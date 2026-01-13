import { transformServiceInquireList } from './transformers';
import type { ServiceInquireListRaw } from './types';

describe('transformServiceInquireList', () => {
  it('서비스 문의 목록을 표준 형식으로 변환한다', () => {
    // Given
    const raw: ServiceInquireListRaw = {
      helpList: [
        {
          helpId: 1,
          title: '문의 제목 1',
          content: '문의 내용 1',
          createAt: '2024-01-15T10:00:00',
          helpStatus: 'WAITING',
        },
        {
          helpId: 2,
          title: '문의 제목 2',
          content: '문의 내용 2',
          createAt: '2024-01-14T10:00:00',
          helpStatus: 'SUCCESS',
        },
      ],
      totalCount: 2,
    };

    // When
    const result = transformServiceInquireList(raw);

    // Then
    expect(result.items).toHaveLength(2);
    expect(result.totalCount).toBe(2);
    expect(result.items[0]).toEqual({
      id: 1,
      title: '문의 제목 1',
      content: '문의 내용 1',
      createAt: '2024-01-15T10:00:00',
      status: 'WAITING',
    });
    expect(result.items[1]).toEqual({
      id: 2,
      title: '문의 제목 2',
      content: '문의 내용 2',
      createAt: '2024-01-14T10:00:00',
      status: 'SUCCESS',
    });
  });

  it('빈 목록을 올바르게 처리한다', () => {
    // Given
    const raw: ServiceInquireListRaw = {
      helpList: [],
      totalCount: 0,
    };

    // When
    const result = transformServiceInquireList(raw);

    // Then
    expect(result.items).toHaveLength(0);
    expect(result.totalCount).toBe(0);
  });
});
