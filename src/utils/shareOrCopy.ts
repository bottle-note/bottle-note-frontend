/* eslint-disable @typescript-eslint/no-shadow */
import { ParcialModalState } from '@/store/modalStore';

/* eslint-disable @typescript-eslint/no-use-before-define */
export function shareOrCopy(
  url: string,
  handleModalState: (state: ParcialModalState) => void,
  title?: string,
  text?: string,
) {
  if (isMobileEnvironment()) {
    shareOnMobile(url, title, text);
  } else {
    copyUrlToClipboard(url);
  }

  function isMobileEnvironment() {
    // 모바일 환경 확인 로직
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }

  async function shareOnMobile(url: string, title?: string, text?: string) {
    if (navigator.share) {
      await navigator
        .share({
          title: title ?? '공유',
          text: text ?? '공유하기',
          url,
        })
        .then(() => {
          handleModalState({
            isShowModal: true,
            mainText: '공유되었습니다.',
            subText: '',
          });
        })
        .catch((error) => console.log('공유 실패', error));
    } else {
      handleModalState({
        isShowModal: true,
        mainText: '공유 기능을 지원하지 않는 모바일 환경입니다.',
        subText: '',
      });
    }
  }

  async function copyUrlToClipboard(url: string) {
    await navigator.clipboard
      .writeText(url)
      .then(() => {
        handleModalState({
          isShowModal: true,
          mainText: '해당 페이지 링크를 복사했습니다.',
          subText: '친구에게 공유하러 가볼까요?',
        });
      })
      .catch((error) => {
        handleModalState({
          isShowModal: true,
          mainText: 'URL 복사를 실패했습니다.',
          subText: '',
        });
        console.error('URL 복사 실패', error);
      });
  }
}
