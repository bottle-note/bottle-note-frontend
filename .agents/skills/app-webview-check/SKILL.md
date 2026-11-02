---
name: app-webview-check
description: 보틀노트 Flutter 앱(WebView)에 로컬 웹을 띄워 iOS 시뮬레이터·Android 에뮬레이터에서 앱 전용 동작을 확인한다. safe area, 키보드·자동 포커스, Android 뒤로 가기, 로그인·공유·사진 선택 브리지처럼 브라우저 검증으로는 결과를 알 수 없는 변경에 사용한다.
---

# 앱 WebView 확인

Playwright 브라우저 검증을 대신하지 않는다. 브라우저에서 확인할 수 있는 동작은 브라우저에서 확인하고, 이 절차는 **앱에서만 결과가 달라질 수 있는 변경**에만 쓴다.

## 언제 돌리나

돌린다:

- safe area·고정 영역: `pt-safe`, `pb-safe*`, `--safe-area-*`, `env(safe-area-inset-*)`, `SafeAreaScreen`, `SubHeader`, 하단 내비, `h-dvh`·`100vh` 같은 전체 화면 높이
- 키보드: `autoFocus`·`focus()`, 입력창이 있는 고정 하단 영역, `visualViewport`
- 뒤로 가기: 히스토리 조작(`router.replace`, `history.pushState`), 모달·바텀시트를 뒤로 가기로 닫는 흐름
- 앱 브리지: `src/utils/flutterUtil.ts`의 `openAlbum`, `openAlbumMultiple`, `openCamera`, `loginWithKakao`, `loginWithApple`, `share`, `triggerHaptic`, 그리고 `window.isInApp` 분기

돌리지 않는다: 문구·색·일반 레이아웃, API·쿼리 변경, 위 항목을 건드리지 않는 화면.

## 구성

- 앱 저장소: `~/eva/bottle-note-app`. **읽기만 하고 수정하지 않는다.** bundle id·package는 `com.bottlenote.official.app`이다.
- 앱이 불러올 웹은 로컬 개발 서버다. `USE_LOCAL_WEBVIEW=true`일 때 iOS는 `http://localhost:3000/`, Android는 `http://10.0.2.2:3000/`을 연다(`lib/utils/env/env.dart`).
- 기기 조작은 Orca 내장 `orca emulator`를 쓴다(`orca skills get orca-emulator`, `orca skills get orca-emulator-android`). 탭·입력·하드웨어 버튼·접근성 트리를 지원하고, 스크린샷 기능은 없다.
- 디버그 빌드는 WebView를 검사할 수 있다(`isInspectable: !kReleaseMode`). Android는 CDP로 DOM을 직접 읽을 수 있다. iOS는 Safari Web Inspector로 사람이 볼 수 있지만, 에이전트는 스크린샷과 접근성 트리로 판단한다.

### safe area 구조

판정하려면 앱과 웹이 safe area를 어떻게 나눠 맡는지 알아야 한다.

- **iOS 앱**: WebView가 화면 끝까지 그린다. 웹의 `env(safe-area-inset-*)`가 상태 표시줄과 홈 인디케이터 높이를 준다(일반 Safari와 같음).
- **Android 앱**: 앱이 WebView 바깥에 시스템 바 높이만큼 네이티브 padding을 준다(`lib/web_view/web_view.dart`의 `webViewPadding`). WebView 안에서 `env()`는 0이다. 앱은 주입 스크립트로 `.pt-safe-header { padding-top: 0 }`과 `--navbar-margin-bottom: 8px`만 덮어쓴다.
- **웹**: `src/lib/SafeAreaProvider.tsx`가 `window.isInApp && Android`이면 `--android-safe-area-top/bottom`을 24px로 설정한다. `--safe-area-top/bottom`은 `max(env(), var(--android-safe-area-*))`이다.

따라서 Android 앱에서는 네이티브 padding이 이미 있기 때문에, 웹 내용이 `--safe-area-*`만큼 더 밀려나면 여백이 이중으로 들어간다. iOS 앱에서는 safe area를 쓰지 않은 헤더가 상태 표시줄에 가려진다. 같은 화면을 iOS·Android 양쪽에서 보고 **main과 PR 브랜치를 비교**한다.

## 준비

