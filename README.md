# LAB-BRIDGE

외국인 연구자가 한국 R&D 공고를 찾고, 연구계획서를 작성하며, 연구자·기관과 연결될 수 있도록 돕는 Next.js 기반 플랫폼입니다.

## 주요 기능

- 실제 R&D 공고 통합 검색과 프로필 기반 추천
- 한국어·영어·중국어·일본어·베트남어 UI
- DOCX/HWP/HWPX 업로드 및 ONLYOFFICE 웹 편집
- OpenAI 기반 연구개발계획서 검토와 피드백 저장
- Firebase 이메일 인증과 연구자 프로필
- 연구자·기관 매칭 및 크라우드 펀딩 UI

## 실행

```bash
npm install
npm run dev
```

`.env.local`에 다음 값을 설정해야 합니다.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
OPENAI_API_KEY=
OPENAI_MODEL=
```

문서 웹 편집 기능은 로컬의 ONLYOFFICE Document Server(`http://localhost:8080`)가 필요합니다.

## 보안

`.env.local`과 사용자가 업로드한 `data/documents` 파일은 Git에서 제외됩니다.
