# 🌈 Rainbow Letter App (무지개편지 앱)

이 레포지토리는 [무지개편지](https://rainbowletter.co.kr/)의 React Native 앱 프로젝트에서 **웹뷰 환경 감지 및 처리**에 관한 개선 사례를 담고 있습니다.

## 📱 웹뷰 환경 감지 커스텀 훅 개발

- 정확히는 useIsWebview.ts의 코드는 rainbow-letter-web에 작성되어 있는 코드입니다!

### 🤯 문제 상황

- 웹뷰와 일반 브라우저 간 UI 분기 처리가 필요하나 정확한 환경 감지에 어려움 발생
- 특히 iOS에서는 Safari와 WebView가 동일한 WebKit 엔진을 사용하여 구분이 어려움
- Android에서는 WebView가 표준 식별자를 포함하지만, iOS에서는 명확한 구분이 없음
- 환경에 따른 UI 불일치로 사용자 경험 저하 및 개발 복잡성 증가

### ✅ 개선 방향

- **플랫폼별 특성을 고려한 감지 로직 구현**
  - Android: UserAgent에 `; wv)` 문자열이 있으면 WebView로 판단
  - iOS: Safari 브라우저만 UserAgent에 `safari` 문자열을 포함하므로, 이 문자열이 없으면 WebView로 간주

```typescript
const isIos =
  /ip(ad|hone|od)/.test(normalizedUserAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isAndroid = /android/.test(normalizedUserAgent);
const isSafari = /safari/.test(normalizedUserAgent);
const isWebview =
  (isAndroid && /; wv\)/.test(normalizedUserAgent)) || (isIos && !isSafari);
```

- **재사용 가능한 커스텀 훅으로 분리**
  - 앱 전체에서 재사용 가능한 `useIsWebview` 훅으로 구현

## 📊 성과

- 사용자 경험 향상: 각 환경에 최적화된 UI/UX 제공으로 사용자 만족도 개선
- 개발 효율성 증가: 환경 감지 로직 표준화로 개발 복잡성 감소 및 유지보수성 향상

📄 [웹뷰 환경 감지 커스텀 훅](./src/useIsWebview.example.ts)
