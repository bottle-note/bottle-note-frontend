# 로그인 이동 회귀 테스트

`pnpm test:e2e`는 Chrome에서 실제 앱 화면과 로그인 이동을 확인한다.
로컬 서버는 `127.0.0.1:3107`에 실행한다.

다음 흐름을 검증한다.

- 로그인 화면에서 취소하면 진입했던 설정 화면으로 복귀
- 잘못된 OAuth 콜백은 오류 화면으로 이동하고, 뒤로 돌아온 비로그인 사용자는 로그인 재시도 가능
- 실제 카카오 SDK 호출 전에 `/login` 기록을 returnTo 화면으로 교체
- SDK가 추가한 외부 인증 기록은 유지하고, 뒤로가면 returnTo의 실제 화면으로 복귀
- iOS user agent로 실행한 SDK의 카카오톡 연결 URL에서도 로그인 기록 교체
- 카카오 실패 콜백 이후에도 `/login` 기록 없이 returnTo로 복귀
- Navigation API가 없어도 내부 로그인 기록 교체
- returnTo의 쿼리와 해시를 보존하고, 실제 화면 복원
- SDK를 불러오지 못하면 returnTo 교체 전에 실패 처리

외부 이동 테스트는 카카오 인증 요청의 응답만 정적 화면 또는 실패 콜백으로 대체한다.
인증 세션과 앱 API는 모킹하지 않으며, 실제 카카오 SDK와 Chrome 히스토리를 사용한다.
Chrome DevTools Protocol의 `Page.getNavigationHistory`로 기록에 `/login`이 없는지 확인한다.
모바일 SDK 경로도 Chrome에서 검증하며, 실제 Safari와 기기의 카카오톡 앱 전환은 별도 확인이 필요하다.

로그인된 사용자의 `/login` 접근은 검증된 `returnTo`로 `replace`한다.
이 흐름의 브라우저 확인에는 실제 로그인 세션을 사용한다.