1. **웹 개발 서버**: 이 저장소에서 확인할 브랜치를 체크아웃하고 `pnpm dev`로 :3000에 띄운다.
   - 새 워크트리라면 메인 체크아웃의 `.env`, `.env.development`, `.env.local`을 심볼릭 링크로 건다. 내용은 출력하지 않는다(특히 Warpgate 티켓).
   - 백그라운드 실행에서 pnpm이 `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`로 멈추면 먼저 `CI=true pnpm install --frozen-lockfile`을 실행한다.
   - 서버를 띄운 채 브랜치를 바꿔도 된다. 다만 앱 WebView는 직접 새로고침해야 한다(아래 「브랜치 전환」).
2. **기기**: iOS는 `xcrun simctl list devices booted`로 확인한다(없으면 `orca emulator attach "iPhone 15 Pro"`). Android는 `~/Library/Android/sdk/emulator/emulator -avd Pixel_9 &`로 부팅한 뒤 `adb devices`로 확인한다.
3. **앱 빌드·설치**: 앱 저장소에서 실행한다. 웹 변경만 확인할 때는 앱을 다시 빌드할 필요가 없고, 이미 설치된 디버그 앱을 그대로 쓴다.

   ```sh
   cd ~/eva/bottle-note-app
   # 사람이 직접 볼 때 (대화형, hot reload): 기기가 여러 대면 실행할 기기를 묻는다
   make run-local
   # 에이전트: 같은 dart-define으로 빌드한 뒤 설치
   fvm flutter build apk --debug --dart-define=FLAVOR=dev --dart-define=USE_LOCAL_WEBVIEW=true
   fvm flutter build ios --simulator --debug --dart-define=FLAVOR=dev --dart-define=USE_LOCAL_WEBVIEW=true   # 첫 빌드는 10분 이상
   orca emulator install build/app/outputs/flutter-apk/app-debug.apk --reinstall --device emulator-5554 --json
   orca emulator launch com.bottlenote.official.app --device emulator-5554 --json
   xcrun simctl install <udid> build/ios/iphonesimulator/Runner.app
   xcrun simctl launch <udid> com.bottlenote.official.app
   ```

   `.env`·`env.g.dart`가 없으면 `make setup`이 필요하다. 이건 사용자에게 맡기고 비밀값은 출력하지 않는다.

4. **첫 실행 팝업**: iOS 알림 권한 팝업이 화면을 가린다. `orca emulator ax`로 버튼 위치를 찾아 닫는다.

## 조작과 관찰

모든 `orca emulator` 좌표는 화면 기준 0..1이다. 기기가 둘 다 켜져 있으면 명령마다 `--device`를 붙인다.

```sh
orca emulator ax --device <id> --json                  # 요소 label과 frame(0..1) → 중심을 탭
orca emulator tap <x> <y> --device <id> --json
orca emulator type "glen" --device <id> --json         # US-ASCII만
orca emulator button back --device emulator-5554 --json
# 스크린샷 (Read로 볼 때는 sips -Z 900으로 줄인다)
adb -s emulator-5554 exec-out screencap -p > shot.png
xcrun simctl io <udid> screenshot shot.png
```

**Android CDP**: WebView 안의 값을 직접 읽는다.

```sh
ADB=~/Library/Android/sdk/platform-tools/adb
SOCK=$($ADB -s emulator-5554 shell cat /proc/net/unix | grep -o 'webview_devtools_remote_[0-9]*' | head -1)
$ADB -s emulator-5554 forward tcp:9222 localabstract:$SOCK
node .agents/skills/app-webview-check/scripts/cdp-eval.mjs 9222 .agents/skills/app-webview-check/scripts/safe-area.js
node .agents/skills/app-webview-check/scripts/cdp-eval.mjs 9222 "location.pathname"
```

웹 좌표를 화면 좌표로 바꿀 때는 `ax`에서 `android.webkit.WebView` 노드의 픽셀 bounds를 기준으로 쓴다.
`x = 웹x × dpr / 화면폭px`, `y = (WebView top px + 웹y × dpr) / 화면높이px`.

**브랜치 전환**: 웹 브랜치를 바꾼 뒤에는 Android에서 `cdp-eval.mjs 9222 "location.reload()"`를 실행한다. iOS에서는 `xcrun simctl terminate` 후 `launch`로 앱을 다시 실행하고 탭으로 화면에 들어간다.

## 확인 항목

결과는 기기·브랜치·화면별로 스크린샷을 남기고, Android는 `safe-area.js` 수치를 함께 기록한다.

