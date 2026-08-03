import { act, fireEvent, render } from '@testing-library/react';
import HomeCarousel from '@/components/feature/home/HomeCarousel';
import type { Banner } from '@/api/banner/types';

interface MockCarouselApi {
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
  selectedScrollSnap: () => number;
  scrollPrev: () => void;
  scrollNext: () => void;
  on: (
    event: string,
    handler: (api: MockCarouselApi) => void,
  ) => MockCarouselApi;
  off: (
    event: string,
    handler: (api: MockCarouselApi) => void,
  ) => MockCarouselApi;
}

let mockSelectedIndex = 0;
const mockSelectHandlers = new Set<(api: MockCarouselApi) => void>();
const mockCarouselApi: MockCarouselApi = {
  canScrollPrev: jest.fn(() => true),
  canScrollNext: jest.fn(() => true),
  selectedScrollSnap: jest.fn(() => mockSelectedIndex),
  scrollPrev: jest.fn(),
  scrollNext: jest.fn(),
  on: jest.fn((event: string, handler: (api: MockCarouselApi) => void) => {
    if (event === 'select') {
      mockSelectHandlers.add(handler);
    }
    return mockCarouselApi;
  }),
  off: jest.fn((event: string, handler: (api: MockCarouselApi) => void) => {
    if (event === 'select') {
      mockSelectHandlers.delete(handler);
    }
    return mockCarouselApi;
  }),
};

jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [jest.fn(), mockCarouselApi],
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
  posterUrl: null,
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

const selectSlide = (index: number) => {
  mockSelectedIndex = index;
  act(() => {
    mockSelectHandlers.forEach((handler) => handler(mockCarouselApi));
  });
};

describe('HomeCarousel - 비디오 배너 poster 및 지연 로딩', () => {
  beforeEach(() => {
    mockSelectedIndex = 0;
    mockSelectHandlers.clear();
    jest.clearAllMocks();
  });

  it('VIDEO 배너에 API posterUrl을 적용한다', () => {
    const banner = createBanner({
      posterUrl: 'https://cdn.example.com/poster.webp',
    });
    const { container } = render(<HomeCarousel banners={[banner]} />);

    expect(container.querySelector('video')).toHaveAttribute(
      'poster',
      banner.posterUrl,
    );
  });

  it('hydration 전에 첫 영상이 준비됐으면 poster를 제거한다', () => {
    const readyStateSpy = jest
      .spyOn(HTMLMediaElement.prototype, 'readyState', 'get')
      .mockReturnValue(HTMLMediaElement.HAVE_CURRENT_DATA);
    const { container } = render(
      <HomeCarousel
        banners={[
          createBanner({
            posterUrl: 'https://cdn.example.com/poster.webp',
          }),
        ]}
      />,
    );

    expect(container.querySelector('img[aria-hidden="true"]')).toBeNull();
    readyStateSpy.mockRestore();
  });

  it('posterUrl이 없으면 공통 placeholder를 사용한다', () => {
    const { container } = render(
      <HomeCarousel banners={[createBanner({ posterUrl: null })]} />,
    );

    expect(container.querySelector('video')).toHaveAttribute(
      'poster',
      '/images/banner-placeholder.webp',
    );
  });

  it('poster 이미지 로드 실패 시 공통 placeholder로 교체한다', () => {
    const { container } = render(
      <HomeCarousel
        banners={[
          createBanner({
            posterUrl: 'https://cdn.example.com/broken-poster.webp',
          }),
        ]}
      />,
    );

    const posterImage = container.querySelector('img[aria-hidden="true"]');
    fireEvent.error(posterImage!);

    expect(container.querySelector('video')).toHaveAttribute(
      'poster',
      '/images/banner-placeholder.webp',
    );
  });

  it('최초 선택된 VIDEO 배너만 src와 autoplay를 활성화한다', () => {
    const banners = [
      createBanner({
        id: 1,
        imageUrl: 'https://cdn.example.com/first.mp4',
      }),
      createBanner({
        id: 2,
        imageUrl: 'https://cdn.example.com/second.mp4',
      }),
    ];
    const { container } = render(<HomeCarousel banners={banners} />);

    const videos = container.querySelectorAll('video');
    expect(videos[0]).toHaveAttribute('src', banners[0].imageUrl);
    expect(videos[0]).toHaveAttribute('autoplay');
    expect(videos[0]).toHaveAttribute('preload', 'auto');
    expect(videos[1]).not.toHaveAttribute('src');
    expect(videos[1]).not.toHaveAttribute('autoplay');
    expect(videos[1]).toHaveAttribute('preload', 'none');
  });

  it('슬라이드 이동 시 새로 선택된 VIDEO 배너만 활성화한다', () => {
    const banners = [
      createBanner({
        id: 1,
        imageUrl: 'https://cdn.example.com/first.mp4',
      }),
      createBanner({
        id: 2,
        imageUrl: 'https://cdn.example.com/second.mp4',
      }),
    ];
    const { container } = render(<HomeCarousel banners={banners} />);

    selectSlide(1);

    const videos = container.querySelectorAll('video');
    expect(videos[0]).not.toHaveAttribute('src');
    expect(videos[0]).not.toHaveAttribute('autoplay');
    expect(videos[1]).toHaveAttribute('src', banners[1].imageUrl);
    expect(videos[1]).toHaveAttribute('autoplay');
  });

  it('IMAGE 배너에는 video 요소가 렌더링되지 않는다', () => {
    const banner = createBanner({
      mediaType: 'IMAGE',
      imageUrl: 'https://cdn.example.com/image.webp',
    });
    const { container } = render(<HomeCarousel banners={[banner]} />);

    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('VIDEO 배너에 muted, loop, playsInline 속성을 유지한다', () => {
    const { container } = render(<HomeCarousel banners={[createBanner()]} />);

    const video = container.querySelector('video');
    expect(video).toHaveAttribute('playsinline');
    expect(video?.muted).toBe(true);
    expect(video?.loop).toBe(true);
  });

  it('빈 배너 배열이면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<HomeCarousel banners={[]} />);

    expect(container.innerHTML).toBe('');
  });
});
