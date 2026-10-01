import { StrictMode, useState } from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ImageUploader from './ImageUploader';

vi.mock('@/hooks/useWebViewInit', () => ({
  useWebViewInit: () => ({ isMobile: false }),
}));
vi.mock('next/image', () => ({
  default: ({ quality, priority, ...props }: any) => <img {...props} />,
}));

const saved = [{ order: 1, viewUrl: '/existing-review.webp' }];
function Harness() {
  const methods = useForm({
    defaultValues: {
      imageUrlList: saved,
      images: [] as { order: number; image: File }[],
    },
  });
  const [visible, setVisible] = useState(true);
  const [submitted, setSubmitted] = useState('');
  return (
    <FormProvider {...methods}>
      {visible && <ImageUploader />}
      <button onClick={() => setVisible((value) => !value)}>
        사진 영역 토글
      </button>
      <button onClick={() => methods.reset({ imageUrlList: [], images: [] })}>
        새 리뷰
      </button>
      <button
        onClick={methods.handleSubmit((values) =>
          setSubmitted(
            JSON.stringify({
              saved: values.imageUrlList,
              files: values.images.map(({ order, image }) => ({
                order,
                name: image.name,
              })),
            }),
          ),
        )}
      >
        입력 확인
      </button>
      <output aria-label="제출 내용">{submitted}</output>
    </FormProvider>
  );
}

beforeEach(() => {
  let next = 0;
  URL.createObjectURL = vi.fn(() => `blob:upload-${++next}`);
  URL.revokeObjectURL = vi.fn();
});
afterEach(cleanup);

describe('공용 사진 선택', () => {
  it('기존 사진과 새 사진의 합계 5장을 지키고 삭제 후 순서를 유지한다', async () => {
    const { container } = render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    );
    const files = Array.from(
      { length: 6 },
      (_, index) =>
        new File(['photo'], `image-${index}.webp`, { type: 'image/webp' }),
    );
    fireEvent.change(container.querySelector('input[type=file]')!, {
      target: { files },
    });
    await waitFor(() =>
      expect(screen.getAllByRole('img', { name: /첨부 사진/ })).toHaveLength(5),
    );
    fireEvent.click(screen.getByRole('button', { name: '첨부 사진 1 삭제' }));
    fireEvent.click(screen.getByRole('button', { name: '첨부 사진 2 삭제' }));
    fireEvent.click(screen.getByRole('button', { name: '입력 확인' }));
    await waitFor(() =>
      expect(screen.getByLabelText('제출 내용')).toHaveTextContent(
        'image-0.webp',
      ),
    );
    const result = JSON.parse(screen.getByLabelText('제출 내용').textContent!);
    expect(result).toEqual({
      saved: [],
      files: [
        { order: 1, name: 'image-0.webp' },
        { order: 2, name: 'image-2.webp' },
        { order: 3, name: 'image-3.webp' },
      ],
    });
  });

  it('화면 재진입 시 선택한 사진을 복원하고 새 리뷰에서는 비운다', async () => {
    const { container, unmount } = render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    );
    fireEvent.change(container.querySelector('input[type=file]')!, {
      target: {
        files: [new File(['photo'], 'new.webp', { type: 'image/webp' })],
      },
    });
    await waitFor(() =>
      expect(screen.getAllByRole('img', { name: /첨부 사진/ })).toHaveLength(2),
    );
    fireEvent.click(screen.getByRole('button', { name: '사진 영역 토글' }));
    expect(screen.queryAllByRole('img', { name: /첨부 사진/ })).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: '사진 영역 토글' }));
    await waitFor(() =>
      expect(screen.getAllByRole('img', { name: /첨부 사진/ })).toHaveLength(2),
    );
    fireEvent.click(screen.getByRole('button', { name: '새 리뷰' }));
    await waitFor(() =>
      expect(screen.queryAllByRole('img', { name: /첨부 사진/ })).toHaveLength(
        0,
      ),
    );
    unmount();
    const created = vi
      .mocked(URL.createObjectURL)
      .mock.results.map((result) => result.value);
    expect(
      created.every((url) =>
        vi
          .mocked(URL.revokeObjectURL)
          .mock.calls.some(([revoked]) => revoked === url),
      ),
    ).toBe(true);
  });
});
