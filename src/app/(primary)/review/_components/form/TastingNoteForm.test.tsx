import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import type { ReviewTastingProfile } from '@/api/review/types';
import type { FormValues } from '@/types/Review';
import TastingNoteForm from './TastingNoteForm';

jest.mock('@/utils/flutterUtil', () => ({ handleWebViewMessage: jest.fn() }));

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
  onSubmit,
}: {
  tastingProfile: ReviewTastingProfile | null;
  onSubmit: (values: FormValues) => void;
}) {
  const methods = useForm<FormValues>({ defaultValues: { tastingProfile } });
  return (
    <FormProvider {...methods}>
      <TastingNoteForm />
      <button type="button" onClick={methods.handleSubmit(onSubmit)}>
        리뷰 수정
      </button>
    </FormProvider>
  );
}

const renderForm = (tastingProfile: ReviewTastingProfile | null) => {
  const onSubmit = jest.fn();
  render(
    <ReviewFormHarness tastingProfile={tastingProfile} onSubmit={onSubmit} />,
  );
  return onSubmit;
};

const submittedProfile = async (onSubmit: jest.Mock) => {
  fireEvent.click(screen.getByRole('button', { name: '리뷰 수정' }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  return onSubmit.mock.calls[0][0].tastingProfile;
};

describe('리뷰 테이스팅 노트 입력', () => {
  it('저장된 사용자 정의 프로필을 그대로 열어 점수만 수정한다', async () => {
    const onSubmit = renderForm(savedProfile);

    expect(screen.getByText('커스텀 · 3개 항목 · 10점')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

    const vanilla = await screen.findByRole('slider', { name: '바닐라' });
    expect(vanilla).toHaveAttribute('max', '10');
    expect(screen.getAllByRole('slider')).toHaveLength(3);

    fireEvent.change(vanilla, { target: { value: '6' } });
    expect(screen.getByText('원래 4')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '완료' }));
    await waitFor(() =>
      expect(screen.queryByRole('slider')).not.toBeInTheDocument(),
    );

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
});
