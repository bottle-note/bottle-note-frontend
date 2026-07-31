import { render, screen } from '@testing-library/react';
import PrimaryLinkButton from './PrimaryLinkButton';

describe('PrimaryLinkButton', () => {
  it('Half 카드는 기존 라이트 포인트 컬러를 유지한다', () => {
    render(
      <PrimaryLinkButton
        data={{
          listType: 'Half',
          korName: '싱글몰트',
          engName: 'Single malt',
          linkSrc: '/explore',
        }}
      />,
    );

    const card = screen.getByRole('link', { name: /싱글몰트/ }).parentElement;

    expect(card).toHaveClass('bg-bg-brand-primary-solid');
    expect(
      screen.getByText('싱글몰트').closest('.text-fg-brand-contrast'),
    ).not.toBeNull();
  });

  it('Full 버튼은 단단한 브랜드 배경과 대비 텍스트를 유지한다', () => {
    render(
      <PrimaryLinkButton
        data={{
          korName: '활동 히스토리',
          engName: 'HISTORY',
          linkSrc: '/history',
        }}
      />,
    );

    expect(
      screen.getByText('활동 히스토리').parentElement?.parentElement,
    ).toHaveClass('text-fg-brand-contrast');
    expect(
      screen.getByRole('link', { name: /활동 히스토리/ }).parentElement,
    ).toHaveClass('flex');
  });
});
