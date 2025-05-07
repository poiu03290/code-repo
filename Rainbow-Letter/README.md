# 🌈 Rainbow Letter (무지개편지)

이 레포지토리는 [무지개편지](https://rainbowletter.co.kr/) 프로젝트에서 **SEO 최적화, 편지 자동 저장 기능** 개선 사례를 담고 있습니다.

> ❗ 실제 운영중인 서비스의 내부 코드를 직접 공개할 수 없는 상황에서, 핵심 로직을 재현한 예제 코드를 통해 기술 역량을 보여주는 용도로 구성했습니다.

## 🌐 다국어 지원 및 SEO 최적화

### 🤯 문제 상황

- 자동 언어 선택 기능은 있으나 URL에 언어 구분이 없어 SEO 최적화에 한계
- 검색 엔진 크롤러가 각 언어별 콘텐츠를 구분하여 인덱싱하지 못하는 문제

### ✅ 개선 방향

- **언어별 URL 경로 구분** 도입

  - `/ko/`, `/en/` 형태로 URL 경로 구성하여 각 언어 버전을 명확히 구분
  - 검색 엔진 크롤러가 각 언어별 페이지를 독립적으로 인식할 수 있도록 설계

- **Next.js 미들웨어를 활용한 자동 리다이렉션**
  - 사용자의 브라우저 설정 언어에 기반한 적절한 URL로 자동 리다이렉션
  - 쿠키 기반 언어 설정 유지로 일관된 사용자 경험 제공

```typescript
// 브라우저 언어 감지 및 적절한 언어 경로로 리다이렉션
const lang =
  req.headers.get("accept-language")?.split(",")[0].split("-")[0] || "en";
const targetLocale = lang === "ko" ? "ko" : "en";

const res = NextResponse.redirect(
  new URL(`/${targetLocale}${pathname}`, req.url)
);
res.cookies.set("locale", targetLocale);
```

📄 [다국어 지원 미들웨어](./src/middleware.example.ts)

## 💾 편지 자동 저장 및 다중 탭 감지

### 🤯 문제 상황

- 편지 작성 중 과도한 서버 요청으로 인한 성능 저하 및 서버 부하 발생
- 동일 편지를 여러 탭에서 동시에 열어 수정할 경우 데이터 덮어쓰기 및 정합성 문제
- 사용자가 다중 탭 열람 시 어떤 탭의 내용이 최신인지 구분하기 어려움

### ✅ 개선 방향

- **디바운스 기반 자동 저장 최적화**
  - 타이핑 완료 후 3초 후에 저장 요청을 보내는 디바운스 로직 구현
  - 불필요한 서버 요청 50% 이상 감소로 성능 및 UX 향상

```typescript
// 3초 디바운스 적용된 자동 저장 로직
const autoSaveLetter = setTimeout(() => {
  saveLetterValue();
  clearTimeout(autoSaveLetter);
}, 3000);
```

- **세션 기반 다중 탭 감지 시스템**
  - `SessionStorage`와 서버의 세션 ID 비교를 통한 실시간 탭 충돌 감지
  - 5초 간격으로 세션 ID 검증하여 다중 탭 작성 시도 즉각 감지

```typescript
// 5초마다 다른 탭에서의 편집 여부 체크
const isCheckTabLive = setInterval(() => {
  if (selectedPet?.id) {
    compareSessionId();
  }
}, 5000);
```

- **충돌 감지 시 사용자 피드백**
  - 다중 탭 편집 시도 감지 시 모달 표시로 사용자에게 즉각적인 피드백 제공
  - 데이터 손실 방지를 위한 명확한 가이드 제공

📄 [편지 자동 저장 및 다중 탭 감지 로직](./src/write-letter.example.tsx)

## 📊 성과

- 서버 요청 빈도 50% 이상 감소로 백엔드 부하 경감 및 프론트엔드 성능 향상
- 다중 탭 감지 시스템 도입으로 데이터 손실 문제 해결 및 사용자 경험 개선
- 언어별 URL 구분으로 검색엔진 최적화 및 국제화 기반 마련
- 누적 사용자 7,300명 이상, 편지 제출 31,000건 돌파하는 서비스 안정성 기여
