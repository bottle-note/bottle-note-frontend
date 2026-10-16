import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MotionGlobalConfig } from 'framer-motion';
import { FormProvider, useForm } from 'react-hook-form';
import type { ReviewTastingProfile } from '@/api/review/types';
import type { FormValues } from '@/types/Review';
import TastingNoteForm from './TastingNoteForm';

jest.mock('@/utils/flutterUtil', () => ({ handleWebViewMessage: jest.fn() }));
// vaul Drawer는 jsdom에서 닫힘 전환이 끝나지 않아 시트가 남는다. 열림·닫힘만 재현한다.
jest.mock('@/components/ui/Modal/BottomSheet', () => ({
  __esModule: true,
  default: ({
    isOpen,
    children,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
  }) => (isOpen ? <div role="dialog">{children}</div> : null),
}));

const savedProfile: ReviewTastingProfile = {
  version: 1,
  maxScore: 10,
  axes: [
    { code: null, name: '스모키', description: '연기 · 이탄 · 숯', score: 7 },
    { code: null, name: '바닐라', description: '바닐라빈 · 크림', score: 4 },
    { code: null, name: '바디감', description: '가벼움 ↔ 묵직함', score: 8 },
  ],
};

function ReviewFormHarness({
  tastingProfile,
  flavorTags,
  onSubmit,
}: {
  tastingProfile: ReviewTastingProfile | null;
  flavorTags: string[];
  onSubmit: (values: FormValues) => void;
}) {
  const methods = useForm<FormValues>({
    defaultValues: { tastingProfile, flavor_tags: flavorTags },
  });
  return (
    <FormProvider {...methods}>
      <TastingNoteForm alcoholTastingTags={['셰리', '과일', '오크']} />
      <button type="button" onClick={methods.handleSubmit(onSubmit)}>
        리뷰 수정
      </button>
    </FormProvider>
  );
}

const renderForm = (
  tastingProfile: ReviewTastingProfile | null,
  flavorTags: string[] = [],
) => {
  const onSubmit = jest.fn();
  render(
    <ReviewFormHarness
      tastingProfile={tastingProfile}
      flavorTags={flavorTags}
      onSubmit={onSubmit}
    />,
  );
  return onSubmit;
};

const completeModal = async () => {
  fireEvent.click(screen.getByRole('button', { name: '완료' }));
  await waitFor(() =>
    expect(screen.queryByRole('slider')).not.toBeInTheDocument(),
  );
};

