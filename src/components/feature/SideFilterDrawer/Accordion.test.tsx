import { fireEvent, render, screen } from '@testing-library/react';
import { Accordion } from './Accordion';

describe('SideFilterDrawer Accordion', () => {
  it('필터 표면과 선택 상태에 시맨틱 색상 토큰을 사용한다', () => {
    render(
      <Accordion title="지역">
        <Accordion.Grid>
          <Accordion.Content
            title="전체"
            value="all"
            isSelected
            onClick={jest.fn()}
          />
          <Accordion.Content
            title="한국"
            value="kr"
            isSelected={false}
            onClick={jest.fn()}
          />
        </Accordion.Grid>
      </Accordion>,
    );

    expect(screen.getByRole('button', { name: '전체' })).toHaveClass(
      'text-11',
      'bg-bg-brand-solid',
      'text-fg-brand-contrast',
    );
    expect(screen.getByRole('button', { name: '한국' })).toHaveClass(
      'text-11',
      'bg-bg-layer-default',
      'text-fg-neutral-muted',
    );
  });

  it('헤더 버튼으로 필터 내용을 접고 펼친다', () => {
    render(
      <Accordion title="지역">
        <span>필터 내용</span>
      </Accordion>,
    );

    const toggleButton = screen.getByRole('button', {
      name: '지역 필터 접기',
    });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(toggleButton);

    expect(
      screen.getByRole('button', { name: '지역 필터 펼치기' }),
    ).toHaveAttribute('aria-expanded', 'false');
  });
});
