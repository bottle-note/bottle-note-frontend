import { describe, expect, it } from 'vitest';
import { toDescriptionParagraphs, toSentences } from './descriptionParagraphs';

describe('술 설명 문단 정리', () => {
  it('한 문단 설명은 그대로 한 문단이다', () => {
    expect(
      toDescriptionParagraphs('탈리스커 특유의 해양적 성격을 보여 줍니다.'),
    ).toEqual(['탈리스커 특유의 해양적 성격을 보여 줍니다.']);
  });

  it('공백만 있는 줄이 끼어 있어도 빈 줄에서 문단을 나눈다', () => {
    expect(
      toDescriptionParagraphs(
        '첫 문단입니다.\n\n \n\n둘째 문단입니다.\n\n[수상 내역]\n\n2020 Gold',
      ),
    ).toEqual([
      '첫 문단입니다.',
      '둘째 문단입니다.',
      '[수상 내역]',
      '2020 Gold',
    ]);
  });

  it('문단 안의 줄바꿈과 연속 공백은 공백 하나로 합친다', () => {
    expect(
      toDescriptionParagraphs(
        '14년 동안 숙성했으며, \n보르도 바리끄에서   마무리했습니다.\r\n잘 어울립니다.',
      ),
    ).toEqual([
      '14년 동안 숙성했으며, 보르도 바리끄에서 마무리했습니다. 잘 어울립니다.',
    ]);
  });

  it.each([null, undefined, '', '  \n \n\t '])(
    '설명이 없거나 공백뿐이면 비워 둔다 (%j)',
    (raw) => {
      expect(toDescriptionParagraphs(raw)).toBeUndefined();
    },
  );
});

describe('술 설명 문장 나누기', () => {
  it('문장 부호 뒤 공백에서 나누고 숫자 속 마침표는 그대로 둔다', () => {
    expect(
      toSentences('도수는 45.8%입니다. 정말요? 바다 향이 납니다!  끝'),
    ).toEqual(['도수는 45.8%입니다.', '정말요?', '바다 향이 납니다!', '끝']);
  });

  it('문장 부호가 없으면 문단 전체가 한 문장이다', () => {
    expect(toSentences('쉼표로만, 이어진 긴 설명')).toEqual([
      '쉼표로만, 이어진 긴 설명',
    ]);
  });
});
