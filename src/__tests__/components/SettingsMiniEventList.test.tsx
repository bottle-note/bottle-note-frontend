import { render, screen } from '@testing-library/react';
import { SettingsMiniEventList } from '@/app/(primary)/settings/_components/SettingsMiniEventList';

describe('SettingsMiniEventList', () => {
  it('활성 이벤트만 4열 그리드에 렌더링하고 이름은 6자 초과 시 말줄임한다', () => {
    render(
      <SettingsMiniEventList
        events={[
          {
            id: 'active-event',
            name: '1234567',
            thumbnailUrl: '/images/tarot/card-back.png',
            targetUrl: '/active-event',
            isActive: true,
          },
          {
            id: 'inactive-event',
            name: '비활성 이벤트',
            thumbnailUrl: '/images/tarot/card-back.png',
            targetUrl: '/inactive-event',
            isActive: false,
          },
        ]}
      />,
    );

    expect(screen.getByRole('list')).toHaveClass('grid-cols-4');
    expect(screen.getByRole('link', { name: '1234567' })).toHaveAttribute(
      'href',
      '/active-event',
    );
    expect(screen.getByText('123456...')).toBeInTheDocument();
    expect(screen.queryByText('비활성 이벤트')).not.toBeInTheDocument();
  });
});