const submittedProfile = async (onSubmit: jest.Mock) => {
  fireEvent.click(screen.getByRole('button', { name: '리뷰 수정' }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  return onSubmit.mock.calls[0][0].tastingProfile;
};

describe('리뷰 테이스팅 노트 입력', () => {
  // 모달 닫힘 spring 애니메이션이 느린 CI에서 waitFor 기본 대기(1초)를 넘겨 실패하지 않도록 건너뛴다.
  beforeAll(() => {
    MotionGlobalConfig.skipAnimations = true;
  });
  afterAll(() => {
    MotionGlobalConfig.skipAnimations = false;
  });

  it('저장된 사용자 정의 프로필을 그대로 열어 점수만 수정한다', async () => {
    const onSubmit = renderForm(savedProfile);

    expect(screen.getByText('커스텀 · 3개 항목 · 10점')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

    const vanilla = await screen.findByRole('slider', { name: '바닐라' });
    expect(vanilla).toHaveAttribute('max', '10');
    expect(screen.getAllByRole('slider')).toHaveLength(3);

    fireEvent.change(vanilla, { target: { value: '6' } });
    expect(screen.getByText('원래 4')).toBeInTheDocument();

    await completeModal();

    expect(await submittedProfile(onSubmit)).toEqual({
      ...savedProfile,
      axes: savedProfile.axes.map((axis) =>
        axis.name === '바닐라' ? { ...axis, score: 6 } : axis,
      ),
    });
  });

  it('수정 중 뒤로 가면 확인 후 원래 기록을 유지한다', async () => {
    const onSubmit = renderForm(savedProfile);

    fireEvent.click(screen.getByRole('button', { name: '수정하기' }));
    fireEvent.change(await screen.findByRole('slider', { name: '스모키' }), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: '뒤로 가기' }));

    fireEvent.click(await screen.findByRole('button', { name: '버리기' }));
    await waitFor(() =>
      expect(screen.queryByRole('slider')).not.toBeInTheDocument(),
    );

    expect(await submittedProfile(onSubmit)).toEqual(savedProfile);
  });

  it('새 리뷰는 기본 6항목으로 기록한다', async () => {
    const onSubmit = renderForm(null);

    fireEvent.click(
      screen.getByRole('button', { name: /그래프로 풍미 기록하기/ }),
    );
    expect(await screen.findAllByRole('slider')).toHaveLength(6);
    fireEvent.change(screen.getByRole('slider', { name: '달콤함' }), {
      target: { value: '4' },
    });
    fireEvent.click(screen.getByRole('button', { name: '완료' }));
    await waitFor(() =>
      expect(screen.queryByRole('slider')).not.toBeInTheDocument(),
    );

    const profile = await submittedProfile(onSubmit);
    expect(profile.maxScore).toBe(5);
    expect(
      profile.axes.find((axis: { code: string }) => axis.code === 'SWEET'),
    ).toMatchObject({ name: '달콤함', score: 4 });
  });

  it('기본 항목을 지우고 추천 태그로 새 항목을 추가해 점수를 기록한다', async () => {
    const onSubmit = renderForm(null, ['건자두']);

    fireEvent.click(
      screen.getByRole('button', { name: /그래프로 풍미 기록하기/ }),
    );
    fireEvent.click(await screen.findByRole('button', { name: '항목 편집' }));

    fireEvent.click(
      await screen.findByRole('button', { name: '꽃/허브 삭제' }),
    );
    expect(screen.getByText('꽃/허브 삭제됨')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /항목 추가/ }));
    // 이 리뷰의 태그가 먼저, 기존 항목과 같은 '과일'은 빠진다.
    const chips = screen
      .getAllByRole('button')
      .map((button) => button.textContent)
      .filter((text) =>
        ['건자두', '셰리', '과일', '오크'].includes(text ?? ''),
      );
    expect(chips).toEqual(['건자두', '셰리', '오크']);
    fireEvent.click(screen.getByRole('button', { name: '셰리' }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: '완료' }),
    );

    const sherry = await screen.findByRole('slider', { name: '셰리' });
    fireEvent.change(sherry, { target: { value: '3' } });
    fireEvent.change(screen.getByRole('slider', { name: '스모키' }), {
      target: { value: '2' },
    });
    await completeModal();

    expect(
      screen.getByText('커스텀 · 6개 항목', { exact: false }),
    ).toBeInTheDocument();
    const profile = await submittedProfile(onSubmit);
    expect(profile.axes.map((axis: { name: string }) => axis.name)).toEqual([
      '스모키',
      '과일',
      '달콤함',
      '향신료',
      '바디감',
      '셰리',
    ]);
    expect(profile.axes[5]).toEqual({
      code: null,
      name: '셰리',
      description: null,
      score: 3,
    });
  });

  it('항목이 3개면 삭제할 수 없고 같은 이름은 완료할 수 없다', async () => {
    renderForm(savedProfile);

    fireEvent.click(screen.getByRole('button', { name: '수정하기' }));
    fireEvent.click(await screen.findByRole('button', { name: '항목 편집' }));

    const sheet = await screen.findByRole('dialog');
    expect(
      within(sheet).getByRole('button', { name: '바닐라 삭제' }),
    ).toBeDisabled();
    expect(within(sheet).getByText('3개 이상 필요해요.')).toBeInTheDocument();

    fireEvent.click(within(sheet).getByRole('button', { name: /항목 추가/ }));
    fireEvent.change(
      within(sheet).getByRole('textbox', { name: '항목 4 이름' }),
      {
        target: { value: '스모키' },
      },
    );
    expect(
      within(sheet).getByText('이미 있는 이름이에요.'),
    ).toBeInTheDocument();
    expect(within(sheet).getByRole('button', { name: '완료' })).toBeDisabled();
  });

  it('기본 6항목으로 되돌리면 확인 후 기본 구성으로 바뀐다', async () => {
    const onSubmit = renderForm(savedProfile);

    fireEvent.click(screen.getByRole('button', { name: '수정하기' }));
    fireEvent.click(await screen.findByRole('button', { name: '항목 편집' }));
    fireEvent.click(
      await screen.findByRole('button', { name: '기본 6항목으로 되돌리기' }),
    );
    expect(
      screen.getByText('스모키 7 · 바닐라 4 · 바디감 8 기록이 지워져요.'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '되돌리기' }));

    expect(await screen.findAllByRole('slider')).toHaveLength(6);
    fireEvent.change(screen.getByRole('slider', { name: '바디감' }), {
      target: { value: '4' },
    });
    await completeModal();

    const profile = await submittedProfile(onSubmit);
    expect(profile.maxScore).toBe(5);
    expect(profile.axes).toHaveLength(6);
  });
});
