import { render } from '@testing-library/react';
import HomeCarousel from '@/components/feature/home/HomeCarousel';
import type { Banner } from '@/api/banner/types';

jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [jest.fn(), null],
}));

jest.mock('embla-carousel-autoplay', () => ({
  __esModule: true,
  default: () => ({}),
}));

const createBanner = (overrides: Partial<Banner> = {}): Banner => ({
  id: 1,
  name: 'Test Banner',
  nameFontColor: '#000000',
  descriptionA: '',
  descriptionB: '',
  descriptionFontColor: '#000000',
  imageUrl: 'https://cdn.example.com/video.mp4',
  textPosition: 'CENTER',
  targetUrl: '/test',
  isExternalUrl: false,
  mediaType: 'VIDEO',
  bannerType: 'AD',
  sortOrder: 1,
  startDate: null,
  endDate: null,
  ...overrides,
});

describe('HomeCarousel - 비디오 배너 poster', () => {
  it('VIDEO 타입 배너에 poster 속성이 설정된다', () => {
    const banner = createBanner({ mediaType: 'VIDEO' });
    const { container } = render(<HomeCarousel banners={[banner]} />);

    const video = container.querySelector('video');
    expect(video).not.toBeNull();
    expect(video).toHaveAttribute('poster', '/images/banner-placeholder.webp');
  });

  it('IMAGE 타입 배너에는 video 요소가 렌더링되지 않는다', () => {
    const banner = createBanner({
      mediaType: 'IMAGE',
      imageUrl: 'https://cdn.example.com/image.webp',
    });
    const { container } = render(<HomeCarousel banners={[banner]} />);

    const video = container.querySelector('video');
    expect(video).toBeNull();

    const img = container.querySelector('img');
    expect(img).not.toBeNull();
  });

  it('첫 번째 VIDEO 배너는 preload="auto"로 설정된다', () => {
    const banners = [
      createBanner({ id: 1, mediaType: 'VIDEO' }),
      createBanner({ id: 2, mediaType: 'VIDEO' }),
    ];
    const { container } = render(<HomeCarousel banners={banners} />);

    const videos = container.querySelectorAll('video');
    expect(videos[0]).toHaveAttribute('preload', 'auto');
    expect(videos[1]).toHaveAttribute('preload', 'none');
  });

  it('VIDEO 배너의 video 요소에 autoPlay, muted, loop, playsInline 속성이 있다', () => {
    const banner = createBanner({ mediaType: 'VIDEO' });
    const { container } = render(<HomeCarousel banners={[banner]} />);

    const video = container.querySelector('video');
    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('playsinline');
    // muted와 loop는 boolean attribute로 존재 확인
    expect(video?.muted).toBe(true);
    expect(video?.loop).toBe(true);
  });

  it('SSR 초기 렌더 시 skeleton(로딩 placeholder)이 표시된다', () => {
    const banner = createBanner({ mediaType: 'VIDEO' });
    const { container } = render(<HomeCarousel banners={[banner]} />);

    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).not.toBeNull();
    expect(skeleton).toHaveClass('bg-gray-200');
  });

  it('빈 배너 배열이면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<HomeCarousel banners={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('poster 경로가 올바른 정적 파일을 가리킨다', () => {
    const banner = createBanner({ mediaType: 'VIDEO' });
    const { container } = render(<HomeCarousel banners={[banner]} />);

    const video = container.querySelector('video');
    const posterUrl = video?.getAttribute('poster');

    // public/ 하위의 정적 파일 경로여야 한다
    expect(posterUrl).toBe('/images/banner-placeholder.webp');
    expect(posterUrl).toMatch(/\.webp$/);
  });
});
