import { getLegalDocument, parseFrontmatter } from './legalDocuments';

describe('parseFrontmatter', () => {
  it('frontmatter와 Markdown 본문을 분리한다', () => {
    const source = `---
title: 보틀노트 이용약관
status: draft
effectiveDate: null
---

# 이용약관
`;

    expect(parseFrontmatter(source)).toEqual({
      attributes: {
        title: '보틀노트 이용약관',
        status: 'draft',
        effectiveDate: null,
      },
      content: '# 이용약관\n',
    });
  });

  it('frontmatter가 없으면 전체 내용을 Markdown 본문으로 반환한다', () => {
    expect(parseFrontmatter('# 문서')).toEqual({
      attributes: {},
      content: '# 문서',
    });
  });

  it('닫히지 않은 frontmatter는 오류로 처리한다', () => {
    expect(() => parseFrontmatter('---\ntitle: 문서')).toThrow(
      'Legal document frontmatter is not closed.',
    );
  });

  it('마케팅 동의 문서를 불러온다', async () => {
    await expect(getLegalDocument('marketing-consent')).resolves.toMatchObject({
      metadata: {
        title: '보틀노트 마케팅 활용 및 광고성 정보 수신 동의',
        version: 'draft-2026-08-02',
        status: 'draft',
        effectiveDate: null,
      },
    });
  });

  it('개인정보 수집·이용 동의 문서를 불러온다', async () => {
    await expect(
      getLegalDocument('privacy-collection-use'),
    ).resolves.toMatchObject({
      metadata: {
        title: '보틀노트 개인정보 수집·이용 동의',
        version: 'draft-2026-08-02',
        status: 'draft',
        effectiveDate: null,
      },
    });
  });
});
