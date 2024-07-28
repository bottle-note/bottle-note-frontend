/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-use-before-define */
export function shareOrCopy(
  url: string,
  handleModal?: () => void,
  title?: string,
  text?: string,
) {
  if (isMobileEnvironment()) {
    shareOnMobile(url, title, text);
  } else {
    copyUrlToClipboard(url, handleModal);
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
        .then(() => alert('공유 성공'))
        .catch((error) => console.log('공유 실패', error));
    } else {
      console.log('공유 기능을 지원하지 않는 모바일 환경입니다.');
    }
  }

  async function copyUrlToClipboard(url: string, handleModal?: () => void) {
    await navigator.clipboard
      .writeText(url)
      .then(() => {
        handleModal && handleModal();
      })
      .catch((error) => console.log('URL 복사 실패', error));
  }
}