- **safe area**: 바뀐 화면을 main과 PR 브랜치에서 iOS·Android 각각 확인한다.
  - iOS: 헤더와 닫기 버튼이 상태 표시줄·다이내믹 아일랜드 아래에 있는지, 하단 버튼이 홈 인디케이터에 겹치지 않는지 본다.
  - Android: `envTop/envBottom`은 0이다. 이 상태에서 `firstHeaderTop`이나 하단 고정 요소의 padding에 `safeAreaTop/Bottom`(24px)이 더해지면 이중 여백이다.
- **키보드·자동 포커스**:
  - Android: `activeElement`가 입력창인지 확인하고, `adb shell dumpsys input_method | grep mInputShown`이 true인지, `innerHeight`가 줄었는지 본다. 입력창과 결과가 키보드에 가리지 않는지 스크린샷으로 확인한다.
  - iOS: **시뮬레이터는 기본으로 하드웨어 키보드가 연결돼 있어서**, 사용자 제스처 밖의 `focus()`도 성공한 것처럼 보인다(캐럿과 `< > Done` 바가 보임). 판정 전에 Simulator 메뉴 I/O ▸ Keyboard ▸ Connect Hardware Keyboard(⇧⌘K)를 꺼서 실제 기기 조건으로 다시 본다. 이 조건에서는 키보드가 올라와야 통과다. 끝나면 설정을 원래대로 돌린다. 대조군으로 입력창을 직접 탭해 키보드가 뜨는지도 본다.
- **Android 뒤로 가기**: 앱은 `canGoBack`이면 `goBack`, 아니면 앱을 종료한다(`lib/actions/back_action_handler.dart`). 키보드가 열려 있으면 첫 번째 back은 키보드만 닫는다. 화면마다 back 이후의 `location.pathname`을 기록하고, 히스토리가 쌓이거나 앱이 예기치 않게 종료되지 않는지 본다.
- **로그인**: 우회하거나 목킹하지 않는다. 카카오·Apple 로그인이 필요하면 사용자에게 앱에서 직접 로그인해 달라고 요청하고 기다린다. 시뮬레이터에서 Apple 로그인은 기기 Apple ID에 따라 막힐 수 있으니, 못 했으면 못 했다고 적는다.
- **공유·사진 선택**:
  - 공유 시트와 앨범·카메라가 뜨는지까지 확인한다. 시뮬레이터 카메라는 확인할 수 없다.
  - Android 권한은 `orca emulator permissions grant com.bottlenote.official.app <permission>`으로 준다.
  - iOS 앨범에 사진이 없으면 `xcrun simctl addmedia <udid> <image>`로 넣는다.

## 함정

- `xcrun simctl openurl`로 localhost를 열면 앱이 아니라 **Safari**가 열린다. 화면 왼쪽 위에 `◀ BottleNote`가 보이면 Safari다. 앱에서는 탭으로 이동한다.
- adb가 잠깐 `device offline`이 되면 `adb forward`가 사라진다. CDP에서 `ECONNREFUSED`가 나면 소켓을 찾아 다시 forward한다. 앱을 다시 실행하면 소켓 pid도 바뀐다.
- `orca emulator ax` 결과는 수백 줄이다. 파일로 저장한 뒤 label을 grep한다.
- Simulator 메뉴의 체크 표시(`AXMenuItemMarkChar`)는 클릭 직후 바로 갱신되지 않는다. 키보드 연결 상태는 `defaults read com.apple.iphonesimulator`의 해당 udid `ConnectHardwareKeyboard`로 확인한다.
- 끝나면 `orca emulator kill`로 helper를 정리하고 :3000 서버를 끈다.

## 보고

- 기기(iOS 시뮬레이터 모델·iOS 버전, Android AVD·API), 웹 브랜치·커밋, 앱 저장소 커밋을 적는다.
- 항목마다 확인함 / 문제 발견 / 확인 못 함(이유)으로 구분한다. 시뮬레이터 결과를 실제 기기 결과로 쓰지 않는다.
- 문제가 웹과 앱의 역할 분담(예: Android safe area 이중 적용)에서 생긴 경우, 웹에서 고칠지 앱 주입 스크립트에서 고칠지는 혼자 정하지 않는다. 근거 수치와 스크린샷을 붙여 사용자와 논의한다.
