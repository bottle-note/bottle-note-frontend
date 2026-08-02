import { fireEvent, render, screen } from '@testing-library/react';
import { AgreementScreen } from './AgreementScreen';

describe('AgreementScreen', () => {
  it('개인정보 처리방침은 보기 링크만 표시하고, 필수·선택 동의 항목을 구분한다', () => {
    render(<AgreementScreen />);

    expect(screen.getByText('개인정보 처리방침')).toBeInTheDocument();
    expect(screen.getAllByText('내용 보기')).toHaveLength(4);
    expect(screen.getByLabelText('전체 동의')).not.toBeChecked();
    expect(screen.getByLabelText('[필수] 이용약관 동의')).not.toBeChecked();
    expect(
      screen.getByLabelText('[필수] 개인정보 수집·이용 동의'),
    ).not.toBeChecked();
    expect(
      screen.getByLabelText('[선택] 마케팅 정보 수신 동의'),
    ).not.toBeChecked();
    expect(
      screen.queryByText(
        '마케팅 정보 수신 동의는 선택 사항이며, 동의하지 않아도 기본 서비스 이용에는 제한이 없습니다.',
      ),
    ).not.toBeInTheDocument();
  });

  it('각 약관 링크를 제공한다', () => {
    render(<AgreementScreen />);

    const links = screen.getAllByRole('link', { name: '내용 보기' });
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/privacy-policy',
      '/terms',
      '/privacy-collection-use',
      '/marketing-consent',
    ]);
  });

  it('필수 동의 두 개를 선택해야 시작 버튼이 활성화된다', () => {
    render(<AgreementScreen />);

    const submitButton = screen.getByRole('button', {
      name: '동의하고 시작하기',
    });
    fireEvent.click(screen.getByLabelText('[필수] 이용약관 동의'));

    expect(submitButton).toBeDisabled();

    fireEvent.click(screen.getByLabelText('[필수] 개인정보 수집·이용 동의'));

    expect(submitButton).toBeEnabled();
  });

  it('전체 동의는 모든 항목을 함께 선택하고 해제한다', () => {
    render(<AgreementScreen />);

    const allAgreement = screen.getByLabelText('전체 동의');
    const submitButton = screen.getByRole('button', {
      name: '동의하고 시작하기',
    });

    fireEvent.click(allAgreement);

    expect(allAgreement).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /이용약관 동의/ }),
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /개인정보 수집·이용 동의/ }),
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /마케팅 정보 수신 동의/ }),
    ).toBeChecked();
    expect(submitButton).toBeEnabled();

    fireEvent.click(allAgreement);

    expect(allAgreement).not.toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /이용약관 동의/ }),
    ).not.toBeChecked();
    expect(submitButton).toBeDisabled();
  });

  it('마케팅 동의는 선택하지 않아도 시작할 수 있고, 화면 검토용 안내를 표시한다', () => {
    render(<AgreementScreen />);

    fireEvent.click(screen.getByLabelText('[필수] 이용약관 동의'));
    fireEvent.click(screen.getByLabelText('[필수] 개인정보 수집·이용 동의'));
    fireEvent.click(screen.getByRole('button', { name: '동의하고 시작하기' }));

    expect(screen.getByRole('status')).toHaveTextContent(
      '실제 동의 기록은 API 연동 단계에서 저장됩니다.',
    );
  });
});
