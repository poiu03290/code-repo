# 🔊 SLP Viewer

이 레포지토리는 서강 SLP 프로젝트에서 **브라우저 간 오디오 자동 재생 정책 문제를 해결한 개선 사례**를 담고 있습니다.

> ❗ 회사 내부 코드를 직접 공개할 수 없는 상황에서, 핵심 로직을 재현한 예제 코드를 통해 기술 역량을 보여주는 용도로 구성했습니다.

## 🤯 문제 상황

- **자동 재생 정책**: 대부분의 최신 브라우저에서는 사용자 인터랙션 없이 오디오 자동 재생을 제한함(https://developer.chrome.com/blog/autoplay?hl=ko)
- **iOS 특화 이슈**: 특히 iOS/Safari 환경에서는 오디오 컨텍스트 'unlock' 문제가 발생(**경험상 아이패드 미니/아이패드 6세대에서 발생**)

## ✅ 개선 방향

### 1. **브라우저 정책 우회 전략**

- 오디오 언락(unlock) 이벤트를 활용한 재생 보장

```jsx
onplayerror: function () {
  if (isPlaying) return;
  sound.once("unlock", function () {
    sound.play();
    setIsPlaying(true);
  });
}
```

### 2. **시퀀셜 오디오 재생 구현**

- 여러 오디오 파일을 순차적으로 재생하는 로직 구현
- 각 오디오 파일 재생 완료 시 다음 파일로 자동 이동하는 시스템 구축

## 📊 성과

- 모든 주요 브라우저(Chrome, Safari, Firefox, Edge)에서 안정적인 오디오 재생 지원
- iOS 태블릿 환경에서 오디오 unlock 문제 해결로 사용자 이탈 방지
- 사용자 인터랙션 없이도 학습 과정에 필요한 오디오 자동 재생 보장

📄 [오디오 플레이어 코드](./src/audio.example.jsx)
