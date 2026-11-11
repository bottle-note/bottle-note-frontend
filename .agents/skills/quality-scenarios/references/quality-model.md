# 품질 모델과 합격 기준

기능의 품질 시나리오와 합격 기준을 정할 때 참고한다. 어떤 특성을 볼지, 무엇을 잴지는 유저 시나리오를 보고 판단한다.

## 1. 품질 특성 (ISO/IEC 25010:2023)

- 기능 적합성: 완전성, 정확성, 적절성
- 성능 효율성: 시간 반응성, 자원 활용, 용량
- 호환성: 공존, 상호운용성
- 상호작용 역량: 인지 용이성, 학습성, 운용성, 사용자 오류 방지, 사용자 몰입, 포용성, 사용자 지원, 자기 서술성
- 신뢰성: 무결함성, 가용성, 장애 허용성, 복구성
- 보안성: 기밀성, 무결성, 부인 방지, 책임 추적성, 진위성, 저항성
- 유지보수성: 모듈성, 재사용성, 분석성, 수정 용이성, 시험성
- 유연성: 적응성, 확장성, 설치성, 대체성
- 안전성: 운영 제약, 위험 식별, 안전한 실패, 위험 경고, 안전한 통합

## 2. 표준 합격 기준 (고정값)

표준이 있는 영역은 이 값을 그대로 쓰고, 통과할 때까지 개선한다.

### 성능 (web.dev)

Lighthouse 모바일 측정값에 적용한다.

- LCP 2.5초 이하
- INP 200ms 이하 — PR에서는 TBT로 대체
- CLS 0.1 이하
- TBT 200ms 미만
- FCP 1.8초 이하
- TTFB 0.8초 이하
- Lighthouse 성능 점수 90 이상

### 접근성 (WCAG 2.2 Level A·AA)

WCAG 2.2 Level A·AA 중 기능에 해당하는 기준을 따른다. 어느 기준이 해당하는지는 유저 시나리오를 보고 판단하고, 내용은 원문을 따른다. 수치가 있는 기준은 아래와 같다.

- 1.4.3 Contrast (Minimum): 4.5:1, large text 3:1
- 1.4.4 Resize Text: 200%
- 1.4.10 Reflow: 320 CSS px
- 1.4.11 Non-text Contrast: 3:1
- 1.4.12 Text Spacing: line height 1.5, paragraph spacing 2, letter spacing 0.12, word spacing 0.16 (글자 크기 대비)
- 2.2.2 Pause, Stop, Hide: 5초
- 2.5.8 Target Size (Minimum): 24×24 CSS px

## 3. 표준이 없을 때 합격 기준

- Then을 화면이나 테스트에서 확인할 수 있는 사실로 바꾼 것이 합격 기준이다
  - 예) Then: 추천 API가 실패하면 추천 섹션만 숨기고 본문은 유지한다 → 합격 기준: 본문이 렌더링된다, 오류 화면이 0번 나온다
- 수치나 예/아니오로 판정할 수 있게 쓴다
- 4절의 PR 시점 측정 수단으로 확인할 수 있게 쓴다
- 그 수준을 고른 이유를 한 문장으로 적는다. 이유는 유저 시나리오에서 찾는다
  - 예) 추천은 보조 정보라서, 추천이 실패해도 사용자는 주류 정보를 계속 볼 수 있어야 한다

## 4. PR 시점 측정 수단

- 성능: Lighthouse 모바일 — LCP, TBT, CLS, FCP, TTFB, 성능 점수
- 기능·신뢰성·보안: RTL 테스트로 Then을 확인한다
- 접근성: Lighthouse 접근성 검사와 2절 수치 기준
- 유지보수성: lint, 타입 검사
- 이 수단으로 확인할 수 없는 것은 에이전트 리뷰(코드를 읽고 예/아니오 판정)나 수동(실제 환경 조작)으로 확인한다

## 출처

- web.dev: [LCP](https://web.dev/articles/lcp), [INP](https://web.dev/articles/inp), [CLS](https://web.dev/articles/cls), [FCP](https://web.dev/articles/fcp), [TTFB](https://web.dev/articles/ttfb), [TBT](https://web.dev/articles/tbt)
- [Lighthouse performance scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
