import { render, screen, within } from '@testing-library/react';
import type { ReviewTastingProfile } from '@/api/review/types';
import ReviewTastingProfileChart from './ReviewTastingProfileChart';

const savedProfile: ReviewTastingProfile = {
  version: 2,
  maxScore: 10,
  axes: [
    { code: null, name: '바디감', description: '묵직한 질감', score: 7 },
    { code: 'SMOKY', name: '스모키', description: '연기와 이탄', score: 0 },
    { code: 'FRUITY', name: '과일', description: '사과와 배', score: 9 },
    { code: 'FLORAL', name: '꽃/허브', description: null, score: 3 },
  ],
};

describe('API 테이스팅 프로필 조회 그래프', () => {
  it('저장된 축 순서·이름·설명·최대 점수로 읽기 전용 그래프를 보여준다', () => {
    render(<ReviewTastingProfileChart profile={savedProfile} />);

    const chart = screen.getByRole('img', { name: /테이스팅 프로필/ });
    expect(
      within(chart)
        .getAllByTestId('tasting-axis-label')
        .map((node) => node.textContent),
    ).toEqual(['바디감', '스모키', '과일', '꽃/허브']);
    expect(chart).toHaveAccessibleName(
      /바디감.*7\/10.*묵직한 질감.*스모키.*0\/10.*연기와 이탄.*과일.*9\/10/,
    );
    expect(within(chart).getByTestId('tasting-value-polygon')).toHaveAttribute(
      'points',
      expect.not.stringContaining('NaN'),
    );
  });

  it('미기록과 잘못된 척도는 그리지 않고, 부분 입력의 0점은 보존한다', () => {
    const { rerender } = render(<ReviewTastingProfileChart profile={null} />);
    expect(
      screen.queryByRole('img', { name: /테이스팅 프로필/ }),
    ).not.toBeInTheDocument();

    rerender(<ReviewTastingProfileChart profile={savedProfile} />);
    expect(
      screen.getByRole('img', { name: /스모키.*0\/10/ }),
    ).toBeInTheDocument();

    rerender(
      <ReviewTastingProfileChart profile={{ ...savedProfile, maxScore: 0 }} />,
    );
    expect(
      screen.queryByRole('img', { name: /테이스팅 프로필/ }),
    ).not.toBeInTheDocument();
  });
});
